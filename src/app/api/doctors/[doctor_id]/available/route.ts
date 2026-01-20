// app/api/doctors/[doctor_id]/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


type RouteParams = {
      params: Promise<{
            doctor_id: string;
      }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
      try {
            // 1. Get all parameters
            const resolvedParams = await params;
            const publicId = resolvedParams.doctor_id;

            const searchParams = request.nextUrl.searchParams;
            const date = searchParams.get('date'); // Expects "YYYY-MM-DD"
            const hospitalPubId = searchParams.get('hospital');

            // 2. Validate inputs
            if (!date || !hospitalPubId) {
                  return NextResponse.json(
                        { message: 'Missing required fields: date and hospital_Public_id' },
                        { status: 400 }
                  );
            }


            // 3. Find the doctor's general schedule for that day

            // We parse the date like this to avoid timezone issues.
            // This creates a date at noon in the server's local timezone (+05:30).
            const [year, month, day] = date.split('-').map(Number);
            const queryDate = new Date(year, month - 1, day, 12, 0, 0);

            const dayOfWeek = queryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

            const schedule = await prisma.doctor_schedules.findFirst({
                  where: {
                        hospitals: { public_id: hospitalPubId },
                        doctors: { public_id: publicId },
                        day_of_week: dayOfWeek,
                        // Optional: Check if the date is within the schedule's validity
                        // valid_from: { lte: queryDate },
                        // valid_until: { gte: queryDate, or: null },
                  },
                  include: {
                        doctors: true, // We need the doctor_id
                        hospitals: true,
                  },
            });

            // 4. If no schedule, return empty
            if (!schedule) {
                  return NextResponse.json({
                        message: 'No available slots. The doctor is not scheduled for this day.',
                        slots: [],
                  });
            }

            // 5. Get all existing appointments for that doctor on that day
            // We need to check for the *entire* day, from start to end
            const dayStart = new Date(queryDate);
            dayStart.setHours(0, 0, 0, 0); // Start of the day (00:00)
            const dayEnd = new Date(queryDate);
            dayEnd.setHours(23, 59, 59, 999); // End of the day (23:59)

            const bookedAppointments = await prisma.appointments.findMany({
                  where: {
                        doctor_id: schedule.doctor_id, // Use the internal doctor_id
                        hospitals: { public_id: hospitalPubId },
                        start_time: {
                              gte: dayStart, // Greater than or equal to start of day
                              lte: dayEnd,   // Less than or equal to end of day
                        },
                        status: {
                              notIn: ['cancelled'], // Ignore cancelled appointments
                        },
                  },
            });

            // 6. Generate 10-minute slots
            const allSlots = [];
            const slotDuration = 10; // 10 minutes

            // Create the start time for the schedule on the *query date*
            // We use getUTCHours/Minutes because Prisma stores TIME as a '1970-01-01T...' UTC date
            const scheduleStartTime = new Date(queryDate);
            scheduleStartTime.setHours(
                  schedule.start_time.getUTCHours(),
                  schedule.start_time.getUTCMinutes(),
                  0, 0
            );

            const scheduleEndTime = new Date(queryDate);
            scheduleEndTime.setHours(
                  schedule.end_time.getUTCHours(),
                  schedule.end_time.getUTCMinutes(),
                  0, 0
            );

            let currentSlotTime = new Date(scheduleStartTime.getTime());

            // Loop until the *next* slot would start at or after the end time
            while (currentSlotTime < scheduleEndTime) {
                  const slotStart = new Date(currentSlotTime.getTime());
                  const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

                  // Ensure the slot doesn't go past the schedule's end time
                  if (slotEnd > scheduleEndTime) {
                        break;
                  }

                  allSlots.push({
                        start: slotStart,
                        end: slotEnd,
                        status: 'Available', // Default status
                  });

                  currentSlotTime = slotEnd; // Move to the next 10-minute block
            }

            // 7. Mark "Reserved" slots
            const now = new Date(); // Current time

            for (const slot of allSlots) {
                  // Check if the slot is in the past
                  if (slot.start < now) {
                        slot.status = 'Overdue';
                        continue; // No need to check bookings if it's in the past
                  }

                  // Check for overlap with any booked appointments
                  for (const booking of bookedAppointments) {
                        // Overlap logic: (SlotStart < BookingEnd) AND (SlotEnd > BookingStart)
                        if (slot.start < booking.end_time && slot.end > booking.start_time) {
                              slot.status = 'Reserved';
                              break; // Move to the next slot
                        }

                  }
            }

            // 8. Format the final response
            const formatTime = (date: Date): string => {
                  // Use Sri Lankan locale, 24-hour format
                  return date.toLocaleTimeString('si-LK', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Colombo',
                  });
            };

            const formattedSlots = allSlots.map(slot => ({

                  start_time: formatTime(slot.start),
                  end_time: formatTime(slot.end),

                  status: slot.status,
            }));

            return NextResponse.json({
                  message: 'Availability retrieved successfully',
                  doctor: schedule.doctors,
                  hospital: schedule.hospitals,
                  slots: formattedSlots,

            });

      } catch (error) {
            console.error('GET_AVAILABILITY_ERROR:', error);
            return new NextResponse('Internal Server Error', { status: 500 });
      }
}