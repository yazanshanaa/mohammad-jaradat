'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { CheckCircle, Phone, MapPin, ClipboardList, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_AR: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  CONFIRMED: 'مؤكد',
  PROCESSING: 'قيد التجهيز',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

interface Props {
  order: any;
  storeWhatsapp: string;
  showPriceGlobal: boolean;
}

export function OrderConfirmation({ order, storeWhatsapp, showPriceGlobal }: Props) {
  const followUpWhatsapp = storeWhatsapp
    ? `https://wa.me/${storeWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`مرحباً، أريد متابعة طلبي رقم ${order.orderNumber} 📦`)}`
    : null;

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary)' }} dir="rtl">
      <div className="max-w-2xl mx-auto px-4">

        {/* رأس التأكيد */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: '#ECFDF5' }}>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>تم استلام طلبك!</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            سنتواصل معك قريباً لتأكيد الطلب
          </p>
        </div>

        {/* رقم الطلب */}
        <div className="rounded-2xl p-5 mb-5 text-center"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>رقم طلبك</p>
          <p className="text-2xl font-black" style={{ color: 'var(--solar-gold)' }}>{order.orderNumber}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
            {STATUS_AR[order.status] || order.status}
          </span>
        </div>

        {/* بيانات العميل */}
        <div className="rounded-2xl p-5 mb-5 space-y-3"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>بيانات الطلب</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{order.customerName} — {order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{order.customerAddress}</span>
            </div>
            {order.notes && (
              <div className="flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                <ClipboardList className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* عناصر الطلب */}
        <div className="rounded-2xl p-5 mb-5 space-y-3"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>المنتجات ({order.items.length})</h3>
          <div className="space-y-3">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-primary)' }}>
                  {item.product?.coverImage ? (
                    <NextImage src={item.product.coverImage} alt={item.productNameAr} fill className="object-cover" unoptimized />
                  ) : (
                    <ShoppingBag className="h-6 w-6 m-3 opacity-30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.productNameAr}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>الكمية: {item.quantity}</p>
                </div>
                {showPriceGlobal && (
                  <p className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--solar-gold)' }}>
                    ₪{(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {showPriceGlobal && (
            <div className="flex justify-between font-black pt-3" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              <span>المجموع</span>
              <span style={{ color: 'var(--solar-gold)' }}>₪{order.totalAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* أزرار */}
        <div className="space-y-3">
          {followUpWhatsapp && (
            <a href={followUpWhatsapp} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-white text-base"
              style={{ backgroundColor: '#25D366' }}>
              <Phone className="h-5 w-5" />تواصل معنا لمتابعة الطلب
            </a>
          )}
          <Button asChild className="w-full h-11 text-white font-semibold" style={{ backgroundColor: 'var(--solar-gold)' }}>
            <Link href="/store">متابعة التسوق</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-11 font-medium">
            <Link href="/">الرئيسية</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
