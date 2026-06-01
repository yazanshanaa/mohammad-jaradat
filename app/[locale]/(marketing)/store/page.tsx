import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { redirect } from 'next/navigation';
import { StoreGrid } from '@/components/store/StoreGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'المتجر',
  description: 'تصفح منتجاتنا',
};

export default async function StorePage() {
  const settings = await getSettings();

  if (settings['store_enabled'] === 'false') {
    redirect('/');
  }

  const showPriceGlobal = settings['store_show_price'] !== 'false';
  const storeName = settings['store_name_ar'] || 'المتجر';
  const shippingNote = settings['store_free_shipping_note'] || '';

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  } catch { /* DB not connected */ }

  // إخفاء السعر إذا كان الإعداد العام يخفيه
  const processedProducts = products.map(p => ({
    ...p,
    showPrice: showPriceGlobal ? p.showPrice : false,
  }));

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="py-16 text-center text-white"
        style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-3">{storeName}</h1>
          <p className="text-lg opacity-80">تصفح منتجاتنا واطلب بسهولة</p>
          {shippingNote && (
            <div className="mt-4 inline-block px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: 'rgba(245,166,35,0.2)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}>
              🚚 {shippingNote}
            </div>
          )}
        </div>
      </section>

      <StoreGrid products={processedProducts} />
    </div>
  );
}
