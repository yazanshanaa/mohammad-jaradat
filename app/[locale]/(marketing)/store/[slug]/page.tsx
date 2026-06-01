import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { notFound, redirect } from 'next/navigation';
import { ProductDetail } from '@/components/store/ProductDetail';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await prisma.product.findFirst({ where: { slug, isActive: true } });
    if (!product) return { title: 'منتج غير موجود' };
    return { title: product.nameAr, description: product.descriptionAr?.slice(0, 160) };
  } catch {
    return { title: 'المنتج' };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const settings = await getSettings();

  if (settings['store_enabled'] === 'false') redirect('/');

  const showPriceGlobal = settings['store_show_price'] !== 'false';
  const storeWhatsapp = settings['store_whatsapp'] || settings['whatsapp'] || '';

  let product: any = null;
  try {
    product = await prisma.product.findFirst({ where: { slug, isActive: true } });
  } catch { /* DB not connected */ }

  if (!product) notFound();

  const processed = {
    ...product,
    showPrice: showPriceGlobal ? product.showPrice : false,
  };

  return <ProductDetail product={processed} storeWhatsapp={storeWhatsapp} />;
}
