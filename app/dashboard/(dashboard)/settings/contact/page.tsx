'use client';

import { useState, useEffect } from 'react';
import { Phone, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const KEYS = [
  'phone', 'whatsapp', 'email',
  'address_ar',
  'working_hours_ar',
  'maps_embed_url',
];

const LABELS: Record<string, string> = {
  phone: 'رقم الهاتف',
  whatsapp: 'رقم الواتساب (بدون +)',
  email: 'البريد الإلكتروني',
  address_ar: 'العنوان',
  working_hours_ar: 'ساعات العمل',
  maps_embed_url: 'رابط خرائط Google (embed)',
};

const TEXTAREA_KEYS = ['address_ar', 'maps_embed_url'];

export default function ContactSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {};
        (data || []).forEach((s) => { map[s.key] = s.value; });
        setValues(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = KEYS.map(key => ({ key, value: values[key] || '' }));
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) toast.success('تم حفظ معلومات التواصل');
      else toast.error('خطأ في الحفظ');
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات التواصل</h1>
            <p className="text-sm text-gray-500">الهاتف، البريد، العنوان، خرائط Google</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5" style={{ border: '1px solid #e5e7eb' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KEYS.map(key => (
            <div key={key} className={`space-y-1.5 ${TEXTAREA_KEYS.includes(key) ? 'sm:col-span-2' : ''}`}>
              <Label className="text-sm font-medium text-gray-700">{LABELS[key] || key}</Label>
              {TEXTAREA_KEYS.includes(key) ? (
                <Textarea
                  value={values[key] || ''}
                  onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                  rows={key === 'maps_embed_url' ? 4 : 2}
                  className="text-sm"
                  dir={key === 'maps_embed_url' ? 'ltr' : undefined}
                />
              ) : (
                <Input
                  value={values[key] || ''}
                  onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                  className="h-9 text-sm"
                  dir={key === 'email' || key === 'whatsapp' || key === 'phone' ? 'ltr' : undefined}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
