/**
 * @jest-environment node
 */
import { calculateSolarSystem, type CalculatorInput, type CalculatorConfigData } from './calculator';

const mockConfig: CalculatorConfigData = {
  averageSunHoursPerDay: 5.5,
  panelWatts: 550,
  inverterEfficiency: 0.96,
  systemLoss: 0.14,
  pricePerKwhIls: 0.65,
  pricePerWattInstalled: 4.5,
  panelPriceIls: 400,
  inverterPriceBase: 3500,
  batteryPricePerKwh: 2200,
  systemLifeYears: 25,
  annualDegradation: 0.005,
  co2PerKwh: 0.49,
};

const baseInput: CalculatorInput = {
  monthlyBillIls: 650,
  usageType: 'residential',
  systemType: 'on-grid',
  config: mockConfig,
};

describe('Solar Calculator Tests', () => {

  describe('Basic Outputs', () => {
    test('returns valid system size and panel count', () => {
      const result = calculateSolarSystem(baseInput);
      expect(result.systemSizeKw).toBeGreaterThan(0);
      expect(result.panelsCount).toBeGreaterThan(0);
      expect(result.estimatedCostIls).toBeGreaterThan(0);
    });

    test('coverage percent is between 0 and 100', () => {
      const result = calculateSolarSystem(baseInput);
      expect(result.coveragePercent).toBeGreaterThanOrEqual(0);
      expect(result.coveragePercent).toBeLessThanOrEqual(100);
    });

    test('payback period is a positive number', () => {
      const result = calculateSolarSystem(baseInput);
      expect(result.paybackYears).toBeGreaterThan(0);
    });
  });

  describe('Financial Calculations', () => {
    test('annual saving is positive', () => {
      const result = calculateSolarSystem(baseInput);
      expect(result.annualSavingIls).toBeGreaterThan(0);
    });

    test('payback equals cost divided by annual saving', () => {
      const result = calculateSolarSystem(baseInput);
      const expected = Math.round((result.estimatedCostIls / result.annualSavingIls) * 10) / 10;
      expect(result.paybackYears).toBe(expected);
    });

    test('25-year breakdown has 25 entries', () => {
      const result = calculateSolarSystem(baseInput);
      expect(result.yearlyBreakdown).toHaveLength(25);
    });

    test('cumulative saving grows each year', () => {
      const result = calculateSolarSystem(baseInput);
      const breakdown = result.yearlyBreakdown;
      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].cumulativeSavingIls).toBeGreaterThan(breakdown[i - 1].cumulativeSavingIls);
      }
    });
  });

  describe('System Types', () => {
    test('off-grid system is larger than on-grid for same bill', () => {
      const onGrid = calculateSolarSystem({ ...baseInput, systemType: 'on-grid' });
      const offGrid = calculateSolarSystem({ ...baseInput, systemType: 'off-grid' });
      expect(offGrid.systemSizeKw).toBeGreaterThan(onGrid.systemSizeKw);
    });

    test('hybrid system is between on-grid and off-grid in size', () => {
      const onGrid = calculateSolarSystem({ ...baseInput, systemType: 'on-grid' });
      const hybrid = calculateSolarSystem({ ...baseInput, systemType: 'hybrid' });
      const offGrid = calculateSolarSystem({ ...baseInput, systemType: 'off-grid' });
      expect(hybrid.systemSizeKw).toBeGreaterThanOrEqual(onGrid.systemSizeKw);
      expect(hybrid.systemSizeKw).toBeLessThanOrEqual(offGrid.systemSizeKw);
    });
  });

  describe('Edge Cases', () => {
    test('throws error for zero bill', () => {
      const input: CalculatorInput = { ...baseInput, monthlyBillIls: 0 };
      expect(() => calculateSolarSystem(input)).toThrow();
    });

    test('throws error for negative bill', () => {
      const input: CalculatorInput = { ...baseInput, monthlyBillIls: -100 };
      expect(() => calculateSolarSystem(input)).toThrow();
    });

    test('handles very low consumption', () => {
      const result = calculateSolarSystem({ ...baseInput, monthlyBillIls: 1 });
      expect(result.systemSizeKw).toBeGreaterThan(0);
      expect(result.panelsCount).toBeGreaterThan(0);
    });

    test('handles very high consumption', () => {
      const result = calculateSolarSystem({ ...baseInput, monthlyBillIls: 100000 });
      expect(result.systemSizeKw).toBeGreaterThan(500);
    });
  });

  describe('Environment Impact', () => {
    test('co2 saved is positive', () => {
      const result = calculateSolarSystem(baseInput);
      expect(result.co2SavedAnnualKg).toBeGreaterThan(0);
    });

    test('trees equivalent is positive', () => {
      const result = calculateSolarSystem(baseInput);
      expect(result.treesEquivalent).toBeGreaterThan(0);
    });
  });

  describe('Battery Options', () => {
    test('battery cost is calculated when batteryKg provided', () => {
      const result = calculateSolarSystem({ ...baseInput, batteryKg: 100 });
      expect(result.batteryCostIls).toBeGreaterThan(0);
      expect(result.batteryWeightKg).toBe(100);
    });

    test('no battery cost without batteryKg', () => {
      const result = calculateSolarSystem(baseInput);
      expect(result.batteryCostIls).toBeUndefined();
    });
  });
});
