import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';
import { slugify } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  const { id } = await params;
  const body = await req.json();

  try {
    const post = await prisma.blogPost.update({
      where: { id, userId }, // Enforce ownership
      data: {
        slug: body.slug,
        titleAr: body.titleAr,
        titleEn: body.titleEn || body.titleAr,
        contentAr: body.contentAr || '',
        contentEn: body.contentEn || '',
        excerptAr: body.excerptAr || '',
        excerptEn: body.excerptEn || '',
        coverImage: body.coverImage || '',
        category: body.category,
        tags: {
          set: [],
          connectOrCreate: body.tags?.map((tag: string) => ({
            where: { 
              slug_userId: {
                slug: slugify(tag),
                userId: userId
              }
            },
            create: { nameAr: tag, nameEn: tag, slug: slugify(tag), userId: userId }
          })) || []
        },
        readingTime: parseInt(body.readingTime) || 5,
        isPublished: body.isPublished,
        publishedAt: body.isPublished ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null,
      },
      include: { tags: true }
    });
    return NextResponse.json(post);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to update post' }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  const { id } = await params;
  const body = await req.json();

  if (body.isPublished !== undefined && body.isPublished) {
    body.publishedAt = new Date();
  }

  try {
    const post = await prisma.blogPost.update({ 
      where: { id, userId }, // Enforce ownership
      data: body 
    });
    return NextResponse.json(post);
  } catch (e: any) {
    return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  const { id } = await params;
  
  try {
    await prisma.blogPost.delete({ 
      where: { id, userId } // Enforce ownership
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
  }
}
