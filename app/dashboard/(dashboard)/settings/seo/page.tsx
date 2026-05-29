'use client';

import { useState, useEffect } from 'react';
import { Search, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const KEYS = [
  'meta_title_ar', 'meta_title_en',
  'meta_description_ar', 'meta_description_en',
  'og_image', 'keywords_ar', 'keywords_en',
  'site_name_ar', 'site_name_en',
];

const LABELS: Record<string, string> = {
  meta_title_ar: 'عنوان الصفحة (عربي)',
  meta_title_en: 'عنوان الصفحة (إنجليزي)',
  meta_description_ar: 'وصف ميتا (عربي)',
  meta_description_en: 'وصف ميتا (إنجليزي)',
  og_image: 'رابط صورة OG (Open Graph)',
  keywords_ar: 'الكلمات المفتاحية (عربي، مفصولة بفاصلة)',
  keywords_en: 'الكلمات المفتاحية (إنجليزي، مفصولة بفاصلة)',
  site_name_ar: 'اسم الموقع (عربي)',
  site_name_en: 'اسم الموقع (إنجليزي)',
};

const TEXTAREA_KEYS = ['meta_description_ar', 'meta_description_en', 'keywords_ar', 'keywords_en'];

export default function SeoSettingsPage() {
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
      if (res.ok) toast.success('تم حفظ إعدادات SEO');
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
          <Search className="h-5 w-5 text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات SEO</h1>
            <p className="text-sm text-gray-500">عنوان الصفحة، وصف ميتا، صورة OG، الكلمات المفتاحية</p>
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
            <div key={key} className={`space-y-1.5 ${TEXTAREA_KEYS.includes(key) || key === 'og_image' ? 'sm:col-span-2' : ''}`}>
              <Label className="text-sm font-medium text-gray-700">{LABELS[key] || key}</Label>
              {TEXTAREA_KEYS.includes(key) ? (
                <Textarea
                  value={values[key] || ''}
                  onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                  rows={3}
                  className="text-sm"
                  dir={key.endsWith('_en') ? 'ltr' : undefined}
                />
              ) : (
                <Input
                  value={values[key] || ''}
                  onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                  className="h-9 text-sm"
                  dir={key.endsWith('_en') || key === 'og_image' ? 'ltr' : undefined}
                  placeholder={key === 'og_image' ? 'https://...' : undefined}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
