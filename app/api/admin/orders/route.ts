import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenant, TenantContext } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tenant = await getTenant();
  if (tenant instanceof NextResponse) return tenant;
  const { userId, user } = tenant as TenantContext;

  try {
    const where = user.role === 'SUPER_ADMIN' ? {} : { userId };
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { nameAr: true, coverImage: true } } },
        },
      },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    // الجدول غير موجود بعد — أرجع مصفوفة فارغة بدل خطأ 500
    if (error?.code === 'P2021' || error?.code === 'P1001' || error?.message?.includes('does not exist')) {
      return NextResponse.json([]);
    }
    console.error('[ADMIN_ORDERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
