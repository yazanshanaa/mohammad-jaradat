import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  try {
    const where = user.role === 'SUPER_ADMIN' ? {} : { userId };
    const projects = await prisma.project.findMany({
      where,
      orderBy: { completionDate: 'desc' },
      include: { gallery: true, system: true }
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('[PROJECTS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

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

    // Handle gallery safely
    const galleryData = Array.isArray(data.gallery) 
      ? data.gallery.map((item: any) => ({ url: typeof item === 'string' ? item : item.url }))
      : [];

    const project = await prisma.project.create({
      data: {
        userId,
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
    console.error('[PROJECTS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
