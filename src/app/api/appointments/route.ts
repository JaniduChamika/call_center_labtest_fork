import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma'; 
import { generatePublicId } from '@/lib/utils';
import { sendAppointmentEmail } from './send-email/actions';
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

// --- GET: Fetch Appointments ---
export async function GET(request: NextRequest) {
  try {
    // 1. Check Authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized: Please log in" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // 2. Pagination & Filters
    const page = searchParams.get('page') ?? '1';
    const limit = searchParams.get('limit') ?? '10';
    
    const appointmentPublicID = searchParams.get('id');
    const date = searchParams.get('date');
    const doctorId = searchParams.get('doctor');
    const hospitalPublicId = searchParams.get('hospital');
    const patientSearch = searchParams.get('search');
    const viewMode = searchParams.get('view-mode') ?? 'all';

    // 3. Parse Numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 4. Build Database Query
    const whereConditions: Prisma.appointmentsWhereInput[] = [];

    // Date Filter
    if (date) {
      const dayStart = new Date(`${date}T00:00:00+05:30`);
      const dayEnd = new Date(`${date}T23:59:59+05:30`);
      whereConditions.push({
        start_time: { gte: dayStart, lte: dayEnd },
      });
    }

    // View Mode Filter
    const now = new Date();
    if (viewMode === 'previous') {
      whereConditions.push({ start_time: { lt: now } });
    } else if (viewMode === 'current') {
      whereConditions.push({ end_time: { gte: now } });
    }

    // Exact ID Filters
    if (doctorId) whereConditions.push({ doctors: { public_id: doctorId } });
    if (hospitalPublicId) whereConditions.push({ hospitals: { public_id: hospitalPublicId } });
    if (appointmentPublicID) whereConditions.push({ public_id: appointmentPublicID });

    // Text Search Filter
    if (patientSearch) {
      whereConditions.push({
        patients: {
          OR: [
            { name: { contains: patientSearch, mode: 'insensitive' } },
            { phone_number: { contains: patientSearch } },
            { email: { contains: patientSearch, mode: 'insensitive' } },
            { nic: { contains: patientSearch, mode: 'insensitive' } },
          ],
        },
      });
    }

    const whereClause: Prisma.appointmentsWhereInput = { AND: whereConditions };

    // 5. Execute Query
    const [appointments, totalCount] = await prisma.$transaction([
      prisma.appointments.findMany({
        where: whereClause,
        include: {
          doctors: true,
          hospitals: true,
          patients: true,
        },
        orderBy: viewMode === 'previous' ? { start_time: 'desc' } : { start_time: 'asc' },
        take: limitNum,
        skip: skip,
      }),
      prisma.appointments.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return NextResponse.json({
      message: 'Appointments retrieved successfully',
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        pageSize: limitNum,
      },
      appointments,
    });

  } catch (error: any) {
    console.error('GET_APPOINTMENTS_ERROR:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// --- POST: Create Appointment ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { patient_id, patient_details, appointment } = body;

    // 1. Validation
    if (!appointment?.doctor_id || !appointment?.hospital_id || !appointment?.start_time) {
      return NextResponse.json({ message: 'Missing appointment details' }, { status: 400 });
    }

    const apptStartTime = new Date(appointment.start_time);
    
    // Validate Date Object
    if (isNaN(apptStartTime.getTime())) {
         return NextResponse.json({ message: 'Invalid start time provided' }, { status: 400 });
    }

    const apptEndTime = new Date(apptStartTime.getTime() + 10 * 60000); 

    // 2. Transaction (Create/Update Patient -> Create Appointment)
    const createdAppointment = await prisma.$transaction(async (tx) => {
        let patientIdToUse: bigint;

        // SCENARIO A: Admin selected an existing patient ID manually
        if (patient_id) {
            patientIdToUse = BigInt(patient_id);
        } 
        // SCENARIO B: Guest/New Patient (The common flow)
        else {
             if (!patient_details?.nic) throw new Error("NIC required for patient");
             
             // ✅ FIX: Use 'upsert' to handle both New and Returning patients correctly
             // 
             const patient = await tx.patients.upsert({
                 where: { 
                     nic: patient_details.nic 
                 },
                 // IF EXISTS: Update their details (Fixes your "not inserting" issue)
                 update: {
                     name: patient_details.name,
                     phone_number: patient_details.phone_number,
                     email: patient_details.email || null,
                 },
                 // IF NEW: Create them
                 create: {
                     name: patient_details.name,
                     phone_number: patient_details.phone_number,
                     email: patient_details.email || null,
                     nic: patient_details.nic
                 }
             });
             patientIdToUse = patient.patient_id;
        }

        return await tx.appointments.create({
            data: {
                public_id: generatePublicId(),
                patient_id: patientIdToUse,
                doctor_id: BigInt(appointment.doctor_id),
                hospital_id: BigInt(appointment.hospital_id),
                start_time: apptStartTime,
                end_time: apptEndTime,
                status: 'pending_payment',
                payment_link: `https://pay.gateway.lk/pay/${crypto.randomUUID()}`,
            },
            include: { patients: true }
        });
    });

    // 3. Send Email (Non-blocking)
    if (createdAppointment.public_id) {
       try {
         await sendAppointmentEmail(createdAppointment.public_id);
       } catch (emailError) {
         console.error("Email sending failed (Appointment still created):", emailError);
       }
    }

    return NextResponse.json({ 
        message: 'Appointment created successfully', 
        appointment: createdAppointment 
    }, { status: 201 });

  } catch (error: any) {
    console.error('CREATE_APPOINTMENT_ERROR:', error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}