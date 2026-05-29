'use client';

import { useState, useEffect } from 'react';
import { Home, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const KEYS = [
  'hero_title_ar',
  'hero_subtitle_ar',
  'hero_cta_ar',
  'tagline_ar',
  'stats_projects', 'stats_clients', 'stats_mw',
];

const LABELS: Record<string, string> = {
  hero_title_ar: 'عنوان الهيرو',
  hero_subtitle_ar: 'الوصف المختصر',
  hero_cta_ar: 'نص زر الطلب',
  tagline_ar: 'الشعار',
  stats_projects: 'عدد المشاريع',
  stats_clients: 'عدد العملاء',
  stats_mw: 'الميجاواط المثبتة',
};

const TEXTAREA_KEYS = ['hero_subtitle_ar'];

export default function HomepageSettingsPage() {
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

  const projectsVisible = values['section_projects_visible'] !== 'false';

  const handleSave = async () => {
    setSaving(true);
    const allKeys = [...KEYS, 'section_projects_visible'];
    const payload = allKeys.map(key => ({ key, value: values[key] || '' }));
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) toast.success('تم حفظ إعدادات الصفحة الرئيسية');
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
          <Home className="h-5 w-5 text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات الصفحة الرئيسية</h1>
            <p className="text-sm text-gray-500">عنوان الهيرو، الشعار، أزرار الطلب، الإحصائيات</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ
        </Button>
      </div>

      {/* إعدادات الصفحة الرئيسية */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5" style={{ border: '1px solid #e5e7eb' }}>
        <h2 className="font-semibold text-gray-800 text-sm pb-2" style={{ borderBottom: '1px solid #f3f4f6' }}>محتوى الصفحة الرئيسية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KEYS.map(key => (
            <div key={key} className={`space-y-1.5 ${TEXTAREA_KEYS.includes(key) ? 'sm:col-span-2' : ''}`}>
              <Label className="text-sm font-medium text-gray-700">{LABELS[key] || key}</Label>
              {TEXTAREA_KEYS.includes(key) ? (
                <Textarea
                  value={values[key] || ''}
                  onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                  rows={3}
                  className="text-sm"
                />
              ) : (
                <Input
                  value={values[key] || ''}
                  onChange={e => setValues(p => ({ ...p, [key]: e.target.value }))}
                  className="h-9 text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* إعدادات الأقسام */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4" style={{ border: '1px solid #e5e7eb' }}>
        <h2 className="font-semibold text-gray-800 text-sm pb-2" style={{ borderBottom: '1px solid #f3f4f6' }}>إظهار / إخفاء الأقسام</h2>
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <div className="flex items-center gap-3">
            {projectsVisible ? <Eye className="h-5 w-5 text-blue-500" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
            <div>
              <div className="font-medium text-sm text-gray-900">قسم مشاريعنا</div>
              <div className="text-xs text-gray-500">
                {projectsVisible ? 'ظاهر في الصفحة الرئيسية' : 'مخفي من الصفحة الرئيسية'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setValues(p => ({ ...p, section_projects_visible: projectsVisible ? 'false' : 'true' }))}
            className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
            style={{ backgroundColor: projectsVisible ? '#3B82F6' : '#D1D5DB' }}
          >
            <div
              className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
              style={{ right: projectsVisible ? '4px' : '26px' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
