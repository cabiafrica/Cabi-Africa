export interface CategoryPricingConfig {
  category: string; // 'BODA', 'BASIC', 'STANDARD', 'XL', 'PREMIUM'
  displayName: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  roundingStep: number; // e.g. 10 for BODA, 25 for BASIC, 50 for STANDARD
  description?: string;
  isActive: boolean;
}

export class CalculateFareDto {
  category?: string;
  distanceKm!: number;
  durationMinutes!: number;
  surgeMultiplier?: number;
}

export interface FareCalculationResult {
  category: string;
  displayName: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  roundingStep: number;
  distanceKm: number;
  durationMinutes: number;
  distanceCost: number;
  timeCost: number;
  subtotal: number;
  preRoundFare: number;
  surgeMultiplier: number;
  surgedPreRoundFare: number;
  finalFare: number;
  roundingDifference: number;
}

export const DEFAULT_CATEGORY_PRICING: CategoryPricingConfig[] = [
  {
    category: 'BODA',
    displayName: 'Boda Boda (Motorcycle)',
    baseFare: 50,
    perKmRate: 25,
    perMinuteRate: 2,
    minimumFare: 50,
    roundingStep: 10,
    description: 'Affordable two-wheel delivery and transport. Fares round to nearest KES 10.',
    isActive: true,
  },
  {
    category: 'BASIC',
    displayName: 'Cabi Basic (Economy)',
    baseFare: 100,
    perKmRate: 35,
    perMinuteRate: 3,
    minimumFare: 100,
    roundingStep: 25,
    description: 'Compact eco-rides. Fares round to nearest KES 25.',
    isActive: true,
  },
  {
    category: 'STANDARD',
    displayName: 'Cabi Standard (Sedan)',
    baseFare: 150,
    perKmRate: 45,
    perMinuteRate: 5,
    minimumFare: 150,
    roundingStep: 50,
    description: 'Comfortable everyday 4-seater sedans. Fares round to nearest KES 50.',
    isActive: true,
  },
  {
    category: 'XL',
    displayName: 'Cabi XL (6-Seater / SUV)',
    baseFare: 250,
    perKmRate: 65,
    perMinuteRate: 7,
    minimumFare: 250,
    roundingStep: 50,
    description: 'Spacious group and luggage rides. Fares round to nearest KES 50.',
    isActive: true,
  },
  {
    category: 'PREMIUM',
    displayName: 'Cabi Premium (Executive)',
    baseFare: 300,
    perKmRate: 85,
    perMinuteRate: 10,
    minimumFare: 300,
    roundingStep: 50,
    description: 'Executive luxury rides with top-tier comfort. Fares round to nearest KES 50.',
    isActive: true,
  },
];
