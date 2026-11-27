import { expect, describe, it, beforeEach, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { RideController } from './ride.controller';
import { DEFAULT_CATEGORY_PRICING } from '../pricing/pricing.types';

describe('RideController - Comprehensive Market Grade Edge Case & Estimation Tests', () => {
  let controller: RideController;
  let mockRideService: any;
  let mockPricingService: any;

  beforeEach(() => {
    mockRideService = {
      cancelRide: jest.fn(),
      createRide: jest.fn(),
      getNearbyDrivers: jest.fn(),
    };

    mockPricingService = {
      getCategoriesPricing: jest.fn(async () => DEFAULT_CATEGORY_PRICING),
    };

    controller = new RideController(mockRideService, mockPricingService);
  });

  describe('POST /rides/estimate - Multi-Tier Pricing & Geofence', () => {
    it('should compute tiered estimates for valid Nairobi metropolitan coordinates', async () => {
      const payload = {
        pickup: 'Kenyatta Avenue, Nairobi',
        destination: 'Westlands, Nairobi',
        pickupCoords: { lat: -1.286389, lng: 36.817223 },
        dropoffCoords: { lat: -1.2655, lng: 36.8048 },
        includeTrajectory: true,
      };

      const result = await controller.estimateFare(payload) as any;

      expect(result).toBeDefined();
      expect(result.estimates).toBeDefined();
      expect(result.estimates).toHaveLength(5);

      const tierKeys = result.estimates.map((e: any) => e.categoryKey);
      expect(tierKeys).toEqual(['BODA', 'BASIC', 'STANDARD', 'XL', 'PREMIUM']);

      // Check rounding consistency
      const boda = result.estimates.find((e: any) => e.categoryKey === 'BODA');
      expect(boda.price % 10).toBe(0);
      expect(boda.icon).toBe('🏍️');

      const basic = result.estimates.find((e: any) => e.categoryKey === 'BASIC');
      expect(basic.price % 25).toBe(0);

      const standard = result.estimates.find((e: any) => e.categoryKey === 'STANDARD');
      expect(standard.price % 50).toBe(0);

      const premium = result.estimates.find((e: any) => e.categoryKey === 'PREMIUM');
      expect(premium.price % 50).toBe(0);
      expect(premium.icon).toBe('✨');

      expect(result.trajectory).toBeDefined();
      expect(result.trajectory.distanceKm).toBeGreaterThan(0);
      expect(result.trajectory.durationMin).toBeGreaterThan(0);
    });

    it('should enforce Edge Case 1: reject out-of-bounds coordinates with OUT_OF_SERVICE_AREA', async () => {
      const payload = {
        pickup: 'London Heathrow Airport',
        destination: 'Central London',
        pickupCoords: { lat: 51.4700, lng: -0.4543 }, // UK - Outside East Africa bounds
        dropoffCoords: { lat: 51.5074, lng: -0.1278 },
      };

      await expect(controller.estimateFare(payload)).rejects.toThrow(BadRequestException);
      await expect(controller.estimateFare(payload)).rejects.toThrow(/OUT_OF_SERVICE_AREA/);
    });

    it('should enforce Edge Case 1: reject excessive inter-city distance (>200 km) with OUT_OF_SERVICE_AREA', async () => {
      const payload = {
        pickup: 'Nairobi',
        destination: 'Mombasa',
        pickupCoords: { lat: -1.286389, lng: 36.817223 },
        dropoffCoords: { lat: -4.0435, lng: 39.6682 }, // ~480 km
      };

      await expect(controller.estimateFare(payload)).rejects.toThrow(BadRequestException);
      await expect(controller.estimateFare(payload)).rejects.toThrow(/OUT_OF_SERVICE_AREA/);
    });

    it('should require either address text or coordinates', async () => {
      await expect(controller.estimateFare({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('Edge Case 2: In-Transit Cancellation Charges Frozen', () => {
    it('should route cancellation requests to rideService.cancelRide', async () => {
      mockRideService.cancelRide.mockResolvedValue({
        id: 'ride-99',
        status: 'CANCELLED',
      });

      const res = await controller.cancelRide('ride-99', { reason: 'Passenger emergency midway' } as any, { user: { role: 'SUPER_ADMIN' } });
      expect(res).toBeDefined();
      expect(mockRideService.cancelRide).toHaveBeenCalledWith('ride-99', 'Passenger emergency midway');
    });
  });
});
