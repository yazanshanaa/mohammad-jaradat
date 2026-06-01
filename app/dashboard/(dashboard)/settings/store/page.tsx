'use client';

import { useState, useEffect } from 'react';
import { Store, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const KEYS = [
  'store_enabled',
  'store_show_price',
  'store_whatsapp',
  'store_currency',
  'store_name_ar',
  'store_free_shipping_note',
];

export default function StoreSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({
    store_enabled: 'true',
    store_show_price: 'true',
    store_whatsapp: '',
    store_currency: 'ILS',
    store_name_ar: 'المتجر',
    store_free_shipping_note: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {};
        (data || []).forEach((s) => { map[s.key] = s.value; });
        setValues(prev => ({ ...prev, ...map }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = KEYS.map(key => ({ key, value: values[key] ?? '' }));
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) toast.success('تم حفظ إعدادات المتجر');
      else toast.error('خطأ في الحفظ');
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  const bool = (key: string) => values[key] !== 'false';
  const toggle = (key: string) => setValues(p => ({ ...p, [key]: bool(key) ? 'false' : 'true' }));

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="h-5 w-5 text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات المتجر</h1>
            <p className="text-sm text-gray-500">تحكم في المتجر الإلكتروني وإعداداته</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ
        </Button>
      </div>

      {/* تفعيل المتجر */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4" style={{ border: '1px solid #e5e7eb' }}>
        <h2 className="font-semibold text-gray-800 text-sm pb-2" style={{ borderBottom: '1px solid #f3f4f6' }}>التحكم العام</h2>

        {[
          { key: 'store_enabled', label: 'تفعيل المتجر', desc: 'عند الإيقاف يختفي المتجر من الموقع بالكامل' },
          { key: 'store_show_price', label: 'إظهار الأسعار للزوار', desc: 'يمكنك أيضاً التحكم في سعر كل منتج بشكل منفصل' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <div className="flex items-center gap-3">
              {bool(key) ? <Eye className="h-5 w-5 text-blue-500" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
              <div>
                <div className="font-medium text-sm text-gray-900">{label}</div>
                <div className="text-xs text-gray-500">{bool(key) ? 'مفعّل' : 'معطّل'} — {desc}</div>
              </div>
            </div>
            <button type="button" onClick={() => toggle(key)}
              className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ backgroundColor: bool(key) ? '#3B82F6' : '#D1D5DB' }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                style={{ right: bool(key) ? '4px' : '26px' }} />
            </button>
          </div>
        ))}
      </div>

      {/* إعدادات التواصل */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4" style={{ border: '1px solid #e5e7eb' }}>
        <h2 className="font-semibold text-gray-800 text-sm pb-2" style={{ borderBottom: '1px solid #f3f4f6' }}>إعدادات التواصل والمتجر</h2>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">رقم واتساب استقبال الطلبات</Label>
          <p className="text-xs text-gray-400">سيتم إرسال تفاصيل الطلب تلقائياً عبر واتساب بعد تأكيده</p>
          <Input
            value={values['store_whatsapp'] || ''}
            onChange={e => setValues(p => ({ ...p, store_whatsapp: e.target.value }))}
            placeholder="970591234567"
            dir="ltr"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">اسم المتجر</Label>
          <Input
            value={values['store_name_ar'] || ''}
            onChange={e => setValues(p => ({ ...p, store_name_ar: e.target.value }))}
            placeholder="متجرنا"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">ملاحظة الشحن (تظهر في المتجر)</Label>
          <Input
            value={values['store_free_shipping_note'] || ''}
            onChange={e => setValues(p => ({ ...p, store_free_shipping_note: e.target.value }))}
            placeholder="مثال: الشحن مجاني لطلبات أكثر من ₪500"
            className="h-9 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">العملة</Label>
          <select value={values['store_currency'] || 'ILS'}
            onChange={e => setValues(p => ({ ...p, store_currency: e.target.value }))}
            className="h-9 px-3 text-sm rounded-md w-40" style={{ border: '1px solid #e5e7eb' }}>
            <option value="ILS">₪ شيكل (ILS)</option>
            <option value="USD">$ دولار (USD)</option>
            <option value="JOD">JD دينار أردني</option>
          </select>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
        <h2 className="font-semibold text-gray-800 text-sm pb-3 mb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>روابط سريعة</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/store" target="_blank" className="px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: '#F5A623' }}>
            عرض المتجر ↗
          </a>
          <a href="/dashboard/products" className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}>
            إدارة المنتجات
          </a>
          <a href="/dashboard/orders" className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}>
            إدارة الطلبات
          </a>
        </div>
      </div>
    </div>
  );
}
