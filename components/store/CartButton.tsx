'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

export function CartButton() {
  const { count, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const itemCount = mounted ? count() : 0;

  return (
    <button
      onClick={openCart}
      aria-label="السلة"
      className="relative p-2.5 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-all hover:opacity-80"
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span
          className="absolute -top-0.5 -end-0.5 h-5 w-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
          style={{ backgroundColor: 'var(--solar-gold)', fontSize: '10px' }}
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
