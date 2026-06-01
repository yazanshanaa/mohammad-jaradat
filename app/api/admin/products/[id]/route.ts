import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

type Params = { params: Promise<{ id: string }> };

async function getOwnedProduct(id: string, userId: string, role: string) {
  const where = role === 'SUPER_ADMIN' ? { id } : { id, userId };
  return prisma.product.findFirst({ where });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;
  const { id } = await params;

  const product = await getOwnedProduct(id, userId, user.role);
  if (!product) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  try {
    const body = await req.json();
    const updated = await prisma.product.update({
      where: { id },
      data: {
        slug: body.slug,
        nameAr: body.nameAr,
        descriptionAr: body.descriptionAr ?? '',
        price: Number(body.price),
        showPrice: body.showPrice ?? true,
        coverImage: body.coverImage ?? '',
        images: Array.isArray(body.images) ? body.images : [],
        category: body.category || null,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        sortOrder: Number(body.sortOrder) || 0,
        stock: body.stock != null ? Number(body.stock) : null,
        features: Array.isArray(body.features) ? body.features : [],
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'المعرف (slug) مستخدم مسبقاً' }, { status: 409 });
    }
    console.error('[ADMIN_PRODUCT_PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;
  const { id } = await params;

  const product = await getOwnedProduct(id, userId, user.role);
  if (!product) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  try {
    const body = await req.json();
    const updated = await prisma.product.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN_PRODUCT_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;
  const { id } = await params;

  const product = await getOwnedProduct(id, userId, user.role);
  if (!product) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_PRODUCT_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
