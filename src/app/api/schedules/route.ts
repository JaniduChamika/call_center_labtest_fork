// app/api/schedules/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma'; // Adjust import based on your setup

// Fix for JSON.stringify failing on BigInt
(BigInt.prototype as any).toJSON = function () {
      return this.toString();
};

// Helper to format time (removes 1970 date)
const formatTime = (dateObj: Date) => {
      const hours = dateObj.getUTCHours().toString().padStart(2, '0');
      const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
};

export async function GET(request: NextRequest) {
      try {
            const searchParams = request.nextUrl.searchParams;

            // --- Pagination ---
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '10');
            const skip = (page - 1) * limit;

            // --- Filters ---
            const hospitalId = searchParams.get('hospital_id');
            const doctorId = searchParams.get('doctor_id'); // Can filter by doctor's public_id
            const specializationId = searchParams.get('specialization_id'); // Can filter by doctor's specialization
            const dayOfWeek = searchParams.get('day_of_week'); // 0-6

            // --- Build Query ---
            const whereClause: Prisma.doctor_schedulesWhereInput = {};

            if (hospitalId) {
                  whereClause.hospital_id = BigInt(hospitalId); // Assuming filter by internal ID, or use nested query for public_id
            }

            if (doctorId) {
                  whereClause.doctors = {
                        public_id: doctorId
                  };
            }
            if (specializationId) {
                  whereClause.doctors = {
                        specialization_id: BigInt(specializationId)
                  };
            }
            if (dayOfWeek) {
                  whereClause.day_of_week = parseInt(dayOfWeek);
            }

            // --- Execute Queries (Parallel) ---
            const [schedules, totalCount] = await prisma.$transaction([
                  prisma.doctor_schedules.findMany({
                        where: whereClause,
                        include: {
                              doctors: {
                                    select: {
                                          public_id: true,
                                          name: true,
                                          specializations: true, // Include specialization name if needed
                                          consultant_fee: true,

                                    }
                              },
                              hospitals: {
                                    select: {
                                          public_id: true,
                                          name: true,
                                          city: true,
                                    }
                              }
                        },
                        orderBy: [
                              { day_of_week: 'asc' },
                              { start_time: 'asc' }
                        ],
                        take: limit,
                        skip: skip,
                  }),
                  prisma.doctor_schedules.count({ where: whereClause }),
            ]);

            // --- Format Response ---
            const daysOfWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            const formattedSchedules = schedules.map(schedule => ({
                  schedule_id: schedule.schedule_id.toString(),
                  day_of_week: daysOfWeekMap[schedule.day_of_week],
                  start_time: formatTime(schedule.start_time),
                  end_time: formatTime(schedule.end_time),
                  doctor: {
                        public_id: schedule.doctors.public_id,
                        name: schedule.doctors.name,
                        specialization: schedule.doctors.specializations,
                        consultant_fee: schedule.doctors.consultant_fee,
                  },
                  hospital: {
                        public_id: schedule.hospitals.public_id,
                        name: schedule.hospitals.name,
                        city: schedule.hospitals.city
                  }
            }));

            const totalPages = Math.ceil(totalCount / limit);

            return NextResponse.json({
                  message: 'Schedules retrieved successfully',
                  pagination: {
                        totalCount,
                        totalPages,
                        currentPage: page,
                        pageSize: limit
                  },
                  schedules: formattedSchedules,
            });

      } catch (error) {
            console.error('GET_ALL_SCHEDULES_ERROR:', error);
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }
}