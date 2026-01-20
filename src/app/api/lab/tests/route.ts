import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const where: any = {};
  if (category && category !== 'ALL') where.category = category;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  try {
    const tests = await prisma.labTest.findMany({ where, orderBy: { category: 'asc' } });
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}