import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma'; // Adjust path if needed

const prisma = new PrismaClient();

export async function GET() {
  try {
    const labs = await prisma.laboratories.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(labs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch labs' }, { status: 500 });
  }
}