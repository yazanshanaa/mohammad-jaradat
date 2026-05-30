import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serviceSchema } from '@/lib/validations';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;
  const { id } = await params;
  try {
    const body = await req.json();
    const result = serviceSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation Error', details: result.error.format() }, { status: 400 });
    }
    const { data } = result;
    if (user.role !== 'SUPER_ADMIN') {
      const existing = await prisma.service.findFirst({ where: { id, userId } });
      if (!existing) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    const service = await prisma.service.update({
      where: { id },
      data: {
        slug: data.slug, titleAr: data.titleAr, titleEn: data.titleEn,
        descriptionAr: data.descriptionAr, descriptionEn: data.descriptionEn,
        shortDescAr: data.shortDescAr, shortDescEn: data.shortDescEn,
        icon: data.icon, coverImage: data.coverImage,
        features: data.features ?? [], isActive: data.isActive, sortOrder: data.sortOrder,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('[SERVICE_PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;
  const { id } = await params;
  try {
    const body = await req.json();
    if (user.role !== 'SUPER_ADMIN') {
      const existing = await prisma.service.findFirst({ where: { id, userId } });
      if (!existing) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    const service = await prisma.service.update({ where: { id }, data: body });
    return NextResponse.json(service);
  } catch (error) {
    console.error('[SERVICE_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;
  const { id } = await params;
  try {
    const where = user.role === 'SUPER_ADMIN' ? { id } : { id, userId };
    const { count } = await prisma.service.deleteMany({ where });
    if (count === 0) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[SERVICE_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
