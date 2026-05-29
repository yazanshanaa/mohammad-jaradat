import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serviceSchema } from '@/lib/validations';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  try {
    const where = user.role === 'SUPER_ADMIN' ? {} : { userId };
    const services = await prisma.service.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('[SERVICES_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const body = await req.json();
    const result = serviceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.format() },
        { status: 400 }
      );
    }

    const { data } = result;

    const service = await prisma.service.create({
      data: {
        userId,
        slug: data.slug,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        shortDescAr: data.shortDescAr,
        shortDescEn: data.shortDescEn,
        icon: data.icon,
        coverImage: data.coverImage,
        features: data.features ?? [],
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('[SERVICES_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
