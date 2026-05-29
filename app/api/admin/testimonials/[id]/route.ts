import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  const { id } = await params;
  const body = await req.json();
  try {
    const { count } = await prisma.testimonial.updateMany({
      where: { id, userId },
      data: body
    });
    
    if (count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    return NextResponse.json(testimonial);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  const { id } = await params;
  try {
    await prisma.testimonial.deleteMany({ where: { id, userId } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
