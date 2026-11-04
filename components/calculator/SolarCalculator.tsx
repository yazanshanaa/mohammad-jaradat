'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Zap, Battery, Phone, MessageCircle, RotateCcw,
  ChevronDown, ChevronUp, Loader2, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateSolarSystem,
  validateBill,
  recommendPhase,
  type CalculatorConfig,
  type CalculatorResult,
  type SystemType,
  type Phase,
  type SystemContentConfig,
} from '@/lib/calculator';
import dynamic from 'next/dynamic';

const QuoteRequestForm = dynamic<{ onClose?: () => void; calculatorResult?: object }>(
  () =>
    import('@/components/forms/QuoteRequestForm').then(mod => ({
      default: mod.QuoteRequestForm,
    })),
  { ssr: false },
);

// ─── نصوص افتراضية ────────────────────────────────────────────────────────────

const DEFAULT_CONTENT: SystemContentConfig = {
  onGrid: {
    name: 'نظام شبكي (On-Grid)',
    shortDesc: 'الأقل تكلفة، متصل بشبكة الكهرباء',
    fullDesc:
      'النظام الشبكي يعمل بالتوازي مع شبكة الكهرباء العامة. يقلل فاتورتك بشكل كبير ويتيح بيع الكهرباء الفائضة للشركة.',
    pros: ['الأقل تكلفة', 'لا يحتاج بطاريات', 'صيانة بسيطة', 'عمر طويل'],
    cons: ['يتوقف عند انقطاع الكهرباء', 'يعتمد على وجود شبكة'],
  },
  offGrid: {
    name: 'نظام مستقل (Off-Grid)',
    shortDesc: 'مستقل تماماً عن شبكة الكهرباء',
    fullDesc:
      'النظام المستقل يعمل بشكل كامل دون الحاجة لشبكة الكهرباء. مثالي للمناطق التي لا تصلها الكهرباء أو للرغبة في الاستقلالية التامة.',
    pros: ['استقلالية كاملة', 'يعمل في المناطق النائية', 'لا فواتير كهرباء'],
    cons: ['الأعلى تكلفة', 'يحتاج بطاريات', 'صيانة أكثر'],
  },
  hybrid: {
    name: 'نظام هجين (Hybrid)',
    shortDesc: 'شبكة + بطاريات احتياطية',
    fullDesc:
      'النظام الهجين يجمع بين مميزات النظامين. متصل بالشبكة ولديه بطاريات احتياطية تعمل وقت انقطاع الكهرباء.',
    pros: ['يعمل وقت انقطاع الكهرباء', 'توفير عالٍ في الفاتورة', 'مرونة عالية'],
    cons: ['تكلفة متوسطة-عالية', 'يحتاج بطاريات'],
  },
};

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  'on-grid': <Zap className="h-8 w-8" />,
  'off-grid': <Battery className="h-8 w-8" />,
  hybrid: <Sun className="h-8 w-8" />,
};

const slideVariants = {
  enter: { x: -40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: 40, opacity: 0 },
};

// ─── Component ────────────────────────────────────────────────────────────────

type Screen = 'awareness' | 'education' | 'system-select' | 'phase-select' | 'bill-input' | 'result';

const PHASE_LABEL: Record<Phase, string> = {
  single: 'فاز واحد',
  three: '3 فاز',
};

export default function SolarCalculator() {
  const [screen, setScreen] = useState<Screen>('awareness');
  const [systemType, setSystemType] = useState<SystemType | null>(null);
  const [phaseChoice, setPhaseChoice] = useState<Phase | 'auto' | null>(null);
  const [showPhaseHelp, setShowPhaseHelp] = useState(false);
  const [bill, setBill] = useState<string>('');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [selectedBatteryId, setSelectedBatteryId] = useState<string>('');
  const [showSteps, setShowSteps] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    fetch('/api/calculator/options')
      .then(r => r.json())
      .then((data: CalculatorConfig) => setConfig(data))
      .catch(() => {})
      .finally(() => setLoadingConfig(false));
  }, []);

  const content = useMemo(
    () => ({
      onGrid: config?.systemContent?.onGrid ?? DEFAULT_CONTENT.onGrid,
      offGrid: config?.systemContent?.offGrid ?? DEFAULT_CONTENT.offGrid,
      hybrid: config?.systemContent?.hybrid ?? DEFAULT_CONTENT.hybrid,
    }),
    [config],
  );

  const billNum = parseFloat(bill) || 0;
  const billValidation = config
    ? validateBill(billNum, config.minBillIls, config.maxBillIls)
    : 'valid';

  // معاينة حية للحساب (واعية للفاز، مطابقة لمحرّك الحساب)
  const livePreview = useMemo(() => {
    if (!config || !bill || billValidation !== 'valid') return null;
    const n = parseFloat(bill);
    if (!n) return null;
    const step1 = n / config.pricePerKwhIls;
    const step2 = step1 / 30;
    const step3 = step2 / config.sunHoursPerDay;
    const resolvedPhase: Phase =
      phaseChoice === 'auto' || phaseChoice == null
        ? recommendPhase(step3, config)
        : phaseChoice;
    const match = (ph: Phase) =>
      [...config.systemSizes]
        .filter(s => s.phase == null || s.phase === ph)
        .sort((a, b) => a.kw - b.kw)
        .find(s => s.kw >= step3);
    let matched = match(resolvedPhase);
    let upgraded = false;
    if (!matched && resolvedPhase === 'single') {
      matched = match('three');
      if (matched) upgraded = true;
    }
    return {
      step1, step2, step3,
      matchedKw: matched?.kw ?? null,
      phase: (upgraded ? 'three' : resolvedPhase) as Phase,
      upgraded,
    };
  }, [bill, config, billValidation, phaseChoice]);

  function handleCalculate() {
    if (!config || !systemType) return;
    const monthlyBillIls = parseFloat(bill) || 0;

    // حساب الحجم الخام لحسم الفاز عند خيار "غير متأكد"
    const rawKw = monthlyBillIls / config.pricePerKwhIls / 30 / config.sunHoursPerDay;
    const requestedPhase: Phase =
      phaseChoice === 'auto' || phaseChoice == null
        ? recommendPhase(rawKw, config)
        : phaseChoice;

    if (billValidation === 'too-high') {
      setResult({
        step1_monthlyKwh: 0,
        step2_dailyKwh: 0,
        step3_rawKw: 0,
        step4_systemKw: 0,
        panelsCount: 0,
        panelWatts: config.panelWatts,
        totalPriceIls: 0,
        needsDirectContact: true,
        phase: requestedPhase,
        requestedPhase,
        phaseUpgraded: false,
      });
      setScreen('result');
      return;
    }

    const r = calculateSolarSystem({ monthlyBillIls, systemType, phase: requestedPhase, config });
    setResult(r);
    setScreen('result');
  }

  function reset() {
    setScreen('awareness');
    setSystemType(null);
    setPhaseChoice(null);
    setBill('');
    setResult(null);
    setSelectedBatteryId('');
    setShowSteps(false);
  }

  const selectedBattery = config?.batteryOptions?.find(b => b.id === selectedBatteryId) ?? null;
  const totalWithBattery = result
    ? result.totalPriceIls + (selectedBattery?.priceIls ?? 0)
    : 0;

  const systemTypeLabel: Record<SystemType, string> = {
    'on-grid': 'شبكي',
    'off-grid': 'مستقل',
    hybrid: 'هجين',
  };

  if (loadingConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" dir="rtl">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: 'var(--solar-gold)' }} />
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full max-w-3xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {/* ───────────── شاشة 0: الوعي ───────────── */}
        {screen === 'awareness' && (
          <motion.div
            key="awareness"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <div
              className="rounded-2xl p-8 text-center shadow-sm"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: 'rgba(245,166,35,0.12)', color: 'var(--solar-gold)' }}
              >
                <Sun className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                احسب نظامك الشمسي
              </h2>
              <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
                هل تعرف الفرق بين أنواع الأنظمة الشمسية الثلاثة؟
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setScreen('system-select')}
                  className="text-white font-semibold px-6 py-2"
                  style={{ backgroundColor: 'var(--solar-gold)' }}
                >
                  نعم، أعرف الفرق
                </Button>
                <Button
                  onClick={() => setScreen('education')}
                  variant="outline"
                  className="font-semibold px-6 py-2"
                >
                  لا، اشرح لي
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ───────────── شاشة 1: التعليم ───────────── */}
        {screen === 'education' && (
          <motion.div
            key="education"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              أنواع الأنظمة الشمسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {(
                [
                  { key: 'onGrid' as const, type: 'on-grid' as SystemType, emoji: '🔌' },
                  { key: 'offGrid' as const, type: 'off-grid' as SystemType, emoji: '🔋' },
                  { key: 'hybrid' as const, type: 'hybrid' as SystemType, emoji: '⚡' },
                ] as const
              ).map(({ key, emoji }) => {
                const c = content[key];
                return (
                  <div
                    key={key}
                    className="rounded-2xl p-5 shadow-sm"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div className="text-3xl mb-2">{emoji}</div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                      {c.name}
                    </h3>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {c.fullDesc}
                    </p>
                    <div className="mb-2">
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--eco-green)' }}>
                        المميزات ✅
                      </p>
                      <ul className="text-sm space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {c.pros.map((p, i) => <li key={i}>• {p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: '#ef4444' }}>
                        العيوب ❌
                      </p>
                      <ul className="text-sm space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {c.cons.map((c2, i) => <li key={i}>• {c2}</li>)}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => setScreen('system-select')}
                className="text-white font-semibold px-8"
                style={{ backgroundColor: 'var(--solar-gold)' }}
              >
                فهمت، ابدأ الحساب ←
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── شاشة 2: اختيار النظام ───────────── */}
        {screen === 'system-select' && (
          <motion.div
            key="system-select"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              اختر نوع النظام
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {(
                [
                  { key: 'onGrid' as const, type: 'on-grid' as SystemType, emoji: '🔌' },
                  { key: 'offGrid' as const, type: 'off-grid' as SystemType, emoji: '🔋' },
                  { key: 'hybrid' as const, type: 'hybrid' as SystemType, emoji: '⚡' },
                ] as const
              ).map(({ key, type, emoji }) => {
                const c = content[key];
                const isSelected = systemType === type;
                return (
                  <button
                    key={key}
                    onClick={() => setSystemType(type)}
                    className="rounded-2xl p-5 text-right transition-all duration-200 cursor-pointer"
                    style={{
                      background: isSelected ? 'rgba(245,166,35,0.08)' : 'var(--bg-card)',
                      border: isSelected ? '2px solid var(--solar-gold)' : '2px solid var(--border)',
                      boxShadow: isSelected ? '0 0 0 3px rgba(245,166,35,0.15)' : undefined,
                    }}
                  >
                    <div className="text-3xl mb-2">{emoji}</div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                      {c.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {c.shortDesc}
                    </p>
                    {isSelected && (
                      <CheckCircle2
                        className="h-5 w-5 mt-2"
                        style={{ color: 'var(--solar-gold)' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setScreen('awareness')}>
                ← رجوع
              </Button>
              <Button
                onClick={() => setScreen('phase-select')}
                disabled={!systemType}
                className="text-white font-semibold"
                style={{ backgroundColor: 'var(--solar-gold)' }}
              >
                التالي: نوع التوصيلة ←
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── شاشة 2.5: اختيار الفاز ───────────── */}
        {screen === 'phase-select' && (
          <motion.div
            key="phase-select"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
              ما نوع توصيلة الكهرباء؟
            </h2>
            <p className="mb-5 text-center text-sm flex items-center justify-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <span>هذا يحدّد نوع الإنفيرتر المناسب لنظامك</span>
              <button
                onClick={() => setShowPhaseHelp(v => !v)}
                aria-label="ما معنى الفاز؟"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--solar-gold)' }}
              >
                !
              </button>
            </p>

            {showPhaseHelp && (
              <div
                className="rounded-xl p-4 mb-5 text-sm leading-relaxed"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                «الفاز» هو نوع توصيلة الكهرباء لمبناك:
                <br />
                • <strong style={{ color: 'var(--text-primary)' }}>فاز واحد</strong> (220 فولت): توصيلة المنازل العادية، تكفي للأنظمة حتى نحو 6 كيلوواط.
                <br />
                • <strong style={{ color: 'var(--text-primary)' }}>3 فاز</strong> (380 فولت): توصيلة المنازل الكبيرة والمحلات والمصانع، للأنظمة الأكبر.
                <br />
                تجدها مكتوبة على عدّاد الكهرباء، أو اسأل الكهربائي. إن لم تكن متأكداً اختر «غير متأكد» وسنحدّدها حسب حجم نظامك.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {(
                [
                  { key: 'single' as const, emoji: '🏠', title: 'فاز واحد', desc: 'منزل عادي — توصيلة 220 فولت' },
                  { key: 'three' as const, emoji: '🏢', title: '3 فاز', desc: 'منزل كبير / محل — توصيلة 380 فولت' },
                ] as const
              ).map(({ key, emoji, title, desc }) => {
                const isSelected = phaseChoice === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPhaseChoice(key)}
                    className="rounded-2xl p-5 text-right transition-all duration-200 cursor-pointer"
                    style={{
                      background: isSelected ? 'rgba(245,166,35,0.08)' : 'var(--bg-card)',
                      border: isSelected ? '2px solid var(--solar-gold)' : '2px solid var(--border)',
                      boxShadow: isSelected ? '0 0 0 3px rgba(245,166,35,0.15)' : undefined,
                    }}
                  >
                    <div className="text-3xl mb-2">{emoji}</div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 mt-2" style={{ color: 'var(--solar-gold)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPhaseChoice('auto')}
              className="w-full rounded-xl p-3 mb-6 text-sm font-medium transition-all"
              style={{
                background: phaseChoice === 'auto' ? 'rgba(245,166,35,0.08)' : 'var(--bg-card)',
                border: phaseChoice === 'auto' ? '2px solid var(--solar-gold)' : '1px dashed var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              🤔 غير متأكد — حدّدها لي حسب حجم النظام
            </button>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setScreen('system-select')}>
                ← رجوع
              </Button>
              <Button
                onClick={() => setScreen('bill-input')}
                disabled={!phaseChoice}
                className="text-white font-semibold"
                style={{ backgroundColor: 'var(--solar-gold)' }}
              >
                التالي: أدخل فاتورتك ←
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── شاشة 3: إدخال الفاتورة ───────────── */}
        {screen === 'bill-input' && (
          <motion.div
            key="bill-input"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
              كم فاتورة الكهرباء الشهرية؟
            </h2>
            <div
              className="rounded-2xl p-6 shadow-sm mb-6"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <Label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                الفاتورة الشهرية (شيكل)
              </Label>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-lg" style={{ color: 'var(--solar-gold)' }}>₪</span>
                <Input
                  type="number"
                  value={bill}
                  onChange={e => setBill(e.target.value)}
                  placeholder="مثال: 500"
                  className="text-xl font-bold h-12"
                  dir="ltr"
                  min={0}
                />
              </div>
              {config && (
                <input
                  type="range"
                  min={config.minBillIls}
                  max={config.maxBillIls}
                  value={Math.min(Math.max(billNum || config.minBillIls, config.minBillIls), config.maxBillIls)}
                  onChange={e => setBill(e.target.value)}
                  className="w-full mb-1 accent-yellow-500"
                />
              )}
              {config && (
                <div className="flex justify-between text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <span>₪{config.minBillIls}</span>
                  <span>₪{config.maxBillIls}</span>
                </div>
              )}

              {/* رسالة خطأ الفاتورة المنخفضة */}
              {bill && billValidation === 'too-low' && config && (
                <p className="text-sm text-red-500 mb-3">
                  أقل فاتورة مدعومة في الحاسبة هي ₪{config.minBillIls}
                </p>
              )}

              {/* معاينة حية */}
              {livePreview && (
                <div
                  className="rounded-xl p-4 mt-2"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                >
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    📊 خطوات الحساب:
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {bill} ÷ {config?.pricePerKwhIls} ={' '}
                    <strong style={{ color: 'var(--sky-blue)' }}>
                      {livePreview.step1.toFixed(0)} kWh/شهر
                    </strong>
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {livePreview.step1.toFixed(0)} ÷ 30 ={' '}
                    <strong style={{ color: 'var(--sky-blue)' }}>
                      {livePreview.step2.toFixed(1)} kWh/يوم
                    </strong>
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {livePreview.step2.toFixed(1)} ÷ {config?.sunHoursPerDay} ={' '}
                    <strong style={{ color: 'var(--solar-gold)' }}>
                      {livePreview.step3.toFixed(2)} kW
                      {livePreview.matchedKw
                        ? ` → نظام ${livePreview.matchedKw} كيلوواط (${PHASE_LABEL[livePreview.phase]})`
                        : ' → يحتاج تواصل مباشر'}
                    </strong>
                    {livePreview.upgraded && (
                      <span className="block text-xs mt-1" style={{ color: 'var(--solar-gold)' }}>
                        ⚠️ أكبر من قدرة فاز واحد — سيُقترح نظام 3 فاز
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setScreen('phase-select')}>
                ← رجوع
              </Button>
              <Button
                onClick={handleCalculate}
                disabled={!bill || billValidation === 'too-low'}
                className="text-white font-semibold"
                style={{ backgroundColor: 'var(--solar-gold)' }}
              >
                احسب الآن ←
              </Button>
            </div>
          </motion.div>
        )}

        {/* ───────────── شاشة 4: النتيجة ───────────── */}
        {screen === 'result' && result && (
          <motion.div
            key="result"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
          >
            {result.needsDirectContact ? (
              /* ── حالة التواصل المباشر ── */
              <div
                className="rounded-2xl p-8 text-center shadow-sm"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="text-5xl mb-4">📞</div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                  نظامك يحتاج دراسة خاصة
                </h2>
                <p className="mb-6 text-base" style={{ color: 'var(--text-secondary)' }}>
                  {config?.contactMessage}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  {config?.contactWhatsapp && (
                    <a
                      href={`https://wa.me/${config.contactWhatsapp}?text=أهلاً، أريد الاستفسار عن نظام شمسي`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        className="text-white font-semibold gap-2 w-full sm:w-auto"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        واتساب 📱
                      </Button>
                    </a>
                  )}
                  {config?.contactPhone && (
                    <a href={`tel:${config.contactPhone}`}>
                      <Button variant="outline" className="gap-2 font-semibold w-full sm:w-auto">
                        <Phone className="h-4 w-4" />
                        اتصال مباشر 📞
                      </Button>
                    </a>
                  )}
                </div>
                <Button variant="ghost" onClick={reset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  احسب مجدداً
                </Button>
              </div>
            ) : (
              /* ── حالة النتيجة العادية ── */
              <div className="space-y-4">
                {/* بطاقة النتيجة الرئيسية */}
                <div
                  className="rounded-2xl p-6 shadow-sm"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--eco-green)' }} />
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      تم الحساب — نظام {systemType ? systemTypeLabel[systemType] : ''}
                    </h2>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(79,172,254,0.12)', color: 'var(--sky-blue)' }}
                    >
                      {PHASE_LABEL[result.phase]}
                    </span>
                  </div>

                  {/* تنبيه الترقية التلقائية إلى 3 فاز */}
                  {result.phaseUpgraded && (
                    <div
                      className="rounded-xl p-3 mb-4 text-sm leading-relaxed"
                      style={{ background: 'rgba(245,166,35,0.10)', border: '1px solid rgba(245,166,35,0.35)', color: 'var(--text-primary)' }}
                    >
                      ⚠️ حجم نظامك أكبر من قدرة توصيلة «فاز واحد»، لذلك عرضنا لك النظام المناسب على توصيلة <strong>3 فاز</strong>. للتفاصيل تواصل معنا.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                    >
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        ☀️ حجم النظام
                      </p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--solar-gold)' }}>
                        {result.step4_systemKw} kW
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                    >
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        🔆 عدد الألواح
                      </p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--sky-blue)' }}>
                        {result.panelsCount} لوح
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        × {result.panelWatts} واط
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                    >
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        ⚡ الانفيرتر
                      </p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--eco-green)' }}>
                        {result.step4_systemKw} kW
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {PHASE_LABEL[result.phase]}
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                    >
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        💰 السعر الكلي
                      </p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--solar-gold)' }}>
                        ₪{totalWithBattery.toLocaleString('ar')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        شامل الألواح والتركيب الكامل
                      </p>
                    </div>
                  </div>
                </div>

                {/* قسم البطاريات */}
                {config?.batteryVisible &&
                  config.batteryOptions.length > 0 &&
                  (systemType === 'off-grid' || systemType === 'hybrid') && (
                    <div
                      className="rounded-2xl p-5 shadow-sm"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                        🔋 اختر حزمة البطارية (اختياري)
                      </h3>
                      <div className="space-y-2">
                        <label
                          className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={() => setSelectedBatteryId('')}
                        >
                          <input
                            type="radio"
                            checked={selectedBatteryId === ''}
                            onChange={() => setSelectedBatteryId('')}
                            className="accent-yellow-500"
                          />
                          <span style={{ color: 'var(--text-primary)' }}>بدون بطارية</span>
                        </label>
                        {config.batteryOptions.map(bat => (
                          <label
                            key={bat.id}
                            className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => setSelectedBatteryId(bat.id)}
                          >
                            <input
                              type="radio"
                              checked={selectedBatteryId === bat.id}
                              onChange={() => setSelectedBatteryId(bat.id)}
                              className="accent-yellow-500"
                            />
                            <span style={{ color: 'var(--text-primary)' }}>
                              {bat.labelAr} — {bat.capacityKwh} kWh —{' '}
                              <strong style={{ color: 'var(--solar-gold)' }}>
                                ₪{bat.priceIls.toLocaleString('ar')}
                              </strong>
                            </span>
                          </label>
                        ))}
                      </div>
                      {selectedBattery && (
                        <div
                          className="mt-3 rounded-xl p-3 text-sm font-semibold"
                          style={{ background: 'rgba(245,166,35,0.08)', color: 'var(--text-primary)' }}
                        >
                          السعر الإجمالي: ₪{result.totalPriceIls.toLocaleString('ar')} +{' '}
                          ₪{selectedBattery.priceIls.toLocaleString('ar')} ={' '}
                          <span style={{ color: 'var(--solar-gold)' }}>
                            ₪{totalWithBattery.toLocaleString('ar')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                {/* خطوات الحساب */}
                <div
                  className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <button
                    onClick={() => setShowSteps(v => !v)}
                    className="w-full flex items-center justify-between p-4 font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span>📊 كيف تم الحساب؟</span>
                    {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {showSteps && (
                    <div
                      className="px-4 pb-4 space-y-1.5 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <p>
                        1. ₪{bill} ÷ {config?.pricePerKwhIls} ={' '}
                        <strong style={{ color: 'var(--sky-blue)' }}>
                          {result.step1_monthlyKwh} kWh/شهر
                        </strong>
                      </p>
                      <p>
                        2. {result.step1_monthlyKwh} ÷ 30 ={' '}
                        <strong style={{ color: 'var(--sky-blue)' }}>
                          {result.step2_dailyKwh} kWh/يوم
                        </strong>
                      </p>
                      <p>
                        3. {result.step2_dailyKwh} ÷ {config?.sunHoursPerDay} ={' '}
                        <strong style={{ color: 'var(--sky-blue)' }}>
                          {result.step3_rawKw} kW
                        </strong>
                      </p>
                      <p>
                        4. تقريب للأعلى →{' '}
                        <strong style={{ color: 'var(--solar-gold)' }}>
                          {result.step4_systemKw} كيلوواط
                        </strong>
                      </p>
                      <p>
                        5. {result.step4_systemKw * 1000} ÷ {result.panelWatts} ={' '}
                        <strong style={{ color: 'var(--solar-gold)' }}>
                          {result.panelsCount} لوح
                        </strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setShowQuoteForm(true)}
                    className="text-white font-semibold flex-1"
                    style={{ backgroundColor: 'var(--solar-gold)' }}
                  >
                    اطلب عرض سعر رسمي
                  </Button>
                  {config?.contactWhatsapp && (
                    <a
                      href={`https://wa.me/${config.contactWhatsapp}?text=أهلاً، أريد الاستفسار عن نظام شمسي حجم ${result.step4_systemKw} كيلوواط`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        className="text-white font-semibold gap-2 w-full"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        تواصل واتساب
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" onClick={reset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    احسب مجدداً
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* نموذج طلب عرض السعر */}
      {showQuoteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => setShowQuoteForm(false)}
              className="absolute top-4 left-4 z-10 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
            <QuoteRequestForm onClose={() => setShowQuoteForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
