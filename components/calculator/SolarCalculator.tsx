'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, BarChart3, ChevronRight, ChevronLeft,
  Loader2, RotateCcw, Zap, Home, Battery, DollarSign,
  Leaf, Clock, Sun, Layout, Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SYSTEMS_WITH_BATTERY, type BatteryOption, type CalculatorResult } from '@/lib/calculator';
import { SavingsDisplay } from './SavingsDisplay';
import dynamic from 'next/dynamic';

const ResultsChart = dynamic(() => import('./ResultsChart').then(mod => mod.ResultsChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-xl" />
});

import { QuoteRequestForm } from '@/components/forms/QuoteRequestForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type UsageType = 'residential' | 'commercial' | 'industrial' | 'agricultural';
type SystemType = 'on-grid' | 'off-grid' | 'hybrid' | 'auto';

interface FormState {
  monthlyBillIls: string;
  usageType: UsageType;
  systemType: SystemType;
  wantBatteries: boolean;
  selectedBatteryOptionId: string;
  batteryQuantity: string;
}

const USAGE_TYPES: { value: UsageType; label: string; icon: string }[] = [
  { value: 'residential', label: 'منزلي', icon: '🏠' },
  { value: 'commercial', label: 'تجاري', icon: '🏢' },
  { value: 'industrial', label: 'صناعي', icon: '🏭' },
  { value: 'agricultural', label: 'زراعي', icon: '🌾' },
];

const SYSTEM_TYPES: { value: SystemType; label: string; desc: string }[] = [
  { value: 'auto', label: 'تلقائي (موصى به)', desc: 'اختيار تلقائي حسب احتياجك' },
  { value: 'on-grid', label: 'متصل بالشبكة', desc: 'الأقل تكلفة، لا يوجد بطاريات' },
  { value: 'off-grid', label: 'مستقل عن الشبكة', desc: 'يعمل بشكل مستقل بالكامل' },
  { value: 'hybrid', label: 'هجين', desc: 'شبكة + بطاريات احتياطية' },
];

const steps = [
  { num: 1, label: 'الاستهلاك', icon: Zap },
  { num: 2, label: 'النظام', icon: Battery },
  { num: 3, label: 'النتائج', icon: BarChart3 },
];

export function SolarCalculator() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [batteryOptions, setBatteryOptions] = useState<BatteryOption[]>([]);
  const [batteryVisible, setBatteryVisible] = useState(true);

  const [form, setForm] = useState<FormState>({
    monthlyBillIls: '',
    usageType: 'residential',
    systemType: 'auto',
    wantBatteries: false,
    selectedBatteryOptionId: '',
    batteryQuantity: '1',
  });

  // تحميل خيارات البطاريات
  useEffect(() => {
    fetch('/api/calculator/options')
      .then(r => r.json())
      .then(data => {
        if (data.batteryOptions) setBatteryOptions(data.batteryOptions);
        if (data.batteryVisible === false) setBatteryVisible(false);
      })
      .catch(() => {});
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const selectedBatteryOption = batteryOptions.find(o => o.id === form.selectedBatteryOptionId);
  const maxBatteryQuantity = selectedBatteryOption
    ? Math.floor(50 / selectedBatteryOption.weightKg)
    : 10;

  const supportseBatteries = SYSTEMS_WITH_BATTERY.includes(form.systemType);

  const canGoNext = () => {
    if (step === 1) {
      const bill = parseFloat(form.monthlyBillIls);
      return !isNaN(bill) && bill >= 300;
    }
    return true;
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const batteryQty = form.wantBatteries && selectedBatteryOption
        ? Math.min(parseInt(form.batteryQuantity) || 1, maxBatteryQuantity)
        : 0;
      const batteryKg = batteryQty > 0 && selectedBatteryOption
        ? batteryQty * selectedBatteryOption.weightKg
        : 0;

      const body = {
        usageType: form.usageType,
        systemType: form.systemType,
        monthlyBillIls: parseFloat(form.monthlyBillIls),
        batteryKg: batteryKg || undefined,
        batteryUnitKg: selectedBatteryOption?.weightKg,
        batteryUnitPrice: selectedBatteryOption?.priceIls,
      };

      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Calculation failed');
      const data: CalculatorResult = await res.json();
      setResult(data);
      setStep(3);
    } catch {
      toast.error('حدث خطأ في الحساب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setForm({
      monthlyBillIls: '',
      usageType: 'residential',
      systemType: 'auto',
      wantBatteries: false,
      selectedBatteryOptionId: '',
      batteryQuantity: '1',
    });
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-primary)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)',
    height: '48px',
  };

  return (
    <>
      <div
        className="rounded-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="solar-gradient p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Calculator className="h-6 w-6" />
            <h2 className="text-xl font-bold">حاسبة الطاقة الشمسية</h2>
          </div>
          <p className="text-sm opacity-80">احسب حجم النظام المثالي ووفرك المالي خلال دقيقتين</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 pt-6 pb-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.num === step;
            const isDone = s.num < step;
            return (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: isDone ? 'var(--eco-green)' : isActive ? 'var(--solar-gold)' : 'var(--bg-primary)',
                      border: `2px solid ${isDone ? 'var(--eco-green)' : isActive ? 'var(--solar-gold)' : 'var(--border)'}`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: isDone || isActive ? 'white' : 'var(--text-secondary)' }} />
                  </div>
                  <span className="text-xs mt-1 hidden sm:block" style={{ color: isActive ? 'var(--solar-gold)' : 'var(--text-secondary)' }}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2" style={{ backgroundColor: isDone ? 'var(--eco-green)' : 'var(--border)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Step 1: الاستهلاك */}
              {step === 1 && (
                <>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    كم قيمة فاتورتك الشهرية؟
                  </h3>

                  <div className="space-y-2">
                    <Label style={{ color: 'var(--text-primary)' }}>
                      الفاتورة الشهرية (شيكل) *
                    </Label>
                    <div className="relative">
                      <span className="absolute start-3 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: 'var(--solar-gold)' }}>₪</span>
                      <Input
                        value={form.monthlyBillIls}
                        onChange={e => update('monthlyBillIls', e.target.value)}
                        placeholder="مثال: 500"
                        type="number"
                        min="300"
                        step="1"
                        className="ps-8"
                        style={inputStyle}
                      />
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      الحد الأدنى 300 شيكل — متوسط الفاتورة خلال آخر 3 أشهر
                    </p>
                    {form.monthlyBillIls && parseFloat(form.monthlyBillIls) < 300 && parseFloat(form.monthlyBillIls) > 0 && (
                      <p className="text-xs font-medium" style={{ color: '#ef4444' }}>
                        يجب أن تكون الفاتورة 300 شيكل على الأقل
                      </p>
                    )}
                  </div>

                  {/* نوع الاستخدام */}
                  <div className="space-y-2">
                    <Label style={{ color: 'var(--text-primary)' }}>نوع الاستخدام</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {USAGE_TYPES.map(u => (
                        <button
                          key={u.value}
                          type="button"
                          onClick={() => update('usageType', u.value)}
                          className="py-3 px-2 rounded-xl text-sm font-medium transition-all text-center"
                          style={{
                            backgroundColor: form.usageType === u.value ? 'rgba(245,166,35,0.15)' : 'var(--bg-primary)',
                            border: `2px solid ${form.usageType === u.value ? 'var(--solar-gold)' : 'var(--border)'}`,
                            color: form.usageType === u.value ? 'var(--solar-gold)' : 'var(--text-secondary)',
                          }}
                        >
                          <div className="text-lg mb-0.5">{u.icon}</div>
                          {u.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: النظام والبطاريات */}
              {step === 2 && (
                <>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    اختر نوع النظام
                  </h3>

                  {/* نوع النظام */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SYSTEM_TYPES.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => {
                          update('systemType', s.value);
                          // إذا اختار on-grid أو تغيير للنظام غير الداعم للبطاريات
                          if (!SYSTEMS_WITH_BATTERY.includes(s.value)) {
                            update('wantBatteries', false);
                          }
                        }}
                        className="p-3 rounded-xl text-sm transition-all text-start"
                        style={{
                          backgroundColor: form.systemType === s.value ? 'rgba(245,166,35,0.12)' : 'var(--bg-primary)',
                          border: `2px solid ${form.systemType === s.value ? 'var(--solar-gold)' : 'var(--border)'}`,
                        }}
                      >
                        <div className="font-semibold" style={{ color: form.systemType === s.value ? 'var(--solar-gold)' : 'var(--text-primary)' }}>
                          {s.label}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          {s.desc}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* قسم البطاريات - يظهر فقط للأنظمة الداعمة وعندما يكون مفعّلاً */}
                  {batteryVisible && supportseBatteries && batteryOptions.length > 0 && (
                    <div className="space-y-3">
                      {/* Toggle البطاريات */}
                      <div
                        className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                        style={{
                          backgroundColor: form.wantBatteries ? 'rgba(0,184,148,0.1)' : 'var(--bg-primary)',
                          border: `2px solid ${form.wantBatteries ? 'var(--eco-green)' : 'var(--border)'}`,
                        }}
                        onClick={() => update('wantBatteries', !form.wantBatteries)}
                      >
                        <div className="flex items-center gap-3">
                          <Battery className="h-5 w-5" style={{ color: form.wantBatteries ? 'var(--eco-green)' : 'var(--text-secondary)' }} />
                          <div>
                            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              إضافة بطاريات؟
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              اختياري — للتخزين الاحتياطي
                            </div>
                          </div>
                        </div>
                        <div
                          className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
                          style={{ backgroundColor: form.wantBatteries ? 'var(--eco-green)' : 'var(--border)' }}
                        >
                          <div
                            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300"
                            style={{ right: form.wantBatteries ? '4px' : '26px' }}
                          />
                        </div>
                      </div>

                      {/* خيارات البطاريات */}
                      {form.wantBatteries && (
                        <div className="space-y-3 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                          <div className="space-y-1.5">
                            <Label style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                              اختر نوع البطارية
                            </Label>
                            <select
                              value={form.selectedBatteryOptionId}
                              onChange={e => {
                                update('selectedBatteryOptionId', e.target.value);
                                update('batteryQuantity', '1');
                              }}
                              className="w-full rounded-md px-3 text-sm"
                              style={{ ...inputStyle, height: '44px', border: '1px solid var(--border)' }}
                            >
                              <option value="">— اختر —</option>
                              {batteryOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.labelAr} — ₪{opt.priceIls.toLocaleString()}
                                </option>
                              ))}
                            </select>
                          </div>

                          {selectedBatteryOption && (
                            <div className="space-y-1.5">
                              <Label style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                                الكمية (1 - {maxBatteryQuantity} كحد أقصى 50 كيلو)
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                max={maxBatteryQuantity}
                                value={form.batteryQuantity}
                                onChange={e => {
                                  const val = Math.min(parseInt(e.target.value) || 1, maxBatteryQuantity);
                                  update('batteryQuantity', String(val));
                                }}
                                style={{ ...inputStyle, height: '44px' }}
                              />
                              <p className="text-xs font-medium" style={{ color: 'var(--eco-green)' }}>
                                الإجمالي: {(parseInt(form.batteryQuantity) || 1) * selectedBatteryOption.weightKg} كيلو
                                {' '}— تكلفة إضافية ₪{((parseInt(form.batteryQuantity) || 1) * selectedBatteryOption.priceIls).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Step 3: النتائج */}
              {step === 3 && result && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      نتائج حسابك
                    </h3>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <RotateCcw className="h-4 w-4" />
                      إعادة
                    </button>
                  </div>

                  {/* الإحصائيات الرئيسية */}
                  <SavingsDisplay result={result} />

                  {/* مواصفات النظام */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Zap, label: 'حجم النظام', value: `${result.systemSizeKw} kW`, color: 'var(--solar-gold)' },
                      { icon: Layout, label: 'عدد الألواح', value: `${result.panelsCount} لوح`, color: 'var(--sky-blue)' },
                      { icon: Home, label: 'المساحة المطلوبة', value: `${result.roofAreaNeeded} m²`, color: 'var(--eco-green)' },
                      { icon: DollarSign, label: 'التكلفة التقديرية', value: `₪${result.estimatedCostIls.toLocaleString()}`, color: '#8B5CF6' },
                      { icon: Clock, label: 'فترة الاسترداد', value: `${result.paybackYears} سنة`, color: 'var(--solar-gold-dark)' },
                      { icon: Sun, label: 'تغطية الاحتياج', value: `${result.coveragePercent}%`, color: 'var(--solar-gold)' },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div
                        key={label}
                        className="rounded-xl p-3 flex items-center gap-3"
                        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                          <Icon className="h-4 w-4" style={{ color }} />
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                          <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* معلومات البطاريات */}
                  {result.batteryWeightKg && result.batteryWeightKg > 0 && (
                    <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: 'rgba(0,184,148,0.08)', border: '1px solid rgba(0,184,148,0.3)' }}>
                      <Battery className="h-5 w-5 shrink-0" style={{ color: 'var(--eco-green)' }} />
                      <div className="text-sm">
                        <span className="font-semibold" style={{ color: 'var(--eco-green)' }}>
                          بطاريات {result.batteryWeightKg} كيلو
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {' '}— تكلفة إضافية ₪{result.batteryCostIls?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* البيئة */}
                  <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: 'rgba(0,184,148,0.08)', border: '1px solid rgba(0,184,148,0.3)' }}>
                    <Leaf className="h-5 w-5 shrink-0" style={{ color: 'var(--eco-green)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      ستوفر {result.co2SavedAnnualKg.toLocaleString()} كغ من CO₂ سنوياً، ما يعادل زراعة {result.treesEquivalent} شجرة
                    </p>
                  </div>

                  {/* مخطط 25 سنة */}
                  <div>
                    <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                      تحليل الوفر خلال 25 سنة
                    </h4>
                    <ResultsChart data={result.yearlyBreakdown} cost={result.estimatedCostIls} />
                  </div>

                  {/* أزرار */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={() => setShowQuoteDialog(true)}
                      className="flex-1 font-bold text-white h-12"
                      style={{ backgroundColor: 'var(--solar-gold)' }}
                    >
                      📋 احصل على عرض سعر مجاني
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 font-semibold"
                      onClick={() => {
                        const text = `نتيجة حاسبة الطاقة الشمسية:\n• حجم النظام: ${result.systemSizeKw} كيلوواط\n• عدد الألواح: ${result.panelsCount}\n• التكلفة التقديرية: ₪${result.estimatedCostIls.toLocaleString()}\n• الوفر السنوي: ₪${result.annualSavingIls.toLocaleString()}\n• فترة الاسترداد: ${result.paybackYears} سنة`;
                        navigator.clipboard.writeText(text).then(() => {
                          toast.success('تم نسخ النتائج!');
                        });
                      }}
                    >
                      <Share2 className="h-4 w-4 me-2" />
                      نسخ النتائج
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* التنقل بين الخطوات */}
          {step < 3 && (
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1 font-semibold h-12">
                  <ChevronRight className="h-4 w-4 me-1" />
                  رجوع
                </Button>
              )}
              {step === 1 && (
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canGoNext()}
                  className="flex-1 font-bold text-white h-12"
                  style={{ backgroundColor: 'var(--solar-gold)' }}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4 ms-1" />
                </Button>
              )}
              {step === 2 && (
                <Button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="flex-1 font-bold text-white h-12"
                  style={{ backgroundColor: 'var(--eco-green)' }}
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 me-2 animate-spin" />جاري الحساب...</>
                  ) : (
                    <><Calculator className="h-4 w-4 me-2" />احسب الآن</>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* نافذة عرض السعر */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>
              طلب عرض سعر مجاني
            </DialogTitle>
          </DialogHeader>
          <QuoteRequestForm calculatorResult={result ?? undefined} onClose={() => setShowQuoteDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
