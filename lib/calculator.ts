// ─── Types ────────────────────────────────────────────────────────────────────

export type SystemType = 'on-grid' | 'off-grid' | 'hybrid';

export interface SystemSize {
  kw: number;
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

// ─── دالة الحساب الرئيسية ─────────────────────────────────────────────────────

export function calculateSolarSystem(input: CalculatorInput): CalculatorResult {
  const { monthlyBillIls, systemType, config } = input;

  const step1_monthlyKwh = monthlyBillIls / config.pricePerKwhIls;
  const step2_dailyKwh = step1_monthlyKwh / 30;
  const step3_rawKw = step2_dailyKwh / config.sunHoursPerDay;

  if (step3_rawKw > config.maxSystemKw) {
    return {
      step1_monthlyKwh: Math.round(step1_monthlyKwh),
      step2_dailyKwh: Math.round(step2_dailyKwh * 10) / 10,
      step3_rawKw: Math.round(step3_rawKw * 10) / 10,
      step4_systemKw: step3_rawKw,
      panelsCount: 0,
      panelWatts: config.panelWatts,
      totalPriceIls: 0,
      needsDirectContact: true,
    };
  }

  const sortedSizes = [...config.systemSizes].sort((a, b) => a.kw - b.kw);
  const matchedSize = sortedSizes.find(s => s.kw >= step3_rawKw);

  if (!matchedSize) {
    return {
      step1_monthlyKwh: Math.round(step1_monthlyKwh),
      step2_dailyKwh: Math.round(step2_dailyKwh * 10) / 10,
      step3_rawKw: Math.round(step3_rawKw * 10) / 10,
      step4_systemKw: step3_rawKw,
      panelsCount: 0,
      panelWatts: config.panelWatts,
      totalPriceIls: 0,
      needsDirectContact: true,
    };
  }

  const panelsCount = Math.round((matchedSize.kw * 1000) / config.panelWatts);

  const priceMap: Record<SystemType, number> = {
    'on-grid': matchedSize.onGrid,
    'off-grid': matchedSize.offGrid,
    hybrid: matchedSize.hybrid,
  };

  return {
    step1_monthlyKwh: Math.round(step1_monthlyKwh),
    step2_dailyKwh: Math.round(step2_dailyKwh * 10) / 10,
    step3_rawKw: Math.round(step3_rawKw * 10) / 10,
    step4_systemKw: matchedSize.kw,
    panelsCount,
    panelWatts: config.panelWatts,
    totalPriceIls: priceMap[systemType],
    needsDirectContact: false,
  };
}
