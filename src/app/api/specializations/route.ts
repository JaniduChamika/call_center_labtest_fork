// app/api/specializations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import Prisma client

export async function GET(request: NextRequest) {
      try {
            // 1. Fetch all specialization records
            const specializations = await prisma.specializations.findMany({
                  // Sort them alphabetically by name
                  orderBy: {
                        name: 'asc',
                  },
            });

            // 2. Return the successful response
            return NextResponse.json({
                  message: 'Specializations retrieved successfully',
                  generatedAt: new Date().toISOString(), // Server time in UTC
                  specializations: specializations,
            });

      } catch (error) {
            console.error('GET_SPECIALIZATIONS_ERROR:', error);
            return new NextResponse('Internal Server Error', { status: 500 });

      }
}