import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  const { id } = await params;

  try {
    const where = user.role === 'SUPER_ADMIN' ? { id } : { id, userId };
    const project = await prisma.project.findFirst({
      where,
      include: { gallery: true, system: true }
    });

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
    const result = projectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.format() },
        { status: 400 }
      );
    }

    const { data } = result;

    // Verify ownership
    if (user.role !== 'SUPER_ADMIN') {
      const existing = await prisma.project.findFirst({ where: { id, userId } });
      if (!existing) {
        return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
      }
    }

    // Handle gallery
    const galleryData = Array.isArray(data.gallery) 
      ? data.gallery.map((item: any) => ({ url: typeof item === 'string' ? item : item.url }))
      : [];

    const project = await prisma.project.update({
      where: { id },
      data: {
        slug: data.slug,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        category: data.category,
        location: data.location,
        powerKw: data.powerKw,
        panelsCount: data.panelsCount,
        completionDate: data.completionDate,
        clientName: data.clientName,
        annualSavingIls: data.annualSavingIls,
        coverImage: data.coverImage,
        gallery: {
          deleteMany: {},
          create: galleryData
        },
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        systemId: data.systemId,
      },
      include: { gallery: true }
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_PUT]', error);
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
    const { count } = await prisma.project.deleteMany({ where });

    if (count === 0) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[PROJECT_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
