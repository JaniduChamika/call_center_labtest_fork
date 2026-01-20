// app/api/illnesses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import Prisma client


export async function GET(request: NextRequest) {
  try {
    // 1. Fetch all illness records
    const illnesses = await prisma.illness_specialization_map.findMany({
      // Good practice to sort them alphabetically
      orderBy: {
        illness_name: 'asc',
      },
      // Include the related specialization name for each illness
      include: {
        specializations: true,
      },
    });

    // 2. Return the successful response
    return NextResponse.json({
      message: 'Illnesses retrieved successfully',
      generatedAt: new Date().toISOString(),
      illnesses: illnesses,
    });

  } catch (error) {
    console.error('GET_ILLNESSES_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}