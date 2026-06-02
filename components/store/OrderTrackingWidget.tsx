'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, Package } from 'lucide-react';

export function OrderTrackingWidget() {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) {
      setError('أدخل رقم الطلب');
      return;
    }
    setError('');
    router.push(`/${locale}/order/${trimmed}`);
  };

  return (
    <section className="py-6 px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1px solid #e5e7eb' }} dir="rtl">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5" style={{ color: 'var(--solar-gold)' }} />
            <h2 className="font-bold text-gray-900 text-sm">تتبع طلبك</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">أدخل رقم الطلب الذي استلمته عند إتمام الشراء</p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={e => { setOrderNumber(e.target.value); setError(''); }}
              placeholder="مثال: ORD-2606-1234"
              dir="ltr"
              className="flex-1 h-10 px-3 text-sm rounded-xl"
              style={{ border: '1px solid #e5e7eb', outline: 'none' }}
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 h-10 rounded-xl text-sm font-semibold text-white flex-shrink-0 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--solar-gold)' }}
            >
              <Search className="h-4 w-4" />
              تتبع
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </section>
  );
}
