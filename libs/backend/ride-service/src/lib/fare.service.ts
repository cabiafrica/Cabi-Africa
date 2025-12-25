import { Injectable } from '@nestjs/common';

export enum BookingType {
    ONE_WAY = 'ONE_WAY',
    ROUND_TRIP = 'ROUND_TRIP',
    HOURLY = 'HOURLY',
    RENTAL = 'RENTAL',
}

@Injectable()
export class FareService {
    // Story 30.5: Vehicle Pricing Tiers
    private readonly pricingRules = {
        'Standard': { base: 50, perKm: 40, perMin: 5 },
        'Premium': { base: 100, perKm: 70, perMin: 10 },
        'XL': { base: 150, perKm: 90, perMin: 15 },
        'Moto': { base: 30, perKm: 20, perMin: 3 }
    };

    calculateFare(distanceKm: number, timeMinutes: number, type: BookingType, options?: any): number {
        const vehicleType = options?.vehicleType || 'Standard';
        const rules = this.pricingRules[vehicleType as keyof typeof this.pricingRules] || this.pricingRules['Standard'];

        // Basic Fare (Story 30.5)
        let total = rules.base + (distanceKm * rules.perKm) + (timeMinutes * rules.perMin);

        // Story 30.4: Dynamic Surge Pricing
        // In real app, this comes from a geospatial service. Mocked here.
        let surgeMultiplier = this.getSurgeMultiplier(options?.pickupLocation);

        // Story 87.1: Business Ride Pass
        if (options?.corporateRidePassActive) {
            // Benefit: No surge pricing for corporate pass holders
            surgeMultiplier = 1.0;
        }

        total *= surgeMultiplier;

        // Story 30.1: Destination Surcharge
        // Mock check if destination is 'Airport' or similar
        const surcharge = this.getDestinationSurcharge(options?.destinationLocation);
        total += surcharge;

        // Story 30.3: Toll Roads
        const tolls = this.calculateTollFees(options?.routeId);
        total += tolls;

        // Handling different booking types from previous batch (Story 47.x)
        if (type === BookingType.ROUND_TRIP) {
            // Round trip logic: 2x distance, plus wait time charge at dest
            const waitTime = options?.waitTimeMinutes || 0;
            const waitCharge = waitTime * 2; // Fixed low rate for planned waiting
            // Recalculate base for return trip (usually same distance)
            // Initial total covers one way.
            total = (total * 2) * 0.9 + waitCharge; // 10% discount
        } else if (type === BookingType.HOURLY) {
            const hours = options?.hours || 2;
            const hourlyRate = vehicleType === 'Premium' ? 2500 : 1500;
            total = hours * hourlyRate;
        } else if (type === BookingType.RENTAL) {
            const packageType = options?.package || 'Half Day';
            if (packageType === 'Half Day') total = vehicleType === 'Premium' ? 8000 : 5000;
            if (packageType === 'Full Day') total = vehicleType === 'Premium' ? 15000 : 9000;
        }

        // Story 30.2: Ad-hoc Wait Time Fee (for pickup delays)
        // Passed effectively as 'actualWaitTime' from RideService
        if (options?.actualWaitTimeMinutes) {
            total += this.calculateWaitTimeFee(options.actualWaitTimeMinutes);
        }

        return Math.round(total);
    }

    private getSurgeMultiplier(location: any): number {
        // Mock Logic: If lat > 0, 1.5x surge.
        if (location && location.lat > 0) return 1.5;
        return 1.0;
    }

    private getDestinationSurcharge(location: any): number {
        // Mock Logic: If location name contains 'Airport', add 500.
        if (location && location.name && location.name.includes('Airport')) {
            return 500;
        }
        return 0;
    }

    private calculateTollFees(routeId: string): number {
        // Mock: If routeId is 'toll_route', return 200.
        return routeId === 'toll_route' ? 200 : 0;
    }

    private calculateWaitTimeFee(minutes: number): number {
        const gracePeriod = 2; // Story 30.2
        if (minutes <= gracePeriod) return 0;
        const chargeableMinutes = minutes - gracePeriod;
        return chargeableMinutes * 10; // 10 KES per minute
    }
}
