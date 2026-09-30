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
}

export interface FindNearbyDriversParams {
    pickupLat: number;
    pickupLng: number;
    vehicleType?: VehicleType;
    maxDistanceKm?: number;
    maxDrivers?: number;
    useBadgePriority?: boolean; // Whether to use badge-based priority
    maxDistancePenalty?: number; // Max km penalty for prioritizing high-badge drivers
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
                    driver.vehicles?.type ||
                    driver.vehicleDrivers?.[0]?.vehicle?.type ||
                    VehicleType.STANDARD;

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
                });
            }
        }

        if (driversWithDistance.length === 0) {
            return [];
        }

        // Sort based on badge priority if enabled
        if (useBadgePriority) {
            driversWithDistance.sort((a, b) => {
                // If no badge priority difference, sort by distance
                if (!a.badgePriority || !b.badgePriority || a.badgePriority === b.badgePriority) {
                    return a.distance - b.distance;
                }

                // Apply distance penalty logic:
                // Only prioritize higher-badge driver if they're within maxDistancePenalty of the closest
                const distanceThreshold = minDistance + maxDistancePenalty;

                const aWithinThreshold = a.distance <= distanceThreshold;
                const bWithinThreshold = b.distance <= distanceThreshold;

                if (aWithinThreshold && bWithinThreshold) {
                    // Both within threshold - prioritize by badge, then distance
                    if (b.badgePriority !== a.badgePriority) {
                        return b.badgePriority - a.badgePriority;
                    }
                    return a.distance - b.distance;
                } else if (aWithinThreshold) {
                    return -1; // a is prioritized
                } else if (bWithinThreshold) {
                    return 1; // b is prioritized
                }

                // Default to distance-based
                return a.distance - b.distance;
            });
        } else {
            // Sort by distance (nearest first)
            driversWithDistance.sort((a, b) => a.distance - b.distance);
        }

        // Return top N drivers
        const nearbyDrivers = driversWithDistance.slice(0, maxDrivers);

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
        const useBadgePriority = options?.useBadgePriority ?? false;
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
