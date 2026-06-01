'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Setting {
  id: string;
  key: string;
  value: string;
  type: string;
  group: string;
}

const SETTING_LABELS: Record<string, string> = {
  site_name_ar: 'اسم الموقع (عربي)',
  site_name_en: 'اسم الموقع (إنجليزي)',
  site_description_ar: 'وصف الموقع (عربي)',
  site_description_en: 'وصف الموقع (إنجليزي)',
  phone: 'رقم الهاتف',
  whatsapp: 'رقم الواتساب (بدون +)',
  email: 'البريد الإلكتروني',
  address_ar: 'العنوان (عربي)',
  address_en: 'العنوان (إنجليزي)',
  location_url: 'رابط الموقع الجغرافي (جوجل ماب)',
  working_hours_ar: 'ساعات العمل (عربي)',
  working_hours_en: 'ساعات العمل (إنجليزي)',
  facebook: 'رابط فيسبوك',
  instagram: 'رابط انستغرام',
  tiktok: 'رابط تيك توك',
  linkedin: 'رابط لينكدإن',
  hero_title_ar: 'عنوان الرئيسية (عربي)',
  hero_title_en: 'عنوان الرئيسية (إنجليزي)',
};

const GROUP_LABELS: Record<string, string> = {
  general: 'عام',
  contact: 'معلومات التواصل',
  social: 'التواصل الاجتماعي',
  homepage: 'الصفحة الرئيسية',
  stats: 'الإحصائيات',
  integrations: 'التكاملات',
};

const SECTION_TOGGLE_KEYS = ['section_services_visible', 'section_projects_visible'];
const SECTION_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  section_services_visible: { label: 'قسم الخدمات', desc: 'إظهار أو إخفاء قسم الخدمات من الموقع والقائمة', icon: '⚙️' },
  section_projects_visible: { label: 'قسم المشاريع', desc: 'إظهار أو إخفاء قسم المشاريع من الموقع والقائمة', icon: '🏗️' },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((data: Setting[]) => {
        const loaded = data || [];
        // ضمان وجود إعدادات الأقسام حتى لو لم تكن في قاعدة البيانات بعد
        const existingKeys = new Set(loaded.map(s => s.key));
        const missing: Setting[] = [
          { id: '', key: 'section_services_visible', value: 'true', type: 'text', group: 'sections' },
          { id: '', key: 'section_projects_visible', value: 'true', type: 'text', group: 'sections' },
          { id: '', key: 'tiktok', value: '', type: 'text', group: 'social' },
          { id: '', key: 'location_url', value: '', type: 'text', group: 'contact' },
        ].filter(s => !existingKeys.has(s.key));
        setSettings([...loaded, ...missing]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const getVal = (key: string) =>
    settings.find(s => s.key === key)?.value ?? 'true';

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success('تم حفظ الإعدادات');
      else toast.error('خطأ في الحفظ');
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  };

  // نستثني مفاتيح الأقسام من العرض العادي لأننا نعرضها كـ toggles
  const regularSettings = settings.filter(s => !SECTION_TOGGLE_KEYS.includes(s.key));

  const grouped = regularSettings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات الموقع</h1>
          <p className="text-sm text-gray-500">المعلومات العامة والتواصل والتكاملات</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 text-white font-semibold" style={{ backgroundColor: '#F5A623' }}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* إخفاء/إظهار أقسام الموقع */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4" style={{ border: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <Eye className="h-4 w-4 text-gray-400" />
          <h2 className="font-bold text-gray-900">إظهار/إخفاء أقسام الموقع</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTION_TOGGLE_KEYS.map(key => {
            const isVisible = getVal(key) !== 'false';
            const info = SECTION_LABELS[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between p-4 rounded-xl transition-all"
                style={{
                  backgroundColor: isVisible ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${isVisible ? '#bbf7d0' : '#fecaca'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{info.icon}</span>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{info.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{info.desc}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update(key, isVisible ? 'false' : 'true')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: isVisible ? '#22c55e' : '#ef4444',
                    color: 'white',
                  }}
                >
                  {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {isVisible ? 'ظاهر' : 'مخفي'}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400">
          عند الإخفاء يختفي القسم من الصفحة الرئيسية وقائمة التنقل كاملاً
        </p>
      </div>

      {/* الإعدادات العامة */}
      {Object.entries(grouped).map(([group, groupSettings]) => (
        <div key={group} className="bg-white rounded-2xl p-6 shadow-sm space-y-5" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <Settings className="h-4 w-4 text-gray-400" />
            <h2 className="font-bold text-gray-900">{GROUP_LABELS[group] || group}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupSettings.map((setting) => (
              <div key={setting.key} className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  {SETTING_LABELS[setting.key] || setting.key}
                </Label>
                {setting.type === 'textarea' ? (
                  <Textarea
                    value={setting.value}
                    onChange={e => update(setting.key, e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                ) : (
                  <Input
                    value={setting.value}
                    onChange={e => update(setting.key, e.target.value)}
                    className="h-9 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {regularSettings.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #e5e7eb' }}>
          <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">لا توجد إعدادات. تأكد من تشغيل seed البيانات.</p>
        </div>
      )}
    </div>
  );
}
