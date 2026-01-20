// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import Prisma type
import { Prisma } from '@/generated/prisma';


// --- GET A PAGINATED AND FILTERED LIST OF PATIENTS ---
export async function GET(request: NextRequest) {
      try {
            // 1. Get query parameters
            const searchParams = request.nextUrl.searchParams;

            // Pagination parameters
            const page = searchParams.get('page') || '1';
            const limit = searchParams.get('limit') || '10'; // Default to 10 per page

            // Filter parameter (a single search box)
            const search = searchParams.get('search'); // For name, phone, or email

            // 2. Calculate pagination
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            // 3. Build dynamic 'where' clause for filtering
            const whereClause: Prisma.patientsWhereInput = search
                  ? {
                        // If a search term is provided, check all 3 fields
                        OR: [
                              { name: { contains: search, mode: 'insensitive' } },
                              { phone_number: { contains: search } }, // Phone numbers are usually exact
                              { email: { contains: search, mode: 'insensitive' } },
                              { nic: { contains: search, mode: 'insensitive' } },
                        ],
                  }
                  : {}; // If no search, the 'where' is empty (gets all)

            // 4. Run queries in parallel (one for data, one for total count)
            const [patients, totalCount] = await prisma.$transaction([
                  // Query 1: Get the patients for the current page
                  prisma.patients.findMany({
                        where: whereClause,
                        orderBy: {
                              name: 'asc', // Sort alphabetically
                        },
                        take: limitNum,
                        skip: skip,
                  }),

                  // Query 2: Get the total count of patients matching the filters
                  prisma.patients.count({
                        where: whereClause,
                  }),
            ]);

            // 5. Calculate total pages
            const totalPages = Math.ceil(totalCount / limitNum);

            // 6. Return the successful response
            return NextResponse.json({
                  message: 'Patients retrieved successfully',
                  filters: { search },
                  pagination: {
                        totalCount: totalCount,
                        totalPages: totalPages,
                        currentPage: pageNum,
                        pageSize: limitNum,
                  },
                  patients: patients,
            });

      } catch (error) {
            console.error('GET_PATIENTS_ERROR:', error);
            return new NextResponse('Internal Server Error', { status: 500 });
      }
}
