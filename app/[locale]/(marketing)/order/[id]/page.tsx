import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { OrderConfirmation } from '@/components/store/OrderConfirmation';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'تأكيد الطلب' };

type Props = { params: Promise<{ id: string }> };

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const settings = await getSettings();
  const storeWhatsapp = settings['store_whatsapp'] || settings['whatsapp'] || '';
  const showPriceGlobal = settings['store_show_price'] !== 'false';

  let order: any = null;
  try {
    order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        items: {
          include: { product: { select: { nameAr: true, coverImage: true, slug: true } } },
        },
      },
    });
  } catch { /* DB not connected */ }

  if (!order) notFound();

  return <OrderConfirmation order={order} storeWhatsapp={storeWhatsapp} showPriceGlobal={showPriceGlobal} />;
}
