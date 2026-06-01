import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';
import { z } from 'zod';

const productSchema = z.object({
  slug: z.string().min(1),
  nameAr: z.string().min(1),
  descriptionAr: z.string().default(''),
  price: z.number().nonnegative(),
  showPrice: z.boolean().default(true),
  coverImage: z.string().default(''),
  images: z.array(z.string()).default([]),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  stock: z.number().int().nullable().optional(),
  features: z.array(z.string()).default([]),
});

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  try {
    const where = user.role === 'SUPER_ADMIN' ? {} : { userId };
    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { orderItems: true } } },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId } = tenant as TenantContext;

  try {
    const body = await req.json();
    const result = productSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation Error', details: result.error.format() }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: { ...result.data, userId },
    });
    return NextResponse.json(product);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'المعرف (slug) مستخدم مسبقاً' }, { status: 409 });
    }
    console.error('[ADMIN_PRODUCTS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
