import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import Prisma client

export async function PATCH(request: NextRequest) {
      try {

            // 2. Get Params and Body


            const body = await request.json();
            const publicId = body.appointment_id;
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
            if (status === 'confirmed') {

                  // if (existingAppointment.status === 'confirmed') {
                  //       return NextResponse.json({ message: "Appointment is already confirmed" }, { status: 400 });
                  // }

                  const updated = await prisma.appointments.update({
                        where: { public_id: publicId },
                        data: { status: 'confirmed', updated_at: new Date() },
                  });

                  return NextResponse.json({ message: "Appointment confirmed successfully", appointment: updated });
            }



            // If no actionable data sent
            return NextResponse.json({ message: "No valid update data provided" }, { status: 400 });

      } catch (error) {
            console.error("UPDATE_APPOINTMENT_ERROR:", error);
            return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
      }
}