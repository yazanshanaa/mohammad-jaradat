import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;
  const { id } = await params;

  const where = user.role === 'SUPER_ADMIN' ? { id } : { id, userId };
  const order = await prisma.order.findFirst({ where });
  if (!order) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  try {
    const body = await req.json();
    const updated = await prisma.order.update({
      where: { id },
      data: { status: body.status },
      include: { items: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN_ORDER_PATCH]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;
  const { id } = await params;

  const where = user.role === 'SUPER_ADMIN' ? { id } : { id, userId };
  const order = await prisma.order.findFirst({ where });
  if (!order) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

  try {
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN_ORDER_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
