// app/api/doctors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ⭐️ Import our new Prisma client
import { Prisma } from '@/generated/prisma';
import { formatTime } from '@/lib/utils';

// Fix for JSON.stringify failing on BigInt
(BigInt.prototype as any).toJSON = function () {
      return this.toString();
};

export async function GET(request: NextRequest) {
      try {
            // 1. Get all possible search parameters from the URL
            const searchParams = request.nextUrl.searchParams;
            const city = searchParams.get('city');
            const specializationId = searchParams.get('specialization_id');
            const illnessName = searchParams.get('illness');
            const doctorName = searchParams.get('name');
            const hospitalPubId = searchParams.get('hospital');


            // --- 2. GET PAGINATION PARAMETERS ---
            // Default to page 1, 10 items per page
            const page = searchParams.get('page') || '1';
            const limit = searchParams.get('limit') || '10';
            // Convert them to numbers
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            // Calculate the number of items to skip
            const skip = (pageNum - 1) * limitNum;

            // 2. Build the dynamic 'where' clause
            const whereClause: Prisma.doctorsWhereInput = {
                  // AND 1: Filter by doctor name (case-insensitive 'contains')
                  name: doctorName
                        ? {
                              contains: doctorName,
                              mode: 'insensitive',
                        }
                        : undefined,

                  // AND 2: Filter by exact specialization_id
                  specialization_id: specializationId
                        ? parseInt(specializationId)
                        : undefined,

                  // AND 3: Filter by illness name (case-insensitive 'contains')
                  // This searches: Doctor -> Specialization -> IllnessMap
                  specializations: illnessName
                        ? {
                              illness_specialization_map: {
                                    some: {
                                          illness_name: {
                                                contains: illnessName,
                                                mode: 'insensitive',
                                          },
                                    },
                              },
                        }
                        : undefined,

                  // AND 4: Filter by hospital or city
                  // This searches: Doctor -> Schedules -> Hospital
                  // We only add this block if city or hospitalId is provided
                  doctor_schedules: (city || hospitalPubId)
                        ? {
                              some: {
                                    // Filter by exact hospital_id

                                    // Filter by hospital city (case-insensitive 'equals')
                                    hospitals: {
                                          public_id: hospitalPubId ? hospitalPubId : undefined,
                                          city: city
                                                ? {
                                                      equals: city,
                                                      mode: 'insensitive',
                                                }
                                                : undefined,
                                    },
                              },
                        }
                        : undefined,
            };

            // 3. The 'include' clause to JOIN related tables
            const includeClause = {
                  specializations: true, // Get the specialization details

                  doctor_schedules: {
                        include: {
                              hospitals: true, // Get the hospital details
                        },
                  },
            };

            // 4. Execute the query
            const [doctors, totalCount] = await prisma.$transaction([
                  prisma.doctors.findMany({
                        where: whereClause,
                        include: includeClause,
                        take: limitNum,  // <-- Add this
                        skip: skip,
                  }),
                  prisma.doctors.count({
                        where: whereClause,

                  })
            ]);
            // 5. Calculate total pages
            const totalPages = Math.ceil(totalCount / limitNum);

            const cleanedDoctors = doctors.map((doc) => ({
                  ...doc,
                  // Map over the schedules to format the time
                  doctor_schedules: doc.doctor_schedules.map((schedule) => ({
                        ...schedule,
                        // Apply the helper function
                        start_time: formatTime(schedule.start_time), // "09:00"
                        end_time: formatTime(schedule.end_time),     // "12:00"

                        // Optional: Format valid_from to just YYYY-MM-DD
                        valid_from: schedule.valid_from
                              ? schedule.valid_from.toISOString().split('T')[0]
                              : null,
                  })),
            }));
            // 5. Return the results
            return NextResponse.json({
                  message: 'Doctor search successful',
                  filters_received: {
                        doctorName,
                        illnessName,
                        specializationId,
                        city,
                        hospitalPubId,
                  },
                  pagination: {
                        totalCount: totalCount,
                        totalPages: totalPages,
                        currentPage: pageNum,
                        pageSize: limitNum,
                  },
                  doctors: cleanedDoctors,

            });

      } catch (error) {
            console.error('SEARCH_DOCTORS_ERROR:', error);
            return new NextResponse('Internal Server Error', { status: 500 });
      }
}