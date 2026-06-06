'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calculator, Save, Loader2, Plus, Trash2, Battery,
  MessageCircle, BookOpen, Settings2, DollarSign, Phone,
  Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { SystemSize, BatteryOption, SystemTypeContent, SystemContentConfig } from '@/lib/calculator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigState {
  pricePerKwhIls: number;
  sunHoursPerDay: number;
  panelWatts: number;
  minBillIls: number;
  maxBillIls: number;
  maxSystemKw: number;
  systemSizes: SystemSize[];
  batteryOptions: BatteryOption[];
  batteryVisible: boolean;
  systemContent: SystemContentConfig | null;
  contactWhatsapp: string;
  contactPhone: string;
  contactEmail: string;
  contactMessage: string;
}

const DEFAULT_CONFIG: ConfigState = {
  pricePerKwhIls: 0.70,
  sunHoursPerDay: 5.5,
  panelWatts: 620,
  minBillIls: 300,
  maxBillIls: 3000,
  maxSystemKw: 30,
  systemSizes: [],
  batteryOptions: [],
  batteryVisible: true,
  systemContent: null,
  contactWhatsapp: '',
  contactPhone: '',
  contactEmail: '',
  contactMessage: 'نظامك يحتاج دراسة خاصة، تواصل معنا مباشرة وسيقوم فريقنا بمساعدتك',
};

const DEFAULT_SYSTEM_CONTENT: SystemContentConfig = {
  onGrid: {
    name: 'نظام شبكي (On-Grid)',
    shortDesc: 'الأقل تكلفة، متصل بشبكة الكهرباء',
    fullDesc: 'النظام الشبكي يعمل بالتوازي مع شبكة الكهرباء العامة. يقلل فاتورتك بشكل كبير ويتيح بيع الكهرباء الفائضة للشركة.',
    pros: ['الأقل تكلفة', 'لا يحتاج بطاريات', 'صيانة بسيطة', 'عمر طويل'],
    cons: ['يتوقف عند انقطاع الكهرباء', 'يعتمد على وجود شبكة'],
  },
  offGrid: {
    name: 'نظام مستقل (Off-Grid)',
    shortDesc: 'مستقل تماماً عن شبكة الكهرباء',
    fullDesc: 'النظام المستقل يعمل بشكل كامل دون الحاجة لشبكة الكهرباء. مثالي للمناطق التي لا تصلها الكهرباء.',
    pros: ['استقلالية كاملة', 'يعمل في المناطق النائية', 'لا فواتير كهرباء'],
    cons: ['الأعلى تكلفة', 'يحتاج بطاريات', 'صيانة أكثر'],
  },
  hybrid: {
    name: 'نظام هجين (Hybrid)',
    shortDesc: 'شبكة + بطاريات احتياطية',
    fullDesc: 'النظام الهجين يجمع بين مميزات النظامين. متصل بالشبكة ولديه بطاريات احتياطية تعمل وقت انقطاع الكهرباء.',
    pros: ['يعمل وقت انقطاع الكهرباء', 'توفير عالٍ في الفاتورة', 'مرونة عالية'],
    cons: ['تكلفة متوسطة-عالية', 'يحتاج بطاريات'],
  },
};

type TabId = 'params' | 'sizes' | 'batteries' | 'content' | 'contact';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'params', label: 'معاملات الحساب', icon: <Calculator className="h-4 w-4" /> },
  { id: 'sizes', label: 'أحجام الأنظمة', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'batteries', label: 'البطاريات', icon: <Battery className="h-4 w-4" /> },
  { id: 'content', label: 'المحتوى التعليمي', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'contact', label: 'التواصل المباشر', icon: <Phone className="h-4 w-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CalculatorConfigPage() {
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('params');
  const [previewBill, setPreviewBill] = useState<string>('500');
  const [batteryModal, setBatteryModal] = useState<{ open: boolean; editing: BatteryOption | null }>({ open: false, editing: null });
  const [batteryForm, setBatteryForm] = useState<Omit<BatteryOption, 'id'>>({ labelAr: '', capacityKwh: 0, priceIls: 0 });
  const [openSystemSection, setOpenSystemSection] = useState<keyof SystemContentConfig>('onGrid');

  useEffect(() => {
    fetch('/api/calculator-config')
      .then(r => r.json())
      .then((data: Partial<ConfigState>) => {
        if (data && Object.keys(data).length > 0) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data,
            systemSizes: Array.isArray(data.systemSizes) ? data.systemSizes : [],
            batteryOptions: Array.isArray(data.batteryOptions) ? data.batteryOptions : [],
            systemContent: (data.systemContent as SystemContentConfig | null) ?? null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const livePreview = useMemo(() => {
    const bill = parseFloat(previewBill) || 0;
    if (!bill) return null;
    const step1 = bill / config.pricePerKwhIls;
    const step2 = step1 / 30;
    const step3 = step2 / config.sunHoursPerDay;
    const sorted = [...config.systemSizes].sort((a, b) => a.kw - b.kw);
    const matched = sorted.find(s => s.kw >= step3);
    const panels = matched ? Math.round((matched.kw * 1000) / config.panelWatts) : null;
    return { step1, step2, step3, matchedKw: matched?.kw ?? null, panels };
  }, [previewBill, config]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/calculator-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) toast.success('تم حفظ الإعدادات بنجاح');
      else toast.error('خطأ في الحفظ');
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof ConfigState>(key: K, value: ConfigState[K]) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }

  // ── أحجام الأنظمة ──

  function addSize() {
    const newSize: SystemSize = { kw: 0, onGrid: 0, offGrid: 0, hybrid: 0 };
    updateField('systemSizes', [...config.systemSizes, newSize]);
  }

  function updateSize(index: number, field: keyof SystemSize, value: number) {
    const updated = config.systemSizes.map((s, i) =>
      i === index ? { ...s, [field]: value } : s,
    );
    updateField('systemSizes', updated.sort((a, b) => a.kw - b.kw));
  }

  function removeSize(index: number) {
    updateField('systemSizes', config.systemSizes.filter((_, i) => i !== index));
  }

  // ── البطاريات ──

  function openAddBattery() {
    setBatteryForm({ labelAr: '', capacityKwh: 0, priceIls: 0 });
    setBatteryModal({ open: true, editing: null });
  }

  function openEditBattery(bat: BatteryOption) {
    setBatteryForm({ labelAr: bat.labelAr, capacityKwh: bat.capacityKwh, priceIls: bat.priceIls });
    setBatteryModal({ open: true, editing: bat });
  }

  function saveBattery() {
    if (!batteryForm.labelAr) return;
    if (batteryModal.editing) {
      updateField('batteryOptions', config.batteryOptions.map(b =>
        b.id === batteryModal.editing!.id ? { ...batteryModal.editing!, ...batteryForm } : b,
      ));
    } else {
      updateField('batteryOptions', [
        ...config.batteryOptions,
        { id: `bat-${Date.now()}`, ...batteryForm },
      ]);
    }
    setBatteryModal({ open: false, editing: null });
  }

  function removeBattery(id: string) {
    updateField('batteryOptions', config.batteryOptions.filter(b => b.id !== id));
  }

  // ── المحتوى التعليمي ──

  function getContent(): SystemContentConfig {
    return config.systemContent ?? DEFAULT_SYSTEM_CONTENT;
  }

  function updateContent(
    key: keyof SystemContentConfig,
    field: keyof SystemTypeContent,
    value: string | string[],
  ) {
    const current = getContent();
    updateField('systemContent', {
      ...current,
      [key]: { ...current[key], [field]: value },
    });
  }

  function addListItem(key: keyof SystemContentConfig, field: 'pros' | 'cons') {
    const current = getContent();
    updateField('systemContent', {
      ...current,
      [key]: { ...current[key], [field]: [...current[key][field], ''] },
    });
  }

  function updateListItem(
    key: keyof SystemContentConfig,
    field: 'pros' | 'cons',
    index: number,
    value: string,
  ) {
    const current = getContent();
    const arr = [...current[key][field]];
    arr[index] = value;
    updateField('systemContent', {
      ...current,
      [key]: { ...current[key], [field]: arr },
    });
  }

  function removeListItem(key: keyof SystemContentConfig, field: 'pros' | 'cons', index: number) {
    const current = getContent();
    updateField('systemContent', {
      ...current,
      [key]: { ...current[key], [field]: current[key][field].filter((_, i) => i !== index) },
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const systemSections: { key: keyof SystemContentConfig; label: string; emoji: string }[] = [
    { key: 'onGrid', label: 'نظام شبكي', emoji: '🔌' },
    { key: 'offGrid', label: 'نظام مستقل', emoji: '🔋' },
    { key: 'hybrid', label: 'نظام هجين', emoji: '⚡' },
  ];

  return (
    <div className="space-y-5 max-w-4xl" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-gray-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات الحاسبة الشمسية</h1>
            <p className="text-sm text-gray-500">تحكم بمنطق الحساب والأسعار والمحتوى</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-1.5 text-white font-semibold"
          style={{ backgroundColor: '#F5A623' }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* Tabs */}
      <div
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
        style={{ border: '1px solid #e5e7eb' }}
      >
        <div
          className="flex overflow-x-auto border-b"
          style={{ borderColor: '#e5e7eb' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                color: activeTab === tab.id ? '#F5A623' : '#6b7280',
                borderBottom: activeTab === tab.id ? '2px solid #F5A623' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ───── تبويب 1: معاملات الحساب ───── */}
          {activeTab === 'params' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'pricePerKwhIls', label: 'سعر الكيلوواط (شيكل)', desc: 'الفاتورة ÷ هذا الرقم = kWh/شهر', step: '0.01' },
                  { key: 'sunHoursPerDay', label: 'ساعات الشمس اليومية', desc: 'kWh/يوم ÷ هذا الرقم = حجم النظام الخام', step: '0.1' },
                  { key: 'panelWatts', label: 'واط اللوح الواحد', desc: '(حجم النظام × 1000) ÷ هذا الرقم = عدد الألواح', step: '1' },
                  { key: 'minBillIls', label: 'أقل فاتورة مدعومة (₪)', desc: 'إذا الفاتورة أقل من هذا ← رسالة تواصل', step: '1' },
                  { key: 'maxBillIls', label: 'أعلى فاتورة مدعومة (₪)', desc: 'إذا الفاتورة أكبر من هذا ← رسالة تواصل', step: '1' },
                  { key: 'maxSystemKw', label: 'أكبر نظام مسموح (kW)', desc: 'إذا النتيجة أكبر من هذا ← رسالة تواصل', step: '1' },
                ].map(({ key, label, desc, step }) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">{label}</Label>
                    <Input
                      type="number"
                      step={step}
                      value={config[key as keyof ConfigState] as number}
                      onChange={e =>
                        updateField(key as keyof ConfigState, parseFloat(e.target.value) as never)
                      }
                      className="h-9 text-sm"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                ))}
              </div>

              {/* صندوق المعاينة الحية */}
              <div
                className="rounded-xl p-4"
                style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Settings2 className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">
                    🔍 معاينة حية — اختبر بفاتورة:
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-yellow-600">₪</span>
                    <Input
                      type="number"
                      value={previewBill}
                      onChange={e => setPreviewBill(e.target.value)}
                      className="h-8 w-24 text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>
                {livePreview ? (
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      ₪{previewBill} ÷ {config.pricePerKwhIls} ={' '}
                      <strong className="text-blue-600">{livePreview.step1.toFixed(1)} kWh/شهر</strong>
                    </p>
                    <p>
                      {livePreview.step1.toFixed(1)} ÷ 30 ={' '}
                      <strong className="text-blue-600">{livePreview.step2.toFixed(2)} kWh/يوم</strong>
                    </p>
                    <p>
                      {livePreview.step2.toFixed(2)} ÷ {config.sunHoursPerDay} ={' '}
                      <strong className="text-yellow-600">
                        {livePreview.step3.toFixed(2)} kW
                        {livePreview.matchedKw
                          ? ` → يحتاج ${livePreview.matchedKw} kW (${livePreview.panels} لوح × ${config.panelWatts} واط)`
                          : ' → يحتاج تواصل مباشر'}
                      </strong>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">أدخل فاتورة لرؤية الحساب</p>
                )}
              </div>
            </div>
          )}

          {/* ───── تبويب 2: أحجام الأنظمة والأسعار ───── */}
          {activeTab === 'sizes' && (
            <div className="space-y-4">
              <div
                className="rounded-xl p-3 text-sm"
                style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
              >
                ⚠️ السعر المدخل هنا هو السعر <strong>الكامل</strong> للنظام شامل: الألواح + الانفيرتر + الهيكل الحديدي + الكوابل + القواطع + التركيب الكامل
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#f9fafb', color: '#6b7280' }}>
                      <th className="p-3 text-right font-medium">حجم (kW)</th>
                      <th className="p-3 text-right font-medium">🔌 شبكي (₪)</th>
                      <th className="p-3 text-right font-medium">🔋 مستقل (₪)</th>
                      <th className="p-3 text-right font-medium">⚡ هجين (₪)</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...config.systemSizes]
                      .sort((a, b) => a.kw - b.kw)
                      .map((size, idx) => (
                        <tr
                          key={idx}
                          style={{ borderTop: '1px solid #f3f4f6' }}
                        >
                          {(['kw', 'onGrid', 'offGrid', 'hybrid'] as (keyof SystemSize)[]).map(field => (
                            <td key={field} className="p-2">
                              <Input
                                type="number"
                                value={size[field]}
                                onChange={e =>
                                  updateSize(idx, field, parseFloat(e.target.value) || 0)
                                }
                                className="h-8 text-sm"
                                dir="ltr"
                              />
                            </td>
                          ))}
                          <td className="p-2">
                            <button
                              onClick={() => removeSize(idx)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" onClick={addSize} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة حجم جديد
              </Button>
            </div>
          )}

          {/* ───── تبويب 3: البطاريات ───── */}
          {activeTab === 'batteries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  إظهار قسم البطاريات في حاسبة الموقع
                </Label>
                <button
                  onClick={() => updateField('batteryVisible', !config.batteryVisible)}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: config.batteryVisible ? '#F5A623' : '#9ca3af' }}
                >
                  {config.batteryVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {config.batteryVisible ? 'ظاهر' : 'مخفي'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#f9fafb', color: '#6b7280' }}>
                      <th className="p-3 text-right font-medium">اسم البطارية</th>
                      <th className="p-3 text-right font-medium">السعة (kWh)</th>
                      <th className="p-3 text-right font-medium">السعر (₪)</th>
                      <th className="p-3 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.batteryOptions.map(bat => (
                      <tr key={bat.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td className="p-3 text-gray-700">{bat.labelAr}</td>
                        <td className="p-3 text-gray-700">{bat.capacityKwh}</td>
                        <td className="p-3 text-gray-700">₪{bat.priceIls.toLocaleString('ar')}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditBattery(bat)}
                              className="text-blue-400 hover:text-blue-600"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => removeBattery(bat.id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" onClick={openAddBattery} className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة بطارية جديدة
              </Button>
            </div>
          )}

          {/* ───── تبويب 4: المحتوى التعليمي ───── */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {systemSections.map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={() => setOpenSystemSection(key)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: openSystemSection === key ? '#FEF3C7' : '#f9fafb',
                      border: `1px solid ${openSystemSection === key ? '#F5A623' : '#e5e7eb'}`,
                      color: openSystemSection === key ? '#92400e' : '#6b7280',
                    }}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>

              {systemSections
                .filter(({ key }) => key === openSystemSection)
                .map(({ key, label, emoji }) => {
                  const c = getContent()[key];
                  return (
                    <div key={key} className="space-y-4">
                      <h3 className="font-semibold text-gray-800">
                        {emoji} {label}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm">اسم النظام (عربي)</Label>
                          <Input
                            value={c.name}
                            onChange={e => updateContent(key, 'name', e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">وصف قصير (يظهر في كرت الاختيار)</Label>
                          <Input
                            value={c.shortDesc}
                            onChange={e => updateContent(key, 'shortDesc', e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-sm">وصف مفصل (يظهر في صفحة الشرح)</Label>
                          <Textarea
                            value={c.fullDesc}
                            onChange={e => updateContent(key, 'fullDesc', e.target.value)}
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(['pros', 'cons'] as const).map(field => (
                          <div key={field} className="space-y-2">
                            <Label className="text-sm font-medium">
                              {field === 'pros' ? '✅ المميزات' : '❌ العيوب'}
                            </Label>
                            {c[field].map((item, i) => (
                              <div key={i} className="flex gap-2">
                                <Input
                                  value={item}
                                  onChange={e => updateListItem(key, field, i, e.target.value)}
                                  className="h-8 text-sm flex-1"
                                />
                                <button
                                  onClick={() => removeListItem(key, field, i)}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addListItem(key, field)}
                              className="gap-1 text-xs"
                            >
                              <Plus className="h-3 w-3" />
                              إضافة
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* ───── تبويب 5: التواصل المباشر ───── */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">رقم الواتساب (بدون +)</Label>
                  <Input
                    value={config.contactWhatsapp}
                    onChange={e => updateField('contactWhatsapp', e.target.value)}
                    placeholder="970591234567"
                    className="h-9 text-sm"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">رقم الهاتف</Label>
                  <Input
                    value={config.contactPhone}
                    onChange={e => updateField('contactPhone', e.target.value)}
                    placeholder="+970-5-9123456"
                    className="h-9 text-sm"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">البريد الإلكتروني</Label>
                  <Input
                    value={config.contactEmail}
                    onChange={e => updateField('contactEmail', e.target.value)}
                    placeholder="info@example.com"
                    className="h-9 text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
              <div
                className="my-4"
                style={{ borderTop: '1px solid #e5e7eb' }}
              />
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  رسالة &quot;النظام الكبير&quot; (تظهر عند تجاوز الحدود)
                </Label>
                <Textarea
                  value={config.contactMessage}
                  onChange={e => updateField('contactMessage', e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Battery Modal */}
      {batteryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            style={{ border: '1px solid #e5e7eb' }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {batteryModal.editing ? 'تعديل البطارية' : 'إضافة بطارية جديدة'}
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm">اسم البطارية (عربي)</Label>
                <Input
                  value={batteryForm.labelAr}
                  onChange={e => setBatteryForm(p => ({ ...p, labelAr: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-sm">السعة (kWh)</Label>
                  <Input
                    type="number"
                    value={batteryForm.capacityKwh}
                    onChange={e => setBatteryForm(p => ({ ...p, capacityKwh: parseFloat(e.target.value) || 0 }))}
                    className="h-9 text-sm"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">السعر (₪)</Label>
                  <Input
                    type="number"
                    value={batteryForm.priceIls}
                    onChange={e => setBatteryForm(p => ({ ...p, priceIls: parseFloat(e.target.value) || 0 }))}
                    className="h-9 text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button
                onClick={saveBattery}
                disabled={!batteryForm.labelAr}
                className="flex-1 text-white"
                style={{ backgroundColor: '#F5A623' }}
              >
                حفظ
              </Button>
              <Button
                variant="outline"
                onClick={() => setBatteryModal({ open: false, editing: null })}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
