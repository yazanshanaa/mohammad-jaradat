import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json(testimonials);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  const body = await req.json();
  try {
    const testimonial = await prisma.testimonial.create({
      data: { ...body, userId }
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
