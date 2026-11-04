import {
  calculateSolarSystem,
  validateBill,
  getSinglePhaseMaxKw,
  recommendPhase,
  type CalculatorConfig,
  type SystemSize,
} from './calculator';

// إعدادات اختبار تحاكي الـ seed الفعلي (أحجام مقسّمة حسب الفاز)
const SIZES: SystemSize[] = [
  // فاز واحد
  { kw: 3, phase: 'single', onGrid: 12000, offGrid: 18000, hybrid: 22000 },
  { kw: 4, phase: 'single', onGrid: 15500, offGrid: 23000, hybrid: 28000 },
  { kw: 5, phase: 'single', onGrid: 18000, offGrid: 25000, hybrid: 30000 },
  { kw: 6, phase: 'single', onGrid: 21000, offGrid: 29000, hybrid: 35000 },
  // 3 فاز
  { kw: 5, phase: 'three', onGrid: 19500, offGrid: 27000, hybrid: 32000 },
  { kw: 6, phase: 'three', onGrid: 23000, offGrid: 31000, hybrid: 37000 },
  { kw: 8, phase: 'three', onGrid: 28000, offGrid: 38000, hybrid: 45000 },
  { kw: 10, phase: 'three', onGrid: 35000, offGrid: 47000, hybrid: 56000 },
  { kw: 12, phase: 'three', onGrid: 42000, offGrid: 57000, hybrid: 67000 },
  { kw: 15, phase: 'three', onGrid: 52000, offGrid: 70000, hybrid: 82000 },
  { kw: 20, phase: 'three', onGrid: 68000, offGrid: 92000, hybrid: 108000 },
  { kw: 25, phase: 'three', onGrid: 84000, offGrid: 113000, hybrid: 132000 },
  { kw: 30, phase: 'three', onGrid: 100000, offGrid: 135000, hybrid: 158000 },
];

const CONFIG: CalculatorConfig = {
  pricePerKwhIls: 0.7,
  sunHoursPerDay: 5.5,
  panelWatts: 620,
  minBillIls: 300,
  maxBillIls: 3000,
  maxSystemKw: 30,
  systemSizes: SIZES,
  batteryOptions: [],
  batteryVisible: true,
  contactWhatsapp: '',
  contactPhone: '',
  contactEmail: '',
  contactMessage: '',
};

describe('validateBill', () => {
  it('يرفض الفاتورة الأقل من الحد', () => {
    expect(validateBill(200, 300, 3000)).toBe('too-low');
  });
  it('يرفض الفاتورة الأعلى من الحد', () => {
    expect(validateBill(5000, 300, 3000)).toBe('too-high');
  });
  it('يقبل الفاتورة ضمن المدى', () => {
    expect(validateBill(500, 300, 3000)).toBe('valid');
  });
});

describe('سقف الفاز الواحد', () => {
  it('أكبر حجم فاز واحد = 6 kW', () => {
    expect(getSinglePhaseMaxKw(CONFIG)).toBe(6);
  });
  it('يقترح فاز واحد للأحجام الصغيرة', () => {
    expect(recommendPhase(4.2, CONFIG)).toBe('single');
  });
  it('يقترح 3 فاز للأحجام الكبيرة', () => {
    expect(recommendPhase(7.5, CONFIG)).toBe('three');
  });
});

describe('صحة المعادلة الأساسية', () => {
  it('فاتورة 500 شيكل: الخطوات الحسابية دقيقة', () => {
    const r = calculateSolarSystem({ monthlyBillIls: 500, systemType: 'on-grid', phase: 'single', config: CONFIG });
    // 500 / 0.7 = 714.28... → 714
    expect(r.step1_monthlyKwh).toBe(714);
    // 714.28 / 30 = 23.8 → 23.8
    expect(r.step2_dailyKwh).toBeCloseTo(23.8, 1);
    // 23.8 / 5.5 = 4.33 → 4.3
    expect(r.step3_rawKw).toBeCloseTo(4.3, 1);
    // يقرّب لأعلى لأقرب حجم فاز واحد متاح = 5 kW
    expect(r.step4_systemKw).toBe(5);
    expect(r.needsDirectContact).toBe(false);
    expect(r.phase).toBe('single');
    expect(r.phaseUpgraded).toBe(false);
  });

  it('عدد الألواح = round(kW*1000 / 620)', () => {
    const r = calculateSolarSystem({ monthlyBillIls: 500, systemType: 'on-grid', phase: 'single', config: CONFIG });
    // 5000 / 620 = 8.06 → 8
    expect(r.panelsCount).toBe(8);
  });

  it('يختار السعر الصحيح حسب نوع النظام', () => {
    const base = { monthlyBillIls: 500, phase: 'single' as const, config: CONFIG };
    expect(calculateSolarSystem({ ...base, systemType: 'on-grid' }).totalPriceIls).toBe(18000);
    expect(calculateSolarSystem({ ...base, systemType: 'off-grid' }).totalPriceIls).toBe(25000);
    expect(calculateSolarSystem({ ...base, systemType: 'hybrid' }).totalPriceIls).toBe(30000);
  });
});

describe('منطق الفاز', () => {
  it('فاز واحد صغير يبقى فاز واحد', () => {
    const r = calculateSolarSystem({ monthlyBillIls: 400, systemType: 'on-grid', phase: 'single', config: CONFIG });
    // 400/0.7/30/5.5 = 3.46 → 4 kW فاز واحد
    expect(r.step4_systemKw).toBe(4);
    expect(r.phase).toBe('single');
    expect(r.totalPriceIls).toBe(15500);
  });

  it('فاز واحد كبير يُرقّى تلقائياً إلى 3 فاز', () => {
    // فاتورة عالية تعطي حجماً > 6 kW (سقف الفاز الواحد)
    const r = calculateSolarSystem({ monthlyBillIls: 900, systemType: 'on-grid', phase: 'single', config: CONFIG });
    // 900/0.7/30/5.5 = 7.79 → 8 kW (3 فاز فقط)
    expect(r.step4_systemKw).toBe(8);
    expect(r.requestedPhase).toBe('single');
    expect(r.phase).toBe('three');
    expect(r.phaseUpgraded).toBe(true);
    expect(r.totalPriceIls).toBe(28000); // سعر 8kW 3 فاز شبكي
  });

  it('اختيار 3 فاز مباشرة لحجم صغير يعطي سعر 3 فاز', () => {
    const r = calculateSolarSystem({ monthlyBillIls: 500, systemType: 'on-grid', phase: 'three', config: CONFIG });
    // 4.3 kW → أصغر حجم 3 فاز متاح = 5 kW
    expect(r.step4_systemKw).toBe(5);
    expect(r.phase).toBe('three');
    expect(r.phaseUpgraded).toBe(false);
    expect(r.totalPriceIls).toBe(19500); // 5kW 3 فاز (أعلى من الفاز الواحد)
  });
});

describe('حالات التواصل المباشر', () => {
  it('نظام أكبر من 30 kW → تواصل مباشر', () => {
    // فاتورة قصوى 3000: 3000/0.7/30/5.5 = 25.9 → ضمن المدى (25 أو 30). نرفع يدوياً عبر config أصغر.
    const smallMax: CalculatorConfig = { ...CONFIG, maxSystemKw: 20 };
    const r = calculateSolarSystem({ monthlyBillIls: 3000, systemType: 'on-grid', phase: 'three', config: smallMax });
    // 25.9 > 20 → تواصل مباشر
    expect(r.needsDirectContact).toBe(true);
    expect(r.panelsCount).toBe(0);
    expect(r.totalPriceIls).toBe(0);
  });

  it('فاتورة ضمن الحد لكن لا يوجد حجم مناسب → تواصل مباشر', () => {
    const tiny: CalculatorConfig = { ...CONFIG, systemSizes: [{ kw: 3, phase: 'single', onGrid: 12000, offGrid: 18000, hybrid: 22000 }] };
    const r = calculateSolarSystem({ monthlyBillIls: 1500, systemType: 'on-grid', phase: 'single', config: tiny });
    // 1500/0.7/30/5.5 = 12.98 > 3 ولا 3 فاز متاح → تواصل
    expect(r.needsDirectContact).toBe(true);
  });
});

describe('توافق خلفي مع إعدادات بلا phase', () => {
  const legacy: CalculatorConfig = {
    ...CONFIG,
    systemSizes: [
      { kw: 5, onGrid: 18000, offGrid: 25000, hybrid: 30000 },
      { kw: 10, onGrid: 35000, offGrid: 47000, hybrid: 56000 },
    ],
  };
  it('أحجام بلا phase تنطبق على أي فاز', () => {
    const rSingle = calculateSolarSystem({ monthlyBillIls: 500, systemType: 'on-grid', phase: 'single', config: legacy });
    const rThree = calculateSolarSystem({ monthlyBillIls: 500, systemType: 'on-grid', phase: 'three', config: legacy });
    expect(rSingle.step4_systemKw).toBe(5);
    expect(rThree.step4_systemKw).toBe(5);
    expect(rSingle.totalPriceIls).toBe(18000);
    expect(rThree.totalPriceIls).toBe(18000);
  });
});
