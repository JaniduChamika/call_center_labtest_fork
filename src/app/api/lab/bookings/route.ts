import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { sendLabBookingEmail } from '@/lib/emailService';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient, testId, labId, date, time } = body;

    const booking = await prisma.labBooking.create({
      data: {
        patient_name: patient.name,
        patient_phone: patient.phone,
        patient_age: parseInt(patient.age),
        patient_gender: patient.gender,
        lab_test_id: testId,
        lab_id: labId, // Saving the Lab ID
        booking_date: new Date(date),
        booking_time: time,
        status: 'PENDING'
      },
      include: { lab_test: true, laboratory: true }
    });

    // Send Email
    if (patient.email) {
       await sendLabBookingEmail(patient.email, {
          public_id: booking.public_id,
          patient_name: booking.patient_name,
          testName: booking.lab_test.name,
          labName: booking.laboratory?.name || "Main Lab",
          booking_date: booking.booking_date,
          booking_time: booking.booking_time
       });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await prisma.labBooking.findMany({
      include: { lab_test: true, laboratory: true },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
// Add this NEW function to handle Status Updates
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const updatedBooking = await prisma.labBooking.update({
      where: { id },
      data: { status },
      include: {
        lab_test: true,
        laboratory: true
      }
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}