'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Phone, MapPin, MessageSquare, Trash2, Plus, Minus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/lib/store/cart';
import { toast } from 'sonner';

interface Props {
  showPriceGlobal: boolean;
  storeWhatsapp: string;
}

export function CheckoutForm({ showPriceGlobal, storeWhatsapp }: Props) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, total, count, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setMounted(true); }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'يرجى إدخال الاسم الكامل';
    if (!form.phone.trim() || form.phone.trim().length < 8) e.phone = 'يرجى إدخال رقم هاتف صحيح';
    if (!form.address.trim() || form.address.trim().length < 3) e.address = 'يرجى إدخال العنوان';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!mounted || items.length === 0) { toast.error('السلة فارغة'); return; }

    setSubmitting(true);
    try {
      const payload = {
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerAddress: form.address.trim(),
        notes: form.notes.trim() || undefined,
        totalAmount: total(),
        items: items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.price,
          productNameAr: i.nameAr,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'حدث خطأ');
      }

      const { orderId, orderNumber } = await res.json();
      clearCart();

      // إرسال واتساب إن وُجد
      if (storeWhatsapp) {
        const itemsList = items.map(i => `• ${i.nameAr} × ${i.quantity}${showPriceGlobal && i.showPrice ? ` = ₪${(i.price * i.quantity).toFixed(2)}` : ''}`).join('\n');
        const totalLine = showPriceGlobal ? `\n💰 المجموع: ₪${total().toFixed(2)}` : '';
        const msg = `🛍️ طلب جديد #${orderNumber}\n\n👤 الاسم: ${form.name}\n📞 الهاتف: ${form.phone}\n📍 العنوان: ${form.address}${form.notes ? `\n📝 ملاحظات: ${form.notes}` : ''}\n\n${itemsList}${totalLine}`;
        window.open(`https://wa.me/${storeWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      }

      router.push(`/order/${orderId}`);
    } catch (e: any) {
      toast.error(e.message || 'خدث خطأ في إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20" style={{ backgroundColor: 'var(--bg-primary)' }} dir="rtl">
        <ShoppingBag className="h-16 w-16 mb-4 opacity-20" style={{ color: 'var(--solar-gold)' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>السلة فارغة</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>أضف منتجات من المتجر أولاً</p>
        <Button asChild className="text-white font-semibold" style={{ backgroundColor: 'var(--solar-gold)' }}>
          <Link href="/store">تصفح المتجر</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: 'var(--bg-primary)' }} dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-black mb-8" style={{ color: 'var(--text-primary)' }}>إتمام الطلب</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* بيانات العميل */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>بياناتك</h2>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <User className="h-4 w-4" />الاسم الكامل *
                </Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="محمد أحمد" className="h-11" />
                {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <Phone className="h-4 w-4" />رقم الهاتف *
                </Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="0591234567" dir="ltr" type="tel" className="h-11" />
                {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.phone}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <MapPin className="h-4 w-4" />العنوان *
                </Label>
                <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="المدينة، الحي، الشارع" className="h-11" />
                {errors.address && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.address}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  <MessageSquare className="h-4 w-4" />ملاحظات (اختياري)
                </Label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="أي تعليمات إضافية للتوصيل..."
                  rows={3} className="w-full px-3 py-2 text-sm rounded-xl resize-none"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          </div>

          {/* ملخص الطلب */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                طلبك ({count()} منتج)
              </h2>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: 'var(--bg-primary)' }}>
                      {item.coverImage ? (
                        <NextImage src={item.coverImage} alt={item.nameAr} fill className="object-cover" unoptimized />
                      ) : (
                        <ShoppingBag className="h-6 w-6 m-3 opacity-30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.nameAr}</p>
                      {showPriceGlobal && item.showPrice && (
                        <p className="text-xs" style={{ color: 'var(--solar-gold)' }}>₪{item.price.toFixed(2)} × {item.quantity}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 rounded-full flex items-center justify-center border transition-all hover:bg-gray-100"
                        style={{ borderColor: 'var(--border)' }}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 rounded-full flex items-center justify-center border transition-all hover:bg-gray-100"
                        style={{ borderColor: 'var(--border)' }}>
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="h-7 w-7 flex items-center justify-center text-red-400 hover:text-red-600 mr-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showPriceGlobal && (
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>المجموع الفرعي</span>
                    <span>₪{total().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-base pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <span>المجموع الكلي</span>
                    <span style={{ color: 'var(--solar-gold)' }}>₪{total().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 text-white font-bold text-base gap-2"
              style={{ backgroundColor: 'var(--solar-gold)' }}>
              {submitting ? 'جاري الإرسال...' : '✅ تأكيد الطلب'}
            </Button>

            {storeWhatsapp && (
              <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                📱 سيتم فتح واتساب لإرسال تفاصيل طلبك تلقائياً
              </p>
            )}

            <Link href="/store" className="block text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              ← العودة إلى المتجر
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
