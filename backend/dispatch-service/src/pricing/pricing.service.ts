import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SettingsService } from '@cabi/backend/settings';
import {
  CategoryPricingConfig,
  CalculateFareDto,
  FareCalculationResult,
  DEFAULT_CATEGORY_PRICING,
} from './pricing.types';

export const PRICING_SETTING_KEY = 'PRICING_CATEGORY_CONFIG';

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async getCategoriesPricing(): Promise<CategoryPricingConfig[]> {
    try {
      const stored = await this.settingsService.getSystemSetting(PRICING_SETTING_KEY);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        return stored as CategoryPricingConfig[];
      }
    } catch (err: any) {
      this.logger.warn(`Could not load pricing configs from database: ${err.message}. Using defaults.`);
    }

    // Initialize with defaults if missing
    try {
      await this.settingsService.updateSystemSetting(PRICING_SETTING_KEY, DEFAULT_CATEGORY_PRICING);
    } catch (e: any) {
      this.logger.warn(`Failed to seed default pricing configs: ${e.message}`);
    }

    return DEFAULT_CATEGORY_PRICING;
  }

  async getCategoryPricing(category?: string): Promise<CategoryPricingConfig> {
    const allConfigs = await this.getCategoriesPricing();
    if (!category) {
      return allConfigs.find((c) => c.category === 'STANDARD') || allConfigs[0];
    }

    const normalized = category.trim().toUpperCase();
    const match = allConfigs.find(
      (c) => c.category.toUpperCase() === normalized || c.displayName.toUpperCase().includes(normalized),
    );

    if (match) {
      return match;
    }

    // Fallbacks
    if (normalized.includes('BODA') || normalized.includes('MOTO')) {
      return allConfigs.find((c) => c.category === 'BODA') || allConfigs[0];
    }
    if (normalized.includes('BASIC') || normalized.includes('ECONOMY')) {
      return allConfigs.find((c) => c.category === 'BASIC') || allConfigs[0];
    }
    if (normalized.includes('XL') || normalized.includes('SUV')) {
      return allConfigs.find((c) => c.category === 'XL') || allConfigs[0];
    }
    if (normalized.includes('PREMIUM') || normalized.includes('EXEC')) {
      return allConfigs.find((c) => c.category === 'PREMIUM') || allConfigs[0];
    }

    return allConfigs.find((c) => c.category === 'STANDARD') || allConfigs[0];
  }

  async updateCategoriesPricing(configs: CategoryPricingConfig[]): Promise<CategoryPricingConfig[]> {
    if (!Array.isArray(configs) || configs.length === 0) {
      throw new BadRequestException('Pricing configuration must be a non-empty array of category configs.');
    }

    for (const item of configs) {
      if (!item.category) {
        throw new BadRequestException('Category identifier is required for all entries.');
      }
      if (typeof item.baseFare !== 'number' || item.baseFare < 0) {
        throw new BadRequestException(`Invalid base fare for category ${item.category}`);
      }
      if (typeof item.perKmRate !== 'number' || item.perKmRate < 0) {
        throw new BadRequestException(`Invalid per-km rate for category ${item.category}`);
      }
      if (typeof item.perMinuteRate !== 'number' || item.perMinuteRate < 0) {
        throw new BadRequestException(`Invalid per-minute rate for category ${item.category}`);
      }
      if (typeof item.minimumFare !== 'number' || item.minimumFare < 0) {
        throw new BadRequestException(`Invalid minimum fare for category ${item.category}`);
      }
      if (typeof item.roundingStep !== 'number' || item.roundingStep <= 0) {
        throw new BadRequestException(`Invalid rounding step for category ${item.category}. Must be > 0.`);
      }
    }

    await this.settingsService.updateSystemSetting(PRICING_SETTING_KEY, configs);
    this.logger.log(`Updated pricing configurations for ${configs.length} categories.`);
    return configs;
  }

  async calculateFare(dto: CalculateFareDto): Promise<FareCalculationResult> {
    const config = await this.getCategoryPricing(dto.category);
    const distanceKm = Math.max(0, Number(dto.distanceKm) || 0);
    const durationMinutes = Math.max(0, Number(dto.durationMinutes) || 0);
    const surgeMultiplier = Math.max(1.0, Number(dto.surgeMultiplier) || 1.0);

    const distanceCost = Number((distanceKm * config.perKmRate).toFixed(2));
    const timeCost = Number((durationMinutes * config.perMinuteRate).toFixed(2));
    const subtotal = Number((config.baseFare + distanceCost + timeCost).toFixed(2));

    // Enforce minimum fare floor
    const preRoundFare = Math.max(config.minimumFare, subtotal);
    const surgedPreRoundFare = Number((preRoundFare * surgeMultiplier).toFixed(2));

    // Standard mathematical rounding to configured category step:
    // e.g. BODA = 10 (143 -> 140, 145 -> 150)
    // e.g. BASIC = 25 (212 -> 200, 218 -> 225)
    // e.g. STANDARD = 50 (320 -> 300, 325 -> 350)
    const step = config.roundingStep > 0 ? config.roundingStep : 1;
    const finalFare = Math.round(surgedPreRoundFare / step) * step;
    const roundingDifference = Number((finalFare - surgedPreRoundFare).toFixed(2));

    return {
      category: config.category,
      displayName: config.displayName,
      baseFare: config.baseFare,
      perKmRate: config.perKmRate,
      perMinuteRate: config.perMinuteRate,
      minimumFare: config.minimumFare,
      roundingStep: config.roundingStep,
      distanceKm: Number(distanceKm.toFixed(2)),
      durationMinutes: Number(durationMinutes.toFixed(2)),
      distanceCost,
      timeCost,
      subtotal,
      preRoundFare,
      surgeMultiplier,
      surgedPreRoundFare,
      finalFare,
      roundingDifference,
    };
  }
}
