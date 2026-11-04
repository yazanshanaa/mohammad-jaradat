// ─── Types ────────────────────────────────────────────────────────────────────

export type SystemType = 'on-grid' | 'off-grid' | 'hybrid';

/** نوع توصيلة الكهرباء: فاز واحد (220V) أو ثلاثة فاز (380V) */
export type Phase = 'single' | 'three';

export interface SystemSize {
  kw: number;
  /**
   * الفاز الذي ينطبق عليه هذا الحجم/السعر.
   * - 'single' → فاز واحد فقط
   * - 'three'  → 3 فاز فقط
   * - undefined → ينطبق على الاثنين (توافق خلفي مع الإعدادات القديمة)
   */
  phase?: Phase;
  onGrid: number;
  offGrid: number;
  hybrid: number;
}

export interface BatteryOption {
  id: string;
  labelAr: string;
  capacityKwh: number;
  priceIls: number;
}

export interface SystemTypeContent {
  name: string;
  shortDesc: string;
  fullDesc: string;
  pros: string[];
  cons: string[];
}

export interface SystemContentConfig {
  onGrid: SystemTypeContent;
  offGrid: SystemTypeContent;
  hybrid: SystemTypeContent;
}

export interface CalculatorConfig {
  pricePerKwhIls: number;
  sunHoursPerDay: number;
  panelWatts: number;
  minBillIls: number;
  maxBillIls: number;
  maxSystemKw: number;
  systemSizes: SystemSize[];
  batteryOptions: BatteryOption[];
  batteryVisible: boolean;
  contactWhatsapp: string;
  contactPhone: string;
  contactEmail: string;
  contactMessage: string;
  systemContent?: SystemContentConfig;
}

export interface CalculatorInput {
  monthlyBillIls: number;
  systemType: SystemType;
  /** الفاز الذي اختاره المستخدم. الافتراضي 'single' إن لم يُمرّر. */
  phase: Phase;
  config: CalculatorConfig;
}

export interface CalculatorResult {
  step1_monthlyKwh: number;
  step2_dailyKwh: number;
  step3_rawKw: number;
  step4_systemKw: number;
  panelsCount: number;
  panelWatts: number;
  totalPriceIls: number;
  needsDirectContact: boolean;
  /** الفاز الفعلي للنظام المقترح (قد يختلف عن المطلوب عند الترقية) */
  phase: Phase;
  /** الفاز الذي اختاره المستخدم */
  requestedPhase: Phase;
  /** true إذا طُلب فاز واحد لكن حجم النظام تجاوز قدرته فرُقّي تلقائياً إلى 3 فاز */
  phaseUpgraded: boolean;
}

// ─── دالة التحقق من الفاتورة ──────────────────────────────────────────────────

export type BillValidation = 'valid' | 'too-low' | 'too-high';

export function validateBill(
  bill: number,
  minBill: number,
  maxBill: number,
): BillValidation {
  if (bill < minBill) return 'too-low';
  if (bill > maxBill) return 'too-high';
  return 'valid';
}

// ─── مساعدات الفاز ────────────────────────────────────────────────────────────

/** هل ينطبق هذا الحجم على الفاز المطلوب؟ (حجم بلا phase ينطبق على الاثنين) */
function rowMatchesPhase(row: SystemSize, phase: Phase): boolean {
  return row.phase == null || row.phase === phase;
}

/**
 * أكبر حجم (kW) متاح على الفاز الواحد ضمن الإعدادات.
 * يُستخدم كسقف لتحديد متى يجب الانتقال إلى 3 فاز.
 * يرجع 0 إذا لم تُعرّف أي أحجام للفاز الواحد.
 */
export function getSinglePhaseMaxKw(config: CalculatorConfig): number {
  const singles = (config.systemSizes ?? []).filter(s => rowMatchesPhase(s, 'single'));
  if (singles.length === 0) return 0;
  return Math.max(...singles.map(s => s.kw));
}

/** الفاز المقترح تلقائياً حسب حجم النظام الخام. */
export function recommendPhase(rawKw: number, config: CalculatorConfig): Phase {
  const maxSingle = getSinglePhaseMaxKw(config);
  return maxSingle > 0 && rawKw <= maxSingle ? 'single' : 'three';
}

/** أصغر حجم متاح (≥ rawKw) على الفاز المطلوب — أي التقريب لأعلى لأقرب إنفرتر متاح. */
function findSize(
  sizes: SystemSize[],
  rawKw: number,
  phase: Phase,
): SystemSize | undefined {
  return [...sizes]
    .filter(s => rowMatchesPhase(s, phase))
    .sort((a, b) => a.kw - b.kw)
    .find(s => s.kw >= rawKw);
}

// ─── دالة الحساب الرئيسية ─────────────────────────────────────────────────────

export function calculateSolarSystem(input: CalculatorInput): CalculatorResult {
  const { monthlyBillIls, systemType, config } = input;
  const requestedPhase: Phase = input.phase ?? 'single';

  // نفس المعادلة الأصلية بالضبط
  const step1_monthlyKwh = monthlyBillIls / config.pricePerKwhIls;
  const step2_dailyKwh = step1_monthlyKwh / 30;
  const step3_rawKw = step2_dailyKwh / config.sunHoursPerDay;

  const rounded = {
    step1_monthlyKwh: Math.round(step1_monthlyKwh),
    step2_dailyKwh: Math.round(step2_dailyKwh * 10) / 10,
    step3_rawKw: Math.round(step3_rawKw * 10) / 10,
    panelWatts: config.panelWatts,
  };

  const directContact = (phase: Phase): CalculatorResult => ({
    ...rounded,
    step4_systemKw: Math.round(step3_rawKw * 10) / 10,
    panelsCount: 0,
    totalPriceIls: 0,
    needsDirectContact: true,
    phase,
    requestedPhase,
    phaseUpgraded: false,
  });

  // النظام أكبر من الحد الأقصى المدعوم → تواصل مباشر
  if (step3_rawKw > config.maxSystemKw) {
    return directContact(requestedPhase);
  }

  // محاولة المطابقة على الفاز المطلوب
  let phase: Phase = requestedPhase;
  let phaseUpgraded = false;
  let matchedSize = findSize(config.systemSizes, step3_rawKw, requestedPhase);

  // إذا طُلب فاز واحد والنظام تجاوز قدرته → ترقية تلقائية إلى 3 فاز
  if (!matchedSize && requestedPhase === 'single') {
    const threeMatch = findSize(config.systemSizes, step3_rawKw, 'three');
    if (threeMatch) {
      matchedSize = threeMatch;
      phase = 'three';
      phaseUpgraded = true;
    }
  }

  // لا يوجد حجم مناسب أصلاً → تواصل مباشر
  if (!matchedSize) {
    return directContact(phase);
  }

  const panelsCount = Math.round((matchedSize.kw * 1000) / config.panelWatts);

  const priceMap: Record<SystemType, number> = {
    'on-grid': matchedSize.onGrid,
    'off-grid': matchedSize.offGrid,
    hybrid: matchedSize.hybrid,
  };

  return {
    ...rounded,
    step4_systemKw: matchedSize.kw,
    panelsCount,
    totalPriceIls: priceMap[systemType],
    needsDirectContact: false,
    phase,
    requestedPhase,
    phaseUpgraded,
  };
}
