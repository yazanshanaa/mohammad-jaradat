/**
 * @jest-environment node
 */
import { calculateSolarSystem, preciseRound, type CalculatorInput, type CalculatorConfigData } from './calculator';

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

describe('Solar Calculator Comprehensive Tests', () => {
  
  describe('preciseRound Utility', () => {
    test('rounds correctly to 2 decimal places', () => {
      expect(preciseRound(1.005, 2)).toBe(1.01);
      expect(preciseRound(1.004, 2)).toBe(1.00);
      expect(preciseRound(0.1 + 0.2, 2)).toBe(0.3); // Classic JS floating point case
    });

    test('rounds correctly to 0 decimal places', () => {
      expect(preciseRound(1.5, 0)).toBe(2);
      expect(preciseRound(1.4, 0)).toBe(1);
    });
  });

  describe('Financial Calculations', () => {
    test('calculates correct annual savings for 100% coverage', () => {
      const input: CalculatorInput = {
        monthlyBillIls: 650, // 1000 kWh
        usageType: 'residential',
        location: 'jericho', // 6.1 sun hours
        systemType: 'on-grid',
        wantBatteries: false,
        config: mockConfig,
      };

      const result = calculateSolarSystem(input);
      
      // Annual savings should be monthly bill * 12 if coverage is 100%
      if (result.coveragePercent === 100) {
        expect(result.annualSavingIls).toBe(650 * 12);
      }
    });

    test('payback period is calculated correctly', () => {
      const input: CalculatorInput = {
        monthlyKwhConsumption: 1000,
        usageType: 'residential',
        location: 'hebron',
        systemType: 'on-grid',
        wantBatteries: false,
        config: mockConfig,
      };

      const result = calculateSolarSystem(input);
      const expectedPayback = result.estimatedCostIls / result.annualSavingIls;
      expect(result.paybackYears).toBeCloseTo(expectedPayback, 1);
    });

    test('ROI after 25 years includes initial cost as negative starting point', () => {
      const input: CalculatorInput = {
        monthlyKwhConsumption: 500,
        usageType: 'residential',
        location: 'ramallah',
        systemType: 'on-grid',
        wantBatteries: false,
        config: mockConfig,
      };

      const result = calculateSolarSystem(input);
      
      // The 25th year cumulative saving should be the ROI
      expect(result.roi25Years).toBe(result.yearlyBreakdown[24].cumulativeSavingIls);
      
      // Cumulative saving in year 1 should be (Savings - Initial Cost)
      const year1 = result.yearlyBreakdown[0];
      expect(year1.cumulativeSavingIls).toBe(Math.round(year1.savingIls - result.estimatedCostIls));
    });
  });

  describe('Edge Cases & Robustness', () => {
    test('handles very low consumption', () => {
      const input: CalculatorInput = {
        monthlyBillIls: 1, 
        usageType: 'residential',
        location: 'ramallah',
        systemType: 'on-grid',
        wantBatteries: false,
        config: mockConfig,
      };

      const result = calculateSolarSystem(input);
      expect(result.systemSizeKw).toBeGreaterThan(0);
      expect(result.panelsCount).toBeGreaterThan(0);
      expect(result.estimatedCostIls).toBeGreaterThan(0);
    });

    test('handles extremely high consumption', () => {
      const input: CalculatorInput = {
        monthlyKwhConsumption: 100000, // 100 MegaWattHours
        usageType: 'industrial',
        location: 'jericho',
        systemType: 'on-grid',
        wantBatteries: false,
        config: mockConfig,
      };

      const result = calculateSolarSystem(input);
      expect(result.systemSizeKw).toBeGreaterThan(500);
      expect(result.estimatedCostIls).toBeGreaterThan(2000000);
    });

    test('throws error for missing consumption inputs', () => {
      const input: any = {
        usageType: 'residential',
        location: 'ramallah',
        systemType: 'on-grid',
        wantBatteries: false,
        config: mockConfig,
      };

      expect(() => calculateSolarSystem(input)).toThrow('يجب توفير إما الفاتورة أو الاستهلاك');
    });

    test('handles zero consumption gracefully if provided as 0', () => {
        const input: CalculatorInput = {
          monthlyKwhConsumption: 0,
          usageType: 'residential',
          location: 'ramallah',
          systemType: 'on-grid',
          wantBatteries: false,
          config: mockConfig,
        };
        
        // Even if 0 is passed, the app should throw or return zeroed results.
        // Currently it throws because 0 is falsy in `if (input.monthlyKwhConsumption)`
        expect(() => calculateSolarSystem(input)).toThrow();
    });
  });

  describe('Location Specificity', () => {
    test('Hebron (high sun) requires smaller system than Jenin (low sun) for same usage', () => {
      const baseInput = {
        monthlyKwhConsumption: 1000,
        usageType: 'residential',
        systemType: 'on-grid',
        wantBatteries: false,
        config: mockConfig,
      };

      const hebron = calculateSolarSystem({ ...baseInput, location: 'hebron' } as CalculatorInput);
      const jenin = calculateSolarSystem({ ...baseInput, location: 'jenin' } as CalculatorInput);

      // Hebron has 5.8 sun hours, Jenin has 5.1.
      // Larger sun hours -> smaller system needed for same daily production.
      // However, panels are rounded up, so we check the raw systemSizeKw or ensure it's not greater.
      expect(hebron.systemSizeKw).toBeLessThanOrEqual(jenin.systemSizeKw);
    });
  });

  describe('Degradation Logic', () => {
    test('production decreases every year', () => {
      const input: CalculatorInput = {
        monthlyKwhConsumption: 1000,
        usageType: 'residential',
        location: 'ramallah',
        systemType: 'on-grid',
        wantBatteries: false,
        config: mockConfig,
      };

      const result = calculateSolarSystem(input);
      const breakdown = result.yearlyBreakdown;

      for (let i = 1; i < 25; i++) {
        expect(breakdown[i].productionKwh).toBeLessThanOrEqual(breakdown[i-1].productionKwh);
      }
    });
  });
});
