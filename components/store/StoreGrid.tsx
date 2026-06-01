'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Check, Tag } from 'lucide-react';
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
  isFeatured: boolean;
  stock?: number;
  features: string[];
}

export function StoreGrid({ products }: { products: Product[] }) {
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState<string | null>(null);

  const handleAdd = (p: Product) => {
    addItem({
      id: p.id,
      slug: p.slug,
      nameAr: p.nameAr,
      coverImage: p.coverImage,
      price: p.price,
      showPrice: p.showPrice,
    });
    setAdded(p.id);
    toast.success(`تمت الإضافة: ${p.nameAr}`);
    setTimeout(() => setAdded(null), 1500);
  };

  const featured = products.filter(p => p.isFeatured);
  const rest = products.filter(p => !p.isFeatured);
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const displayed = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--solar-gold)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>لا توجد منتجات متاحة حالياً</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* فلتر التصنيفات */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCategory(null)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={{
              backgroundColor: !activeCategory ? 'var(--solar-gold)' : 'var(--bg-card)',
              color: !activeCategory ? '#fff' : 'var(--text-secondary)',
              borderColor: !activeCategory ? 'var(--solar-gold)' : 'var(--border)',
            }}>
            الكل ({products.length})
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={{
                backgroundColor: activeCategory === cat ? 'var(--solar-gold)' : 'var(--bg-card)',
                color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                borderColor: activeCategory === cat ? 'var(--solar-gold)' : 'var(--border)',
              }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayed.map((p) => {
          const isAdded = added === p.id;
          const outOfStock = p.stock != null && p.stock <= 0;
          return (
            <div key={p.id} className="rounded-2xl overflow-hidden flex flex-col card-hover"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {/* صورة */}
              <Link href={`/store/${p.slug}`} className="block relative h-52 overflow-hidden bg-gray-100">
                {p.coverImage ? (
                  <NextImage src={p.coverImage} alt={p.nameAr} fill className="object-cover hover:scale-105 transition-transform duration-300" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-16 w-16 opacity-20" style={{ color: 'var(--solar-gold)' }} />
                  </div>
                )}
                {p.isFeatured && (
                  <span className="absolute top-3 start-3 text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>⭐ مميز</span>
                )}
                {outOfStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">نفد المخزون</span>
                  </div>
                )}
              </Link>

              <div className="p-4 flex flex-col flex-1 gap-2">
                {p.category && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Tag className="h-3 w-3" />{p.category}
                  </span>
                )}

                <Link href={`/store/${p.slug}`}>
                  <h3 className="font-bold text-base leading-snug hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-primary)' }}>{p.nameAr}</h3>
                </Link>

                {p.descriptionAr && (
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {p.descriptionAr}
                  </p>
                )}

                <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                  <div>
                    {p.showPrice ? (
                      <span className="text-lg font-black" style={{ color: 'var(--solar-gold)' }}>₪{p.price.toFixed(2)}</span>
                    ) : (
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>اتصل للسعر</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    disabled={outOfStock || isAdded}
                    onClick={() => handleAdd(p)}
                    className="gap-1.5 text-xs font-semibold text-white transition-all"
                    style={{ backgroundColor: isAdded ? '#10B981' : 'var(--solar-gold)' }}
                  >
                    {isAdded ? <><Check className="h-3.5 w-3.5" />أُضيف!</> : <><ShoppingCart className="h-3.5 w-3.5" />أضف</>}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
