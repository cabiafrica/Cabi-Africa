import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { VehicleType, BadgeTier } from '@prisma/client';
import { TripTrackingGateway } from '../trip-tracking.gateway';

export interface DriverMatch {
    driverId: string;
    distance: number; // in km
    estimatedArrivalMinutes: number;
    rating: number | null;
    vehicleType: VehicleType;
    location: { lat: number; lng: number };
    badgePriority?: number; // Priority weight for matching
    badgeTier?: BadgeTier | null;
    isExtendedPickup?: boolean;
    extraPickupKm?: number;
    extendedPickupSubsidy?: number;
    driverPreferredRadiusKm?: number;
    passengerConsentRequired?: boolean;
    fitnessScore?: number;
    scoreBreakdown?: {
        distanceScore: number;
        ratingScore: number;
        acceptanceScore: number;
        idleScore: number;
        badgeScore: number;
        saccoScore: number;
        penaltyDeduction: number;
    };
}

export interface FindNearbyDriversParams {
    pickupLat: number;
    pickupLng: number;
    vehicleType?: VehicleType;
    maxDistanceKm?: number;
    maxDrivers?: number;
    useBadgePriority?: boolean; // Whether to use badge-based priority
    maxDistancePenalty?: number; // Max km penalty for prioritizing high-badge drivers
    useFormulaScoring?: boolean; // Multi-factor fitness scoring formula
}

const BADGE_TIER_WEIGHTS: Record<string, number> = {
    'ELITE': 100,
    'ROAD_MASTER': 75,
    'STAR_DRIVER': 50,
    'ROOKIE': 25,
    'BRONZE': 0,
    'SILVER': 0,
    'GOLD': 0,
    'PLATINUM': 0,
    'DIAMOND': 0,
};

@Injectable()
export class MatchingService {
    private readonly logger = new Logger(MatchingService.name);
    private readonly EARTH_RADIUS_KM = 6371;
    private readonly AVERAGE_SPEED_KMH = 40; // Average city driving speed

    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => TripTrackingGateway))
        private tripTrackingGateway: TripTrackingGateway
    ) { }

    /**
     * Calculate distance between two points using Haversine formula
     * @returns distance in kilometers
     */
    calculateDistance(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ): number {
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
            Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = this.EARTH_RADIUS_KM * c;

        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Cabi Captain Selection Formula
     * Calculates the multi-factor Fitness Score S_dispatch in [0, 100]:
     * S = 0.35 * S_dist + 0.20 * S_rating + 0.15 * S_accept + 0.15 * S_idle + 0.10 * S_badge + 0.05 * S_sacco - Penalties
     */
    calculateDriverFitnessScore(
        driver: any,
        distanceKm: number,
        maxDistanceKm: number,
        badgePriority = 0
    ): { fitnessScore: number; breakdown: any } {
        // 1. Proximity Score (35% weight): Inversely decaying with road distance
        const safeMax = Math.max(0.5, maxDistanceKm);
        const distanceScore = Math.max(0, 100 * (1 - distanceKm / safeMax));

        // 2. Captain Quality / Rating Score (20% weight): Scale 3.5 -> 5.0 to 0 -> 100
        const rawRating = typeof driver.averageRating === 'number' && driver.averageRating > 0
            ? driver.averageRating
            : 4.85; // Default favorable starting score for unrated captains
        const ratingScore = Math.max(0, Math.min(100, ((rawRating - 3.5) / 1.5) * 100));

        // 3. Reliability / Acceptance Rate Score (15% weight): 0 - 100%
        let acceptanceScore = 90;
        if (typeof driver.acceptanceRate === 'number') {
            acceptanceScore = driver.acceptanceRate <= 1.0
                ? Math.round(driver.acceptanceRate * 100)
                : Math.min(100, Math.round(driver.acceptanceRate));
        }

        // 4. FIFO Waiting / Anti-Starvation Queue Score (15% weight):
        // Captains waiting idle in the zone accumulate points (60 mins wait = 100 pts)
        const lastActive = driver.updatedAt ? new Date(driver.updatedAt).getTime() : Date.now();
        const minutesIdle = Math.max(0, (Date.now() - lastActive) / 60000);
        const idleScore = Math.min(100, (minutesIdle / 60) * 100);

        // 5. Tier Badge Honors (10% weight): Rookie (25), Star (50), Road Master (75), Elite (100)
        const badgeScore = Math.min(100, Math.max(0, badgePriority));

        // 6. Sacco Partner Affiliation (5% weight):
        const saccoScore = driver.saccoEnrolled ? 100 : 0;

        // 7. Penalty Deductions (e.g. captain cancellations in last 24h):
        const penaltyDeduction = 0;

        const weightedTotal =
            0.35 * distanceScore +
            0.20 * ratingScore +
            0.15 * acceptanceScore +
            0.15 * idleScore +
            0.10 * badgeScore +
            0.05 * saccoScore -
            penaltyDeduction;

        const fitnessScore = Math.max(0, Math.min(100, Math.round(weightedTotal * 10) / 10));

        return {
            fitnessScore,
            breakdown: {
                distanceScore: Math.round(distanceScore),
                ratingScore: Math.round(ratingScore),
                acceptanceScore: Math.round(acceptanceScore),
                idleScore: Math.round(idleScore),
                badgeScore: Math.round(badgeScore),
                saccoScore: Math.round(saccoScore),
                penaltyDeduction,
            },
        };
    }

    /**
     * Find nearby available drivers
     */
    async findNearbyDrivers(
        params: FindNearbyDriversParams
    ): Promise<DriverMatch[]> {
        const {
            pickupLat,
            pickupLng,
            vehicleType,
            maxDistanceKm = 5.0,
            maxDrivers = 10,
            useBadgePriority = false,
            maxDistancePenalty = 2.0, // Don't prioritize driver more than 2km away
        } = params;

        this.logger.log(
            `Finding drivers near (${pickupLat}, ${pickupLng}) within ${maxDistanceKm}km (badgePriority: ${useBadgePriority})`
        );

        // Normalize and resolve vehicle type (case-insensitive and map LITE to STANDARD)
        let resolvedVehicleType: VehicleType | undefined = undefined;
        if (vehicleType) {
            const normalized = String(vehicleType).toUpperCase().trim();
            if (normalized === 'LITE' || normalized === 'STANDARD') {
                resolvedVehicleType = VehicleType.STANDARD;
            } else if (normalized === 'PREMIUM') {
                resolvedVehicleType = VehicleType.PREMIUM;
            } else if (normalized === 'XL') {
                resolvedVehicleType = VehicleType.XL;
            } else if (normalized === 'BODA') {
                resolvedVehicleType = VehicleType.BODA;
            }
        }

        // Fetch all online drivers with badge status if needed
        const onlineDrivers = await this.prisma.driverProfile.findMany({
            where: {
                isOnline: true,
                currentLocation: { not: null },
                ...(resolvedVehicleType && {
                    OR: [
                        { vehicles: { type: resolvedVehicleType } },
                        { vehicleDrivers: { some: { vehicle: { type: resolvedVehicleType } } } },
                    ],
                }),
                ridesAsDriver: {
                    none: {
                        status: {
                            in: ['DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'MATCHING']
                        }
                    }
                },
                user: {
                    status: {
                        notIn: ['SUSPENDED', 'REJECTED']
                    }
                }
            },
            include: {
                vehicles: true,
                vehicleDrivers: {
                    include: {
                        vehicle: true,
                    },
                    take: 1,
                },
                user: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                ...(useBadgePriority && {
                    badgeStatus: {
                        where: { isActive: true },
                        orderBy: { earnedAt: 'desc' },
                        take: 1,
                    },
                }),
            },
        });

        this.logger.log(`Found ${onlineDrivers.length} online drivers`);

        // Calculate distances and filter by max distance
        const driversWithDistance: DriverMatch[] = [];
        let minDistance = Infinity;

        for (const driver of onlineDrivers) {
            if (!driver.currentLocation) continue;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const location = driver.currentLocation as any;
            if (!location.lat || !location.lng) continue;

            const distance = this.calculateDistance(
                pickupLat,
                pickupLng,
                location.lat,
                location.lng
            );

            if (distance <= maxDistanceKm) {
                minDistance = Math.min(minDistance, distance);

                // Get badge priority if enabled
                let badgePriority = 0;
                let badgeTier: BadgeTier | null = null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const badgeStatus = (driver as any).badgeStatus as any[];
                if (useBadgePriority && badgeStatus && badgeStatus.length > 0) {
                    const activeBadge = badgeStatus[0];
                    badgeTier = activeBadge.badgeTier as BadgeTier;
                    badgePriority = BADGE_TIER_WEIGHTS[badgeTier] || 0;
                }

                const estimatedArrivalMinutes = Math.ceil(
                    (distance / this.AVERAGE_SPEED_KMH) * 60
                );

                // Check if passenger is beyond the driver's preferred search radius (default 5.0 km)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const driverPreferredRadius = (driver as any).preferredRadiusKm || 5.0;
                const isExtendedPickup = distance > driverPreferredRadius;
                const extraPickupKm = isExtendedPickup ? Math.round((distance - driverPreferredRadius) * 10) / 10 : 0;
                const extendedPickupSubsidy = isExtendedPickup ? Math.round(extraPickupKm * 30) : 0;
                const activeVehicleType =
                    (driver as any).vehicles?.type ||
                    (driver as any).vehicleDrivers?.[0]?.vehicle?.type ||
                    VehicleType.STANDARD;

                // Multi-Factor Driver Selection Formula (35% Dist, 20% Rating, 15% Accept, 15% FIFO Idle, 10% Badge, 5% Sacco)
                const { fitnessScore, breakdown } = this.calculateDriverFitnessScore(
                    driver,
                    distance,
                    maxDistanceKm,
                    badgePriority
                );

                driversWithDistance.push({
                    driverId: driver.id,
                    distance,
                    estimatedArrivalMinutes,
                    rating: driver.averageRating,
                    vehicleType: activeVehicleType,
                    location: { lat: location.lat, lng: location.lng },
                    badgePriority,
                    badgeTier,
                    isExtendedPickup,
                    extraPickupKm,
                    extendedPickupSubsidy,
                    driverPreferredRadiusKm: driverPreferredRadius,
                    passengerConsentRequired: isExtendedPickup,
                    fitnessScore,
                    scoreBreakdown: breakdown,
                });
            }
        }

        if (driversWithDistance.length === 0) {
            return [];
        }

        // Sort candidates: prioritize multi-factor fitness score (highest fitness first)
        driversWithDistance.sort((a, b) => {
            const scoreDiff = (b.fitnessScore ?? 0) - (a.fitnessScore ?? 0);
            if (Math.abs(scoreDiff) > 0.1) {
                return scoreDiff;
            }
            // Tie-breaker: closest road distance
            return a.distance - b.distance;
        });

        // Return top N drivers
        const nearbyDrivers = driversWithDistance.slice(0, maxDrivers);

        if (nearbyDrivers.length > 0) {
            const top = nearbyDrivers[0];
            this.logger.log(
                `Top candidate driver ${top.driverId}: Fitness Score ${top.fitnessScore}/100 (Dist: ${top.distance}km, Rating: ${top.rating})`
            );
        }

        this.logger.log(
            `Found ${nearbyDrivers.length} drivers within ${maxDistanceKm}km`
        );

        return nearbyDrivers;
    }

    /**
     * Match a ride to the best available driver
     * Returns the driver ID if match is successful, null otherwise
     */
    async matchRideToDriver(
        rideId: string,
        options?: { useBadgePriority?: boolean; maxDistancePenalty?: number }
    ): Promise<string | null> {
        const useBadgePriority = options?.useBadgePriority ?? true;
        const maxDistancePenalty = options?.maxDistancePenalty ?? 2.0;

        const ride = await this.prisma.ride.findUnique({
            where: { id: rideId },
        });

        if (!ride) {
            this.logger.error(`Ride ${rideId} not found`);
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pickup = ride.pickupLocation as any;
        const pLat = pickup?.lat ?? pickup?.latitude;
        const pLng = pickup?.lng ?? pickup?.longitude;
        if (pLat === undefined || pLng === undefined) {
            this.logger.error(`Invalid pickup location for ride ${rideId}`);
            return null;
        }

        // Fetch passenger preferences
        const preferences = await this.prisma.ridePreference.findUnique({
            where: { userId: ride.passengerId }
        });

        const maxDistance = preferences?.maxDistanceKm || 5.0;
        const blockedDrivers = preferences?.blockedDriverIds || [];
        const favoriteDrivers = preferences?.favoriteDriverIds || [];

        // Find nearby drivers with badge priority if enabled
        const nearbyDrivers = await this.findNearbyDrivers({
            pickupLat: Number(pLat),
            pickupLng: Number(pLng),
            vehicleType: ride.requestedVehicleType || undefined,
            maxDistanceKm: maxDistance,
            maxDrivers: 15,
            useBadgePriority,
            maxDistancePenalty,
        });

        // Filter out blocked drivers and drivers who already passed on this ride
        const passedDriverIds: string[] = (ride as any).passedDriverIds || [];
        let candidateDrivers = nearbyDrivers.filter(
            d => !blockedDrivers.includes(d.driverId) && !passedDriverIds.includes(d.driverId)
        );

        if (candidateDrivers.length === 0) {
            this.logger.warn(`No valid candidate drivers found for ride ${rideId} (passed: ${passedDriverIds.length})`);
            return null;
        }

        // Fetch driver profiles for excludedZones and preferredDestination
        const driverProfiles = await this.prisma.driverProfile.findMany({
            where: { id: { in: candidateDrivers.map(d => d.driverId) } },
            select: { id: true, excludedZones: true, preferredDestination: true }
        });
        const profileMap = new Map(driverProfiles.map(p => [p.id, p]));

        // Check if dropoff location intersects with any driver's excluded zones
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dropoff = ride.dropoffLocation as any;
        if (dropoff && dropoff.lat && dropoff.lng) {
            candidateDrivers = candidateDrivers.filter(d => {
                const profile = profileMap.get(d.driverId);
                if (!profile || !profile.excludedZones) return true;
                const zones = Array.isArray(profile.excludedZones) ? profile.excludedZones : [];
                for (const zone of zones as any[]) {
                    if (zone.lat && zone.lng) {
                        const radiusKm = zone.radiusKm || 3.0;
                        const distToZone = this.calculateDistance(dropoff.lat, dropoff.lng, zone.lat, zone.lng);
                        if (distToZone <= radiusKm) {
                            this.logger.log(`Skipping driver ${d.driverId} for ride ${rideId}: dropoff in excluded zone "${zone.name || 'custom'}"`);
                            return false;
                        }
                    }
                }
                return true;
            });
        }

        if (candidateDrivers.length === 0) {
            this.logger.warn(`No drivers left for ride ${rideId} after excluded zone filtering`);
            return null;
        }

        // Prioritize: 1. Favorite, 2. Destination Mode match, 3. Badge priority, 4. Distance
        candidateDrivers.sort((a, b) => {
            const isAFav = favoriteDrivers.includes(a.driverId);
            const isBFav = favoriteDrivers.includes(b.driverId);

            if (isAFav && !isBFav) return -1;
            if (!isAFav && isBFav) return 1;

            // Destination mode prioritization
            const profA = profileMap.get(a.driverId);
            const profB = profileMap.get(b.driverId);
            const destA = profA?.preferredDestination as any;
            const destB = profB?.preferredDestination as any;
            const hasDestA = destA?.active && destA?.lat && destA?.lng;
            const hasDestB = destB?.active && destB?.lat && destB?.lng;

            if (dropoff && dropoff.lat && dropoff.lng) {
                if (hasDestA && !hasDestB) {
                    const distToDest = this.calculateDistance(dropoff.lat, dropoff.lng, destA.lat, destA.lng);
                    if (distToDest <= (destA.radiusKm || 5.0)) return -1;
                }
                if (hasDestB && !hasDestA) {
                    const distToDest = this.calculateDistance(dropoff.lat, dropoff.lng, destB.lat, destB.lng);
                    if (distToDest <= (destB.radiusKm || 5.0)) return 1;
                }
            }

            // If badge priority is enabled, sort by badge weight first
            if (useBadgePriority && a.badgePriority && b.badgePriority) {
                if (a.badgePriority !== b.badgePriority) {
                    return b.badgePriority - a.badgePriority;
                }
            }

            return a.distance - b.distance;
        });

        // Select best driver
        const bestDriver = candidateDrivers[0];

        this.logger.log(
            `Matched ride ${rideId} to driver ${bestDriver.driverId} (${bestDriver.distance}km away, badge: ${bestDriver.badgeTier || 'none'})`
        );

        return bestDriver.driverId;
    }

    /**
     * Broadcast ride request to nearby drivers via WebSocket
     * This will be implemented with the WebSocket gateway
     */
    async broadcastRideRequest(
        ride: any,
        driverIds: string[]
    ): Promise<void> {
        this.logger.log(
            `Broadcasting ride ${ride.id} to ${driverIds.length} drivers`
        );

        // Get passenger verification status
        const isVerified = Boolean(
            ride.isVerifiedPassenger ??
            ride.isVerified ??
            ride.passenger?.isVerifiedPassenger ??
            ride.passenger?.isIdentityVerified ??
            (ride.passengerVerificationStatus === 'VERIFIED')
        );
        const passengerVerificationStatus = isVerified ? 'VERIFIED' : (ride.passengerVerificationStatus || 'UNVERIFIED');

        // Determine passenger preferred public name
        const passenger = ride.passenger;
        const passengerPreferredName = passenger?.nickname ||
            (passenger?.fullName ? passenger.fullName.split(' ')[0] : 'Passenger');
        const passengerPhoto = passenger?.passportPhotoUrl || null;
        const destination = ride.dropoffLocation?.address || ride.dropoffAddress || 'Destination';
        const pickup = ride.pickupLocation?.address || ride.pickupAddress || 'Pickup Location';
        const fare = Number(ride.fare || 0);

        for (const driverId of driverIds) {
            // Include passenger preferred name, photo, destination, fare, and verification info
            this.tripTrackingGateway.broadcastRideRequest(driverId, {
                ...ride,
                passengerName: passengerPreferredName,
                passengerPhoto: passengerPhoto,
                destination,
                dropoffAddress: destination,
                pickupAddress: pickup,
                fare,
                amount: fare,
                passengerVerificationStatus,
                isVerifiedPassenger: isVerified,
                passengerWarning: isVerified 
                    ? null 
                    : 'This passenger is not verified. You may reject this ride if you have concerns.'
            });
        }
    }
}
