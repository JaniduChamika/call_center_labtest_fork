// app/api/doctors/[doctor_id]/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ⭐️ Import our new Prisma client
import { Prisma } from '@/generated/prisma'; // Import Prisma type for 'where'


// Define the type for the dynamic route parameter
type RouteParams = {
      params: Promise<{
            doctor_id: string;
      }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
      try {
            // 1. Get the doctor's public_id from the URL
            const resolvedParams = await params;
            const publicId = resolvedParams.doctor_id;

            // 2. Get pagination parameters from the query string
            const searchParams = request.nextUrl.searchParams;
            const page = searchParams.get('page') || '1';
            const limit = searchParams.get('limit') || '10';

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            // 3. Define the 'where' clause to find schedules
            // by the doctor's public_id (a relational filter)
            const whereClause: Prisma.doctor_schedulesWhereInput = {
                  doctors: {
                        // Assuming your 'doctors' table has a 'public_id' field
                        // and your 'doctor_schedules' model has a 'doctors' relation.
                        public_id: publicId,
                  },
            };
            const doctor = await prisma.doctors.findMany({
                  where: {
                        public_id: publicId,
                  },

            });
            // 4. Run the queries in parallel for efficiency
            const [schedules, totalCount] = await prisma.$transaction([
                  // Query 1: Get the schedules for the current page
                  prisma.doctor_schedules.findMany({
                        where: whereClause,
                        include: {
                              hospitals: true, // Include the hospital details
                        },
                        // Sort by day of week, then by start time
                        orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }],
                        take: limitNum,
                        skip: skip,
                  }),

                  // Query 2: Get the total count of schedules for this doctor
                  prisma.doctor_schedules.count({
                        where: whereClause,
                  }),
            ]);

            // 5. Calculate total pages
            const totalPages = Math.ceil(totalCount / limitNum);
            const daysOfWeek = [
                  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
            ];

            const formattedSchedules = schedules.map(schedule => {
                  // Helper to format time-only Date objects
                  // We use getUTC...() because the 'Z' in '...T14:00:00.000Z' means UTC.
                  const formatTime = (dateObj: Date): string => {
                        const hours = dateObj.getUTCHours().toString().padStart(2, '0');
                        const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
                        return `${hours}:${minutes}`;
                  };

                  // Helper to format date-only Date objects
                  const formatDate = (dateObj: Date | null): string | null => {
                        if (!dateObj) return null;
                        // .toISOString() gives 'YYYY-MM-DDTHH:mm:ss.sssZ'
                        // .split('T')[0] gives just 'YYYY-MM-DD'
                        return dateObj.toISOString().split('T')[0];
                  };

                  return {
                        ...schedule, // Keep all original data
                        hospitals: schedule.hospitals, // Keep the nested hospital object

                        // --- Overwrite fields with formatted values ---
                        day_of_week: daysOfWeek[schedule.day_of_week],
                        start_time: formatTime(schedule.start_time),
                        end_time: formatTime(schedule.end_time),
                        valid_from: formatDate(schedule.valid_from),
                        valid_until: formatDate(schedule.valid_until),
                  };
            });
            // 6. Return the response
            return NextResponse.json({
                  message: `Schedules for doctor ${publicId}`,
                  doctor: doctor,
                  schedules: formattedSchedules,
                  pagination: {
                        totalCount: totalCount,
                        totalPages: totalPages,
                        currentPage: pageNum,
                        pageSize: limitNum,
                  },
            });
      } catch (error) {
            console.error('GET_SCHEDULE_ERROR:', error);
            return new NextResponse('Internal Server Error', { status: 500 });
      }
}