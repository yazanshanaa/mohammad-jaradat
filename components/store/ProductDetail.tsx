'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, ChevronRight, Tag, Package, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';

interface Product {
  id: string;
  slug: string;
  nameAr: string;
  descriptionAr: string;
  price: number;
  showPrice: boolean;
  coverImage: string;
  images: string[];
  category?: string;
  stock?: number;
  features: string[];
  isFeatured: boolean;
}

export function ProductDetail({ product, storeWhatsapp }: { product: Product; storeWhatsapp: string }) {
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(product.coverImage);

  const allImages = [product.coverImage, ...product.images.filter(img => img !== product.coverImage)].filter(Boolean);
  const outOfStock = product.stock != null && product.stock <= 0;

  const handleAdd = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      nameAr: product.nameAr,
      coverImage: product.coverImage,
      price: product.price,
      showPrice: product.showPrice,
    });
    setAdded(true);
    toast.success('تمت الإضافة إلى السلة');
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappMsg = storeWhatsapp
    ? `https://wa.me/${storeWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً، أريد الاستفسار عن: ${product.nameAr}`)}`
    : null;

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10" dir="rtl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          <Link href="/" className="hover:opacity-80">الرئيسية</Link>
          <ChevronRight className="h-4 w-4 rotate-180" />
          <Link href="/store" className="hover:opacity-80">المتجر</Link>
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span style={{ color: 'var(--text-primary)' }}>{product.nameAr}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* الصور */}
          <div className="space-y-4">
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {activeImg ? (
                <NextImage src={activeImg} alt={product.nameAr} fill className="object-contain p-4" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 opacity-20" style={{ color: 'var(--solar-gold)' }} />
                </div>
              )}
              {product.isFeatured && (
                <span className="absolute top-4 end-4 text-xs px-3 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>⭐ منتج مميز</span>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(img)}
                    className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all"
                    style={{ borderColor: activeImg === img ? 'var(--solar-gold)' : 'var(--border)' }}>
                    <NextImage src={img} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="space-y-6">
            {product.category && (
              <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--solar-gold)' }}>
                <Tag className="h-4 w-4" />{product.category}
              </span>
            )}

            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{product.nameAr}</h1>

            {/* السعر */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {product.showPrice ? (
                <p className="text-3xl font-black" style={{ color: 'var(--solar-gold)' }}>₪{product.price.toFixed(2)}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-lg font-bold" style={{ color: 'var(--text-secondary)' }}>اتصل بنا للاستفسار عن السعر</p>
                </div>
              )}
              {product.stock != null && (
                <p className="text-xs mt-1" style={{ color: outOfStock ? '#EF4444' : '#10B981' }}>
                  {outOfStock ? 'نفد المخزون' : `متوفر (${product.stock} قطعة)`}
                </p>
              )}
            </div>

            {/* الوصف */}
            {product.descriptionAr && (
              <div>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>عن المنتج</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                  {product.descriptionAr}
                </p>
              </div>
            )}

            {/* المزايا */}
            {product.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>المزايا</h3>
                <ul className="space-y-2">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* أزرار الإجراء */}
            <div className="flex flex-col gap-3 pt-2">
              <Button
                size="lg"
                disabled={outOfStock || added}
                onClick={handleAdd}
                className="w-full text-white font-bold text-base h-12 gap-2 transition-all"
                style={{ backgroundColor: added ? '#10B981' : 'var(--solar-gold)' }}
              >
                {added ? (
                  <><Check className="h-5 w-5" />تمت الإضافة إلى السلة!</>
                ) : outOfStock ? (
                  'نفد المخزون'
                ) : (
                  <><ShoppingCart className="h-5 w-5" />أضف إلى السلة</>
                )}
              </Button>

              {whatsappMsg && !product.showPrice && (
                <a href={whatsappMsg} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-white text-base"
                  style={{ backgroundColor: '#25D366' }}>
                  <Phone className="h-5 w-5" />استفسر عبر واتساب
                </a>
              )}

              <Link href="/store"
                className="w-full flex items-center justify-center h-11 rounded-xl font-medium text-sm border transition-all"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                العودة إلى المتجر
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
