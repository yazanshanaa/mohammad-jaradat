import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { blogPostSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { getTenant, TenantContext } from '@/lib/tenant';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const posts = await prisma.blogPost.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { tags: true }
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('[BLOG_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const body = await req.json();
    const result = blogPostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: result.error.format() 
      }, { status: 400 });
    }

    const data = result.data;
    const post = await prisma.blogPost.create({
      data: {
        slug: data.slug,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        contentAr: data.contentAr,
        contentEn: data.contentEn,
        excerptAr: data.excerptAr,
        excerptEn: data.excerptEn,
        coverImage: data.coverImage,
        category: data.category,
        tags: {
          connectOrCreate: data.tags?.map((tag: string) => ({
            where: { 
              slug_userId: {
                slug: slugify(tag),
                userId: userId
              }
            },
            create: { nameAr: tag, nameEn: tag, slug: slugify(tag), userId: userId }
          })) || []
        },
        readingTime: data.readingTime,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null,
        metaTitleAr: data.metaTitleAr,
        metaTitleEn: data.metaTitleEn,
        metaDescAr: data.metaDescAr,
        metaDescEn: data.metaDescEn,
        userId: userId, // Scoped
      },
      include: { tags: true }
    });
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('[BLOG_POST_ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to create blog post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
