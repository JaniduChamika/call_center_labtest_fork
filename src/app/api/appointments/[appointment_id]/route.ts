// app/api/appointments/[appointment_public_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import Prisma client

// Fix for JSON.stringify failing on BigInt (for all IDs)
(BigInt.prototype as any).toJSON = function () {
      return this.toString();
};

// Define the type for the dynamic route parameter
type RouteParams = {
      params: Promise<{
            appointment_id: string;
      }>;
};

// --- GET A SINGLE APPOINTMENT BY ITS PUBLIC ID ---
export async function GET(request: NextRequest, { params }: RouteParams) {
      try {
            // 1. Get the public_id from the URL
            const resolvedParams = await params;
            const publicId = resolvedParams.appointment_id;

            // 2. Find the unique appointment
            const appointment = await prisma.appointments.findUnique({
                  where: {

                        public_id: publicId,
                  },
                  // 3. Include all related details
                  include: {
                        doctors: true,
                        hospitals: true,
                        patients: true,
                  },
            });

            // 4. If not found, return a 404
            if (!appointment) {
                  return NextResponse.json(
                        { message: 'Appointment not found' },
                        { status: 404 }
                  );
            }

            // 5. Return the successful response
            return NextResponse.json({
                  message: 'Appointment retrieved successfully',
                  appointment: appointment,
            });

      } catch (error) {
            console.error('GET_APPOINTMENT_BY_ID_ERROR:', error);
            return new NextResponse('Internal Server Error', { status: 500 });
      }
}
// --- PATCH: Handle Canceling AND Rescheduling ---
export async function PATCH(request: NextRequest, { params }: RouteParams) {
      try {

            // 2. Get Params and Body
            const resolvedParams = await params;
            const publicId = resolvedParams.appointment_id;
            const body = await request.json();

            // Data we might receive
            const { status, start_time, end_time, doctor_id, hospital_id } = body;

            // 3. Fetch the Existing Appointment
            const existingAppointment = await prisma.appointments.findUnique({
                  where: { public_id: publicId },
            });

            if (!existingAppointment) {
                  return NextResponse.json({ message: "Appointment not found" }, { status: 404 });
            }

            // --- SCENARIO A: CANCELLATION (Status Change) ---
            if (status === 'cancelled') {

                  if (existingAppointment.status === 'cancelled') {
                        return NextResponse.json({ message: "Appointment is already cancelled" }, { status: 400 });
                  }

                  const updated = await prisma.appointments.update({
                        where: { public_id: publicId },
                        data: { status: 'cancelled', updated_at: new Date() },
                  });

                  return NextResponse.json({ message: "Appointment cancelled successfully", appointment: updated });
            }

            // --- SCENARIO B: RESCHEDULING (Editing Details) ---
            if (start_time && end_time) {

                  // 1. Prepare new values (use existing if not provided in body)
                  const newStartTime = new Date(start_time);
                  const newEndTime = new Date(end_time);
                  const targetDoctorId = doctor_id ? BigInt(doctor_id) : existingAppointment.doctor_id;
                  const targetHospitalId = hospital_id ? BigInt(hospital_id) : existingAppointment.hospital_id;

                  // 2. Validate Time Logic
                  if (newStartTime < new Date()) {
                        return NextResponse.json({ message: "Cannot reschedule to a past time." }, { status: 400 });
                  }
                  if (newEndTime <= newStartTime) {
                        return NextResponse.json({ message: "End time must be after start time." }, { status: 400 });
                  }

                  // 3. Validate Doctor's Schedule
                  const dayOfWeek = newStartTime.getDay();
                  const schedule = await prisma.doctor_schedules.findFirst({
                        where: {
                              doctor_id: targetDoctorId,
                              hospital_id: targetHospitalId,
                              day_of_week: dayOfWeek,
                        },
                  });

                  if (!schedule) {
                        return NextResponse.json({ message: "The doctor is not scheduled on this day/hospital." }, { status: 400 });
                  }

                  // Compare time against schedule
                  const schedStartTime = new Date(newStartTime);
                  schedStartTime.setHours(schedule.start_time.getUTCHours(), schedule.start_time.getUTCMinutes(), 0, 0);

                  const schedEndTime = new Date(newStartTime);
                  schedEndTime.setHours(schedule.end_time.getUTCHours(), schedule.end_time.getUTCMinutes(), 0, 0);

                  if (newStartTime < schedStartTime || newEndTime > schedEndTime) {
                        return NextResponse.json({ message: "Time is outside doctor's scheduled hours." }, { status: 400 });
                  }

                  // 4. Check for Conflicts (Double Booking)
                  // ⚠️ CRITICAL: Exclude the *current* appointment ID from the check!
                  const overlap = await prisma.appointments.findFirst({
                        where: {
                              doctor_id: targetDoctorId,
                              status: { notIn: ['cancelled'] }, // Ignore cancelled apps
                              appointment_id: { not: existingAppointment.appointment_id }, // <-- EXCLUDE SELF
                              AND: [
                                    { start_time: { lt: newEndTime } },
                                    { end_time: { gt: newStartTime } },
                              ],
                        },
                  });

                  if (overlap) {
                        return NextResponse.json({ message: "This time slot is already booked." }, { status: 409 });
                  }

                  // 5. Apply the Update
                  const updated = await prisma.appointments.update({
                        where: { public_id: publicId },
                        data: {
                              start_time: newStartTime,
                              end_time: newEndTime,
                              doctor_id: targetDoctorId,
                              hospital_id: targetHospitalId,
                              updated_at: new Date(),
                              // If it was cancelled, maybe set it back to pending/confirmed?
                              // For now, let's keep status unless explicitly changed, 
                              // OR force it to pending_payment if logic dictates.
                              // status: 'pending_payment' 
                        },
                  });

                  return NextResponse.json({ message: "Appointment rescheduled successfully", appointment: updated });
            }

            // If no actionable data sent
            return NextResponse.json({ message: "No valid update data provided" }, { status: 400 });

      } catch (error) {
            console.error("UPDATE_APPOINTMENT_ERROR:", error);
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
      }
}