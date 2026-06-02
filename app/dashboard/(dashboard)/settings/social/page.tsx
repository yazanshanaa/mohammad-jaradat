'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.02a8.16 8.16 0 004.77 1.52V7.09a4.85 4.85 0 01-1-.4z" />
    </svg>
  );
}

const SOCIAL_KEYS = ['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube'];

const SOCIAL_CONFIG = [
  {
    key: 'facebook',
    label: 'فيسبوك',
    placeholder: 'https://facebook.com/your-page',
    color: '#1877F2',
    icon: FacebookIcon,
  },
  {
    key: 'instagram',
    label: 'انستجرام',
    placeholder: 'https://instagram.com/your-account',
    color: '#E1306C',
    icon: InstagramIcon,
  },
  {
    key: 'tiktok',
    label: 'تيك توك',
    placeholder: 'https://tiktok.com/@your-account',
    color: '#000000',
    icon: TikTokIcon,
  },
];

export default function SocialSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({
    facebook: '',
    instagram: '',
    tiktok: '',
    linkedin: '',
    youtube: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((data: { key: string; value: string }[]) => {
        const map: Record<string, string> = {};
        (data || []).forEach(s => { map[s.key] = s.value; });
        setValues(prev => ({ ...prev, ...map }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const payload = SOCIAL_KEYS.map(key => ({ key, value: values[key] ?? '' }));
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) toast.success('تم حفظ روابط التواصل الاجتماعي');
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
    <div className="space-y-5 max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">روابط التواصل الاجتماعي</h1>
          <p className="text-sm text-gray-500">تظهر الأيقونات في أسفل الموقع عند إضافة الرابط</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ
        </Button>
      </div>

      {/* الحسابات الرئيسية */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5" style={{ border: '1px solid #e5e7eb' }}>
        <h2 className="font-semibold text-gray-800 text-sm pb-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
          الحسابات الرئيسية
        </h2>

        {SOCIAL_CONFIG.map(({ key, label, placeholder, color, icon: Icon }) => (
          <div key={key} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-sm font-medium text-gray-700">{label}</Label>
              <Input
                value={values[key] || ''}
                onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                dir="ltr"
                className="h-9 text-sm"
              />
            </div>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: values[key] ? '#22c55e' : '#d1d5db' }}
              title={values[key] ? 'مفعّل' : 'غير مفعّل'}
            />
          </div>
        ))}
      </div>

      {/* ملاحظة */}
      <div className="flex items-start gap-3 p-4 rounded-xl text-sm" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <span className="text-lg">💡</span>
        <p className="text-amber-800 leading-relaxed">
          أيقونة التواصل الاجتماعي تظهر تلقائياً في أسفل الموقع بمجرد إضافة الرابط والحفظ. اتركها فارغة لإخفاء الأيقونة.
        </p>
      </div>
    </div>
  );
}
