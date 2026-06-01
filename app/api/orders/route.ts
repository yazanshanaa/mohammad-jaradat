import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerAddress: z.string().min(3),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      productNameAr: z.string(),
    })
  ).min(1),
  totalAmount: z.number().nonnegative(),
});

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${year}${month}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = orderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة', details: result.error.format() }, { status: 400 });
    }

    const { customerName, customerPhone, customerAddress, notes, items, totalAmount } = result.data;

    // جلب أول مستخدم نشط لربط الطلب به (single-tenant)
    const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!user) {
      return NextResponse.json({ error: 'لا يوجد مستخدم' }, { status: 500 });
    }

    // توليد رقم طلب فريد
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.order.findUnique({ where: { orderNumber } });
      if (!exists) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerAddress,
        notes,
        totalAmount,
        userId: user.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            productNameAr: item.productNameAr,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    console.error('[ORDERS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
