import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { solarSystemSchema } from '@/lib/validations';
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
    const result = solarSystemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation Error', details: result.error.format() }, { status: 400 });
    }
    const { data } = result;
    if (user.role !== 'SUPER_ADMIN') {
      const existing = await prisma.solarSystem.findFirst({ where: { id, userId } });
      if (!existing) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    const featuresData = Array.isArray(data.features) ? data.features : [];
    const specsData = Array.isArray(data.specs) ? data.specs : [];
    const galleryData = Array.isArray(data.gallery)
      ? data.gallery.map((item: any) => ({ url: typeof item === 'string' ? item : item.url }))
      : [];
    const system = await prisma.solarSystem.update({
      where: { id },
      data: {
        slug: data.slug, titleAr: data.titleAr, titleEn: data.titleEn,
        descriptionAr: data.descriptionAr, descriptionEn: data.descriptionEn,
        type: data.type, minPower: data.minPower, maxPower: data.maxPower,
        pricePerWatt: data.pricePerWatt, coverImage: data.coverImage,
        isActive: data.isActive, isFeatured: data.isFeatured, sortOrder: data.sortOrder,
        features: { deleteMany: {}, create: featuresData.map((f: any) => ({ textAr: f.textAr || f.ar || '', textEn: f.textEn || f.en || '' })) },
        specs: { deleteMany: {}, create: specsData.map((s: any) => ({ labelAr: s.labelAr || '', labelEn: s.labelEn || '', valueAr: s.valueAr || '', valueEn: s.valueEn || '' })) },
        gallery: { deleteMany: {}, create: galleryData },
      },
      include: { features: true, specs: true, gallery: true },
    });
    return NextResponse.json(system);
  } catch (error) {
    console.error('[SYSTEM_PUT]', error);
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
      const existing = await prisma.solarSystem.findFirst({ where: { id, userId } });
      if (!existing) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }
    const system = await prisma.solarSystem.update({ where: { id }, data: body });
    return NextResponse.json(system);
  } catch (error) {
    console.error('[SYSTEM_PATCH]', error);
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
    const { count } = await prisma.solarSystem.deleteMany({ where });
    if (count === 0) return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[SYSTEM_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
