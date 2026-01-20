// app/api/patients/[nic]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import Prisma client


// Define the type for the dynamic route parameter
type RouteParams = {
  params: Promise<{
    nic: string; // This comes from the folder name [nic]
  }>;
};

// --- GET A SINGLE PATIENT BY THEIR NIC ---
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Get the 'mobile' from the URL
    const resolvedParams = await params;
    const nic = resolvedParams.nic;

    // 2. Find the unique patient by their mobile
    //    IMPORTANT: This requires a field 'mobile' in your 'patients'
    //    table that is marked as '@unique' in your schema.prisma
    const patient = await prisma.patients.findUnique({
      where: {
        nic: nic,
      },
    });

    // 3. If not found, return a 404 (Not Found)
    if (!patient) {
      return NextResponse.json(
        { message: `Patient with NIC ${nic} not found` },
        { status: 404 }
      );
    }

    // 4. Return the successful response
    return NextResponse.json({
      message: 'Patient retrieved successfully',
      patient: patient,
    });
    
  } catch (error) {
    console.error('GET_PATIENT_BY_NIC_ERROR:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}