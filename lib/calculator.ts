// ─── Types ───────────────────────────────────────────────────────────────────

export interface BatteryOption {
  id: string;
  labelAr: string;
  priceIls: number;
  weightKg: number;
}

export interface CalculatorConfigData {
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
  systemPricing?: Record<string, number>;
  batteryOptions?: BatteryOption[];
  batteryVisible?: boolean;
}

export interface CalculatorInput {
  usageType: 'residential' | 'commercial' | 'industrial' | 'agricultural';
  systemType: 'on-grid' | 'off-grid' | 'hybrid' | 'auto';
  monthlyBillIls: number;
  batteryKg?: number;
  batteryUnitKg?: number;
  batteryUnitPrice?: number;
  config: CalculatorConfigData;
}

export interface YearlyData {
  year: number;
  savingIls: number;
  cumulativeSavingIls: number;
}

export interface CalculatorResult {
  systemSizeKw: number;
  panelsCount: number;
  roofAreaNeeded: number;
  estimatedCostIls: number;
  paybackYears: number;
  coveragePercent: number;
  annualSavingIls: number;
  annualProductionKwh: number;
  co2SavedAnnualKg: number;
  treesEquivalent: number;
  batteryWeightKg?: number;
  batteryCostIls?: number;
  yearlyBreakdown: YearlyData[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** System types that support battery storage */
export const SYSTEMS_WITH_BATTERY: ReadonlyArray<string> = ['off-grid', 'hybrid', 'auto'];

/** Palestinian regions for location selection */
export const LOCATIONS: { value: string; labelAr: string; labelEn: string }[] = [
  { value: 'ramallah', labelAr: 'رام الله والبيرة', labelEn: 'Ramallah & Al-Bireh' },
  { value: 'nablus', labelAr: 'نابلس', labelEn: 'Nablus' },
  { value: 'hebron', labelAr: 'الخليل', labelEn: 'Hebron' },
  { value: 'jenin', labelAr: 'جنين', labelEn: 'Jenin' },
  { value: 'tulkarm', labelAr: 'طولكرم', labelEn: 'Tulkarm' },
  { value: 'qalqilya', labelAr: 'قلقيلية', labelEn: 'Qalqilya' },
  { value: 'salfit', labelAr: 'سلفيت', labelEn: 'Salfit' },
  { value: 'jericho', labelAr: 'أريحا والأغوار', labelEn: 'Jericho & Jordan Valley' },
  { value: 'bethlehem', labelAr: 'بيت لحم', labelEn: 'Bethlehem' },
  { value: 'tubas', labelAr: 'طوباس', labelEn: 'Tubas' },
  { value: 'jerusalem', labelAr: 'القدس', labelEn: 'Jerusalem' },
  { value: 'other', labelAr: 'أخرى', labelEn: 'Other' },
];

const PANEL_AREA_M2 = 1.7;
const CO2_PER_TREE_KG = 22;

// ─── Core calculation ────────────────────────────────────────────────────────

export function calculateSolarSystem(input: CalculatorInput): CalculatorResult {
  const {
    config,
    monthlyBillIls,
    systemType,
    batteryKg,
    batteryUnitKg,
    batteryUnitPrice,
  } = input;

  if (!monthlyBillIls || monthlyBillIls <= 0) {
    throw new Error('monthlyBillIls must be a positive number');
  }

  // 1. Consumption
  const monthlyKwh = monthlyBillIls / config.pricePerKwhIls;
  const dailyKwh = monthlyKwh / 30;

  // 2. System size
  const effectiveSunHours =
    config.averageSunHoursPerDay *
    (1 - config.systemLoss) *
    config.inverterEfficiency;

  const oversizeFactor =
    systemType === 'off-grid' ? 1.15
    : systemType === 'hybrid' ? 1.05
    : 1.0;

  const rawSizeKw = (dailyKwh * oversizeFactor) / effectiveSunHours;
  const systemSizeKw = Math.ceil(rawSizeKw * 2) / 2;

  // 3. Panels & roof
  const panelsCount = Math.ceil((systemSizeKw * 1000) / config.panelWatts);
  const roofAreaNeeded = Math.ceil(panelsCount * PANEL_AREA_M2);

  // 4. Annual production
  const annualProductionKwh = Math.round(
    systemSizeKw *
      config.averageSunHoursPerDay *
      365 *
      config.inverterEfficiency *
      (1 - config.systemLoss),
  );

  const annualConsumptionKwh = monthlyKwh * 12;
  const coveragePercent = Math.min(
    100,
    Math.round((annualProductionKwh / annualConsumptionKwh) * 100),
  );

  // 5. Costs
  let systemCostIls: number;
  const pricingKey = String(systemSizeKw);
  if (config.systemPricing && config.systemPricing[pricingKey]) {
    systemCostIls = config.systemPricing[pricingKey];
  } else {
    systemCostIls = Math.round(systemSizeKw * 1000 * config.pricePerWattInstalled);
  }

  let batteryCostIls: number | undefined;
  if (batteryKg && batteryKg > 0) {
    if (batteryUnitPrice && batteryUnitKg && batteryUnitKg > 0) {
      const unitCount = Math.ceil(batteryKg / batteryUnitKg);
      batteryCostIls = Math.round(unitCount * batteryUnitPrice);
    } else {
      const batteryKwh = batteryKg * 0.15;
      batteryCostIls = Math.round(batteryKwh * config.batteryPricePerKwh);
    }
  }

  const estimatedCostIls = systemCostIls + (batteryCostIls ?? 0);

  // 6. Savings & payback
  const annualSavingIls = Math.round(
    Math.min(annualProductionKwh, annualConsumptionKwh) * config.pricePerKwhIls,
  );

  const paybackYears =
    annualSavingIls > 0
      ? Math.round((estimatedCostIls / annualSavingIls) * 10) / 10
      : 99;

  // 7. Environment
  const co2SavedAnnualKg = Math.round(annualProductionKwh * config.co2PerKwh);
  const treesEquivalent = Math.round(co2SavedAnnualKg / CO2_PER_TREE_KG);

  // 8. 25-year breakdown
  const yearlyBreakdown: YearlyData[] = [];
  let cumulativeSavingIls = -estimatedCostIls;

  for (let year = 1; year <= config.systemLifeYears; year++) {
    const degradationFactor = Math.pow(1 - config.annualDegradation, year - 1);
    const savingThisYear = Math.round(annualSavingIls * degradationFactor);
    cumulativeSavingIls += savingThisYear;
    yearlyBreakdown.push({
      year,
      savingIls: savingThisYear,
      cumulativeSavingIls: Math.round(cumulativeSavingIls),
    });
  }

  return {
    systemSizeKw,
    panelsCount,
    roofAreaNeeded,
    estimatedCostIls,
    paybackYears,
    coveragePercent,
    annualSavingIls,
    annualProductionKwh,
    co2SavedAnnualKg,
    treesEquivalent,
    batteryWeightKg: batteryKg,
    batteryCostIls,
    yearlyBreakdown,
  };
}
