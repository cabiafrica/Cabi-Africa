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

        // Fetch all online drivers with badge status if needed
        const onlineDrivers = await this.prisma.driverProfile.findMany({
            where: {
                isOnline: true,
                currentLocation: { not: null },
                ...(vehicleType && {
                    vehicle: {
                        type: vehicleType,
                    },
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
                vehicle: true,
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
                const badgeStatus = driver.badgeStatus as any[];
                if (useBadgePriority && badgeStatus && badgeStatus.length > 0) {
                    const activeBadge = badgeStatus[0];
                    badgeTier = activeBadge.badgeTier as BadgeTier;
                    badgePriority = BADGE_TIER_WEIGHTS[badgeTier] || 0;
                }

                const estimatedArrivalMinutes = Math.ceil(
                    (distance / this.AVERAGE_SPEED_KMH) * 60
                );

                driversWithDistance.push({
                    driverId: driver.id,
                    distance,
                    estimatedArrivalMinutes,
                    rating: driver.averageRating,
                    vehicleType: driver.vehicle?.type || VehicleType.STANDARD,
                    location: { lat: location.lat, lng: location.lng },
                    badgePriority,
                    badgeTier,
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

        const pickup = ride.pickupLocation as any;
        if (!pickup.lat || !pickup.lng) {
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
            pickupLat: pickup.lat,
            pickupLng: pickup.lng,
            vehicleType: ride.requestedVehicleType || undefined,
            maxDistanceKm: maxDistance,
            maxDrivers: 10,
            useBadgePriority,
            maxDistancePenalty,
        });

        // Filter out blocked drivers
        let validDrivers = nearbyDrivers.filter(d => !blockedDrivers.includes(d.driverId));

        if (validDrivers.length === 0) {
            this.logger.warn(`No valid drivers found for ride ${rideId} (after filtering blocked)`);
            return null;
        }

        // Prioritize favorite drivers, then badge priority
        validDrivers.sort((a, b) => {
            const isAFav = favoriteDrivers.includes(a.driverId);
            const isBFav = favoriteDrivers.includes(b.driverId);

            if (isAFav && !isBFav) return -1;
            if (!isAFav && isBFav) return 1;

            // If badge priority is enabled, sort by badge weight first
            if (useBadgePriority && a.badgePriority && b.badgePriority) {
                if (a.badgePriority !== b.badgePriority) {
                    return b.badgePriority - a.badgePriority;
                }
            }

            return a.distance - b.distance;
        });

        // Select best driver
        const bestDriver = validDrivers[0];

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

        for (const driverId of driverIds) {
            this.tripTrackingGateway.broadcastRideRequest(driverId, ride);
        }
    }
}
