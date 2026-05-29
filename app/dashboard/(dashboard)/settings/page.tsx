'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
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
  working_hours_ar: 'ساعات العمل (عربي)',
  working_hours_en: 'ساعات العمل (إنجليزي)',
  facebook: 'رابط فيسبوك',
  instagram: 'رابط انستغرام',
  youtube: 'رابط يوتيوب',
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => setSettings(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

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

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
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

      {settings.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center" style={{ border: '1px solid #e5e7eb' }}>
          <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">لا توجد إعدادات. تأكد من تشغيل seed البيانات.</p>
        </div>
      )}
    </div>
  );
}
