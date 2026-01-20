// app/api/hospitals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ⭐️ Import our new Prisma client
import { Prisma } from '@/generated/prisma';



export async function GET(request: NextRequest) {
      try {
            // 1. Get query parameters
            const searchParams = request.nextUrl.searchParams;

            // Pagination parameters
            const page = searchParams.get('page') || '1';
            const limit = searchParams.get('limit') || '10'; // Default to 10 per page

            // Filter parameters
            const city = searchParams.get('city');
            const name = searchParams.get('name'); // For searching by hospital name

            // 2. Calculate pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            // 3. Build dynamic 'where' clause for filtering
            const whereClause: Prisma.hospitalsWhereInput = {
                  // Add filters only if they are provided
                  city: city ? {
                        equals: city, // Exact match for city
                        mode: 'insensitive', // Ignore case
                  } : undefined,

                  name: name ? {
                        contains: name,
                        mode: 'insensitive',
                  } : undefined,

            };

            // 4. Run queries in parallel (one for data, one for total count)
            const [hospitals, totalCount] = await prisma.$transaction([
                  // Query 1: Get the hospitals for the current page
                  prisma.hospitals.findMany({
                        where: whereClause,
                        orderBy: {
                              name: 'asc', // Sort alphabetically by name
                        },
                        take: limitNum,
                        skip: skip,
                  }),

                  // Query 2: Get the total count of hospitals matching the filters
                  prisma.hospitals.count({
                        where: whereClause,
                  }),
            ]);

            // 5. Calculate total pages
            const totalPages = Math.ceil(totalCount / limitNum);

            // 6. Return the successful response
            return NextResponse.json({
                  message: 'Hospitals retrieved successfully',
                  generatedAt: new Date().toISOString(), // Good practice
                  filters: { city, name },
                  pagination: {
                        totalCount: totalCount,
                        totalPages: totalPages,
                        currentPage: pageNum,
                        pageSize: limitNum,
                  },
                  hospitals: hospitals,
            });

      } catch (error) {
            console.error('GET_HOSPITALS_ERROR:', error);
            return new NextResponse('Internal Server Error', { status: 500 });
      }
}