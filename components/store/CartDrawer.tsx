'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { X, ShoppingBag, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const showTotal = items.some(i => i.showPrice);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 left-0 h-full z-50 w-80 max-w-full flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          backgroundColor: 'var(--bg-card)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          borderRight: '1px solid var(--border)',
        }}
        dir="rtl"
      >
        {/* رأس الـ Drawer */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" style={{ color: 'var(--solar-gold)' }} />
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              السلة {count() > 0 && <span className="text-xs px-2 py-0.5 rounded-full ms-1 text-white" style={{ backgroundColor: 'var(--solar-gold)' }}>{count()}</span>}
            </span>
          </div>
          <button onClick={closeCart} className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* محتوى السلة */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="h-16 w-16 opacity-15" style={{ color: 'var(--solar-gold)' }} />
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>السلة فارغة</p>
            <Button asChild size="sm" className="text-white font-semibold" style={{ backgroundColor: 'var(--solar-gold)' }}
              onClick={closeCart}>
              <Link href="/store">تصفح المتجر</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* قائمة المنتجات */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  {/* صورة */}
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: 'var(--bg-card)' }}>
                    {item.coverImage ? (
                      <NextImage src={item.coverImage} alt={item.nameAr} fill className="object-cover" unoptimized />
                    ) : (
                      <ShoppingBag className="h-7 w-7 m-3.5 opacity-30" />
                    )}
                  </div>

                  {/* التفاصيل */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.nameAr}</p>
                    {item.showPrice && (
                      <p className="text-xs font-bold" style={{ color: 'var(--solar-gold)' }}>
                        ₪{(item.price * item.quantity).toFixed(2)}
                      </p>
                    )}

                    {/* الكمية */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded-full border flex items-center justify-center transition-all hover:bg-gray-100"
                        style={{ borderColor: 'var(--border)' }}>
                        <Minus className="h-3 w-3" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded-full border flex items-center justify-center transition-all hover:bg-gray-100"
                        style={{ borderColor: 'var(--border)' }}>
                        <Plus className="h-3 w-3" style={{ color: 'var(--text-secondary)' }} />
                      </button>
                    </div>
                  </div>

                  {/* حذف */}
                  <button onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* الإجمالي وزر الطلب */}
            <div className="p-4 flex-shrink-0 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
              {showTotal && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>المجموع</span>
                  <span className="text-xl font-black" style={{ color: 'var(--solar-gold)' }}>₪{total().toFixed(2)}</span>
                </div>
              )}
              <Button asChild className="w-full h-12 text-white font-bold text-base" style={{ backgroundColor: 'var(--solar-gold)' }}
                onClick={closeCart}>
                <Link href="/checkout">إتمام الطلب ←</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-10 font-medium text-sm" onClick={closeCart}>
                <Link href="/store">متابعة التسوق</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
