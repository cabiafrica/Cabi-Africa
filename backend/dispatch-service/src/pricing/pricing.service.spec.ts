import { PricingService, PRICING_SETTING_KEY } from './pricing.service';
import { DEFAULT_CATEGORY_PRICING, CategoryPricingConfig } from './pricing.types';

describe('PricingService & Real-time Taximeter Rounding Engine', () => {
  let pricingService: PricingService;
  let mockSettingsService: any;
  let storedSettings: Map<string, any>;

  beforeEach(() => {
    storedSettings = new Map<string, any>();
    mockSettingsService = {
      getSystemSetting: jest.fn(async (key: string) => storedSettings.get(key) || null),
      updateSystemSetting: jest.fn(async (key: string, value: any) => {
        storedSettings.set(key, value);
        return { key, value };
      }),
    };
    pricingService = new PricingService(mockSettingsService);
  });

  describe('Category Configuration & Retrieval', () => {
    it('should initialize with default categories when no settings exist', async () => {
      const categories = await pricingService.getCategoriesPricing();
      expect(categories).toHaveLength(5);
      expect(categories.map((c) => c.category)).toEqual(['BODA', 'BASIC', 'STANDARD', 'XL', 'PREMIUM']);
    });

    it('should match category case-insensitively and fallback cleanly', async () => {
      const boda = await pricingService.getCategoryPricing('boda');
      expect(boda.category).toBe('BODA');
      expect(boda.roundingStep).toBe(10);

      const basic = await pricingService.getCategoryPricing('Basic');
      expect(basic.category).toBe('BASIC');
      expect(basic.roundingStep).toBe(25);

      const standard = await pricingService.getCategoryPricing('standard');
      expect(standard.category).toBe('STANDARD');
      expect(standard.roundingStep).toBe(50);
    });

    it('should allow admin to update category rates and rounding steps', async () => {
      const customConfigs: CategoryPricingConfig[] = [
        {
          category: 'BODA',
          displayName: 'Boda Boda Custom',
          baseFare: 60,
          perKmRate: 20,
          perMinuteRate: 3,
          minimumFare: 60,
          roundingStep: 20, // Admin changed rounding to nearest 20
          isActive: true,
        },
      ];

      await pricingService.updateCategoriesPricing(customConfigs);
      const updated = await pricingService.getCategoryPricing('BODA');
      expect(updated.roundingStep).toBe(20);
      expect(updated.baseFare).toBe(60);
    });
  });

  describe('Real-time Taximeter Mathematical Rounding Calculations', () => {
    it('Boda Boda: should round to nearest figure of KES 10', async () => {
      // BODA rates: base: 50, perKm: 25, perMin: 2, min: 50, step: 10
      // Case 1: 3.2 km, 7.0 min
      // Distance cost = 3.2 * 25 = 80
      // Time cost = 7.0 * 2 = 14
      // Raw subtotal = 50 + 80 + 14 = 144
      // Math.round(144 / 10) * 10 = 14 * 10 = 140
      const result1 = await pricingService.calculateFare({
        category: 'BODA',
        distanceKm: 3.2,
        durationMinutes: 7.0,
      });
      expect(result1.subtotal).toBe(144.0);
      expect(result1.finalFare).toBe(140);
      expect(result1.roundingStep).toBe(10);

      // Case 2: 3.2 km, 8.0 min
      // Distance cost = 80, Time cost = 16 => Raw = 146
      // Math.round(146 / 10) * 10 = 15 * 10 = 150
      const result2 = await pricingService.calculateFare({
        category: 'BODA',
        distanceKm: 3.2,
        durationMinutes: 8.0,
      });
      expect(result2.subtotal).toBe(146.0);
      expect(result2.finalFare).toBe(150);
    });

    it('Basic (Economy): should round to nearest figure of KES 25', async () => {
      // BASIC rates: base: 100, perKm: 35, perMin: 3, min: 100, step: 25
      // Case 1: 3.0 km, 4.0 min
      // Distance = 105, Time = 12 => Raw = 100 + 105 + 12 = 217
      // 217 is closer to 225 than 200: Math.round(217 / 25) * 25 = 9 * 25 = 225
      const result1 = await pricingService.calculateFare({
        category: 'BASIC',
        distanceKm: 3.0,
        durationMinutes: 4.0,
      });
      expect(result1.subtotal).toBe(217.0);
      expect(result1.finalFare).toBe(225);
      expect(result1.roundingStep).toBe(25);

      // Case 2: 3.0 km, 2.0 min
      // Distance = 105, Time = 6 => Raw = 211
      // 211 is closer to 200 than 225: Math.round(211 / 25) * 25 = 8 * 25 = 200
      const result2 = await pricingService.calculateFare({
        category: 'BASIC',
        distanceKm: 3.0,
        durationMinutes: 2.0,
      });
      expect(result2.subtotal).toBe(211.0);
      expect(result2.finalFare).toBe(200);
    });

    it('Standard (Sedan): should round to nearest figure of KES 50', async () => {
      // STANDARD rates: base: 150, perKm: 45, perMin: 5, min: 150, step: 50
      // Case 1: 3.0 km, 8.0 min
      // Distance = 135, Time = 40 => Raw = 150 + 135 + 40 = 325
      // Math.round(325 / 50) * 50 = 7 * 50 = 350
      const result1 = await pricingService.calculateFare({
        category: 'STANDARD',
        distanceKm: 3.0,
        durationMinutes: 8.0,
      });
      expect(result1.subtotal).toBe(325.0);
      expect(result1.finalFare).toBe(350);
      expect(result1.roundingStep).toBe(50);

      // Case 2: 3.0 km, 7.0 min
      // Distance = 135, Time = 35 => Raw = 320
      // Math.round(320 / 50) * 50 = 6 * 50 = 300
      const result2 = await pricingService.calculateFare({
        category: 'STANDARD',
        distanceKm: 3.0,
        durationMinutes: 7.0,
      });
      expect(result2.subtotal).toBe(320.0);
      expect(result2.finalFare).toBe(300);
    });

    it('should strictly enforce minimum fare floor', async () => {
      // STANDARD minimum fare is 150
      // Short trip: 0.1 km, 0.5 min
      // Raw: 150 + 4.5 + 2.5 = 157
      // If base was lower, e.g. 0 km, 0 min -> minimum fare 150 applies
      const result = await pricingService.calculateFare({
        category: 'STANDARD',
        distanceKm: 0.0,
        durationMinutes: 0.0,
      });
      expect(result.finalFare).toBe(150);
      expect(result.preRoundFare).toBe(150);
    });

    it('should correctly apply surge multipliers before rounding', async () => {
      // STANDARD: 2.0 km, 5.0 min -> Base: 150, Dist: 90, Time: 25 -> Pre-round: 265
      // 1.5x surge: 265 * 1.5 = 397.5
      // Math.round(397.5 / 50) * 50 = 8 * 50 = 400
      const result = await pricingService.calculateFare({
        category: 'STANDARD',
        distanceKm: 2.0,
        durationMinutes: 5.0,
        surgeMultiplier: 1.5,
      });
      expect(result.preRoundFare).toBe(265.0);
      expect(result.surgedPreRoundFare).toBe(397.5);
      expect(result.finalFare).toBe(400);
    });
  });
});
