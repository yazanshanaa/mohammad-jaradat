import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { solarSystemSchema } from '@/lib/validations';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  try {
    const where = user.role === 'SUPER_ADMIN' ? {} : { userId };
    const systems = await prisma.solarSystem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        features: true,
        specs: true,
        gallery: true,
      }
    });
    return NextResponse.json(systems);
  } catch (error) {
    console.error('[SYSTEMS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const body = await req.json();
    const result = solarSystemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.format() },
        { status: 400 }
      );
    }

    const { data } = result;

    // Helper to normalize array inputs
    const featuresData = Array.isArray(data.features) ? data.features : [];
    const specsData = Array.isArray(data.specs) ? data.specs : [];
    const galleryData = Array.isArray(data.gallery) 
      ? data.gallery.map((item: any) => ({ url: typeof item === 'string' ? item : item.url }))
      : [];

    const system = await prisma.solarSystem.create({
      data: {
        userId,
        slug: data.slug,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        type: data.type,
        minPower: data.minPower,
        maxPower: data.maxPower,
        pricePerWatt: data.pricePerWatt,
        coverImage: data.coverImage,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        features: {
          create: featuresData.map((f: any) => ({
            textAr: f.textAr || f.ar || '',
            textEn: f.textEn || f.en || '',
          }))
        },
        specs: {
          create: specsData.map((s: any) => ({
            labelAr: s.labelAr || '',
            labelEn: s.labelEn || '',
            valueAr: s.valueAr || '',
            valueEn: s.valueEn || '',
          }))
        },
        gallery: {
          create: galleryData
        },
      },
      include: {
        features: true,
        specs: true,
        gallery: true,
      }
    });
    return NextResponse.json(system);
  } catch (error) {
    console.error('[SYSTEMS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
