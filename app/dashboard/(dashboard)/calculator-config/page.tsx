'use client';

import { useState, useEffect } from 'react';
import { Calculator, Save, Loader2, RefreshCw, Plus, Trash2, Pencil, Battery } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface BatteryOption {
  id: string;
  labelAr: string;
  weightKg: number;
  priceIls: number;
}

interface SystemPricing {
  ON_GRID: number;
  OFF_GRID: number;
  HYBRID: number;
  AGRICULTURAL: number;
  COMMERCIAL: number;
}

interface Config {
  id?: string;
  averageSunHoursPerDay: number;
  panelWatts: number;
  inverterEfficiency: number;
  systemLoss: number;
  pricePerKwhIls: number;
  pricePerWattInstalled: number;
  panelPriceIls: number;
  inverterPriceBase: number;
  batteryPricePerKwh: number;
  systemLifeYears: number;
  annualDegradation: number;
  co2PerKwh: number;
  systemPricing?: SystemPricing;
  batteryOptions?: BatteryOption[];
  batteryVisible?: boolean;
}

const DEFAULTS: Config = {
  averageSunHoursPerDay: 5.5,
  panelWatts: 550,
  inverterEfficiency: 0.96,
  systemLoss: 0.14,
  pricePerKwhIls: 0.70,
  pricePerWattInstalled: 4.50,
  panelPriceIls: 400,
  inverterPriceBase: 3500,
  batteryPricePerKwh: 2200,
  systemLifeYears: 25,
  annualDegradation: 0.005,
  co2PerKwh: 0.49,
  systemPricing: {
    ON_GRID: 4.50,
    OFF_GRID: 5.50,
    HYBRID: 6.00,
    AGRICULTURAL: 4.20,
    COMMERCIAL: 4.30,
  },
  batteryOptions: [],
  batteryVisible: true,
};

const GENERAL_FIELDS = [
  { key: 'averageSunHoursPerDay' as keyof Config, label: 'ساعات الشمس اليومية', desc: 'متوسط ساعات الشمس باليوم لمنطقتك', step: '0.1' },
  { key: 'panelWatts' as keyof Config, label: 'قدرة اللوح الواحد (واط)', desc: 'قدرة اللوح الشمسي المستخدم', step: '1' },
  { key: 'inverterEfficiency' as keyof Config, label: 'كفاءة المحول (0-1)', desc: 'نسبة كفاءة المحول (مثال: 0.96 = 96%)', step: '0.01' },
  { key: 'systemLoss' as keyof Config, label: 'خسائر النظام (0-1)', desc: 'نسبة الخسائر الكلية للنظام', step: '0.01' },
  { key: 'pricePerKwhIls' as keyof Config, label: 'سعر الكيلوواط (شيكل)', desc: 'سعر الكيلوواط/ساعة من شركة الكهرباء', step: '0.01' },
  { key: 'pricePerWattInstalled' as keyof Config, label: 'سعر الواط المركب الافتراضي (شيكل)', desc: 'التكلفة الافتراضية للواط (يُستبدل بتسعير الأنظمة)', step: '0.1' },
  { key: 'systemLifeYears' as keyof Config, label: 'عمر النظام (سنة)', desc: 'العمر الافتراضي للنظام', step: '1' },
  { key: 'annualDegradation' as keyof Config, label: 'تدهور سنوي (0-1)', desc: 'نسبة انخفاض الكفاءة سنوياً', step: '0.001' },
  { key: 'co2PerKwh' as keyof Config, label: 'CO₂ لكل كيلوواط (كغ)', desc: 'كمية CO₂ الموفرة لكل كيلوواط منتج', step: '0.01' },
];

const SYSTEM_TYPES = [
  { key: 'ON_GRID', label: 'متصل بالشبكة (On-Grid)', color: '#0EA5E9' },
  { key: 'OFF_GRID', label: 'منفصل عن الشبكة (Off-Grid)', color: '#10B981' },
  { key: 'HYBRID', label: 'هجين (Hybrid)', color: '#F59E0B' },
  { key: 'AGRICULTURAL', label: 'زراعي (Agricultural)', color: '#84CC16' },
  { key: 'COMMERCIAL', label: 'تجاري (Commercial)', color: '#8B5CF6' },
];

const EMPTY_BATTERY: BatteryOption = { id: '', labelAr: '', weightKg: 5, priceIls: 3000 };

export default function CalculatorConfigPage() {
  const [config, setConfig] = useState<Config>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'batteries'>('general');
  const [batteryModal, setBatteryModal] = useState(false);
  const [editBatteryIndex, setEditBatteryIndex] = useState<number | null>(null);
  const [batteryForm, setBatteryForm] = useState<BatteryOption>(EMPTY_BATTERY);

  useEffect(() => {
    fetch('/api/calculator-config')
      .then(r => r.json())
      .then(data => {
        if (data && data.id) {
          setConfig({
            ...DEFAULTS,
            ...data,
            systemPricing: data.systemPricing ? { ...DEFAULTS.systemPricing, ...(data.systemPricing as any) } : DEFAULTS.systemPricing,
            batteryOptions: data.batteryOptions ?? [],
            batteryVisible: data.batteryVisible ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof Config, value: string) => {
    setConfig(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const updateSystemPrice = (type: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      systemPricing: { ...(prev.systemPricing ?? DEFAULTS.systemPricing!), [type]: parseFloat(value) || 0 },
    }));
  };

  // إدارة البطاريات
  const openAddBattery = () => { setBatteryForm(EMPTY_BATTERY); setEditBatteryIndex(null); setBatteryModal(true); };
  const openEditBattery = (idx: number) => { setBatteryForm({ ...(config.batteryOptions ?? [])[idx] }); setEditBatteryIndex(idx); setBatteryModal(true); };
  const deleteBattery = (idx: number) => {
    setConfig(prev => ({ ...prev, batteryOptions: (prev.batteryOptions ?? []).filter((_, i) => i !== idx) }));
  };
  const saveBattery = () => {
    if (!batteryForm.id || !batteryForm.labelAr || !batteryForm.weightKg || !batteryForm.priceIls) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setConfig(prev => {
      const options = [...(prev.batteryOptions ?? [])];
      if (editBatteryIndex !== null) options[editBatteryIndex] = batteryForm;
      else options.push(batteryForm);
      return { ...prev, batteryOptions: options };
    });
    setBatteryModal(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/calculator-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) toast.success('تم حفظ الإعدادات بنجاح');
      else toast.error('خطأ في الحفظ');
    } catch { toast.error('خطأ في الاتصال'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  const TABS = [
    { id: 'general', label: 'معاملات عامة' },
    { id: 'pricing', label: 'تسعير الأنظمة' },
    { id: 'batteries', label: 'البطاريات' },
  ] as const;

  return (
    <div className="space-y-5 max-w-4xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات الحاسبة</h1>
          <p className="text-sm text-gray-500">تعديل المتغيرات المستخدمة في حاسبة الطاقة الشمسية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfig(DEFAULTS)} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />الافتراضي
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5 text-white font-semibold" style={{ backgroundColor: '#10B981' }}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            حفظ الكل
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ backgroundColor: activeTab === tab.id ? 'white' : 'transparent', color: activeTab === tab.id ? '#111827' : '#6B7280', boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: معاملات عامة */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <Calculator className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-gray-900">معاملات الحساب العامة</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {GENERAL_FIELDS.map(({ key, label, desc, step }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{label}</Label>
                <Input type="number" step={step} value={config[key] as number} onChange={e => update(key, e.target.value)} className="h-10 text-sm" />
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: تسعير الأنظمة */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5" style={{ border: '1px solid #e5e7eb' }}>
          <div className="pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <h2 className="font-bold text-gray-900">تسعير الأنظمة</h2>
            <p className="text-sm text-gray-500 mt-1">حدد سعر الواط المركب لكل نوع نظام بالشيكل</p>
          </div>
          <div className="space-y-4">
            {SYSTEM_TYPES.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number" step="0.1" min="0"
                    value={(config.systemPricing as any)?.[key] ?? 4.5}
                    onChange={e => updateSystemPrice(key, e.target.value)}
                    className="h-9 text-sm w-28" dir="ltr"
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">شيكل/واط</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: البطاريات */}
      {activeTab === 'batteries' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <h2 className="font-bold text-gray-900">إعدادات البطاريات</h2>
              <p className="text-sm text-gray-500 mt-1">حزم البطاريات المتاحة للمستخدمين في الحاسبة (للأنظمة المنفصلة والهجينة)</p>
            </div>
            <Button onClick={openAddBattery} size="sm" className="gap-1.5 text-white" style={{ backgroundColor: '#10B981' }}>
              <Plus className="h-3.5 w-3.5" />إضافة حزمة
            </Button>
          </div>

          {/* Toggle إظهار قسم البطاريات */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <div className="flex items-center gap-3">
              <Battery className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium text-sm text-gray-900">إظهار قسم البطاريات في الحاسبة</div>
                <div className="text-xs text-gray-500">عند الإيقاف لن يرى المستخدمون خيار إضافة بطاريات</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, batteryVisible: !prev.batteryVisible }))}
              className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ backgroundColor: config.batteryVisible ? '#10B981' : '#D1D5DB' }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                style={{ right: config.batteryVisible ? '4px' : '26px' }}
              />
            </button>
          </div>

          {/* جدول الحزم */}
          {(config.batteryOptions ?? []).length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              لا توجد حزم بطاريات بعد — أضف حزمة بالضغط على الزر أعلاه
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['المعرف', 'الاسم', 'الوزن (كيلو)', 'السعر (شيكل)', 'إجراءات'].map(h => (
                      <th key={h} className="px-3 py-2 text-right font-medium text-gray-500 text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(config.batteryOptions ?? []).map((opt, idx) => (
                    <tr key={opt.id} className="hover:bg-gray-50" style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td className="px-3 py-2 text-gray-500 text-xs font-mono">{opt.id}</td>
                      <td className="px-3 py-2 font-medium text-gray-900">{opt.labelAr}</td>
                      <td className="px-3 py-2 font-semibold text-green-600">{opt.weightKg} كيلو</td>
                      <td className="px-3 py-2 font-semibold text-amber-600">₪{opt.priceIls.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditBattery(idx)} className="text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => deleteBattery(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* نافذة إضافة/تعديل حزمة بطارية */}
      {batteryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBatteryModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-gray-900">{editBatteryIndex !== null ? 'تعديل حزمة البطارية' : 'إضافة حزمة بطارية جديدة'}</h2>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">معرف فريد</Label>
              <Input value={batteryForm.id} onChange={e => setBatteryForm(p => ({ ...p, id: e.target.value }))} placeholder="battery-5kg" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">الاسم (عربي)</Label>
              <Input value={batteryForm.labelAr} onChange={e => setBatteryForm(p => ({ ...p, labelAr: e.target.value }))} placeholder="بطارية 5 كيلو" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">الوزن (كيلو)</Label>
                <Input type="number" step="1" min="1" max="50" value={batteryForm.weightKg} onChange={e => setBatteryForm(p => ({ ...p, weightKg: parseFloat(e.target.value) || 0 }))} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">السعر (شيكل)</Label>
                <Input type="number" step="100" min="0" value={batteryForm.priceIls} onChange={e => setBatteryForm(p => ({ ...p, priceIls: parseFloat(e.target.value) || 0 }))} dir="ltr" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setBatteryModal(false)}>إلغاء</Button>
              <Button onClick={saveBattery} className="flex-1 text-white" style={{ backgroundColor: '#10B981' }}>
                {editBatteryIndex !== null ? 'حفظ التعديل' : 'إضافة'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
