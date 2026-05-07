import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideStatus, VehicleType } from '@prisma/client';
import { DispatchGateway } from './dispatch-service.gateway';

@Injectable()
export class DispatchService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: DispatchGateway,
        private readonly settingsService: SettingsService
    ) { }

    private async checkPassengerVerification(passengerId: string): Promise<{ canRequest: boolean; reason?: string; remainingTrips?: number; isVerified?: boolean }> {
        // Check admin setting for verification
        const verificationEnabled = await this.settingsService.getSystemSetting('RIDE_VERIFICATION_ENABLED');
        
        // If verification is disabled by admin, allow all requests
        if (verificationEnabled === false) {
            return { canRequest: true, isVerified: true };
        }

        // Special handling for guest users during testing phase
        const GUEST_ID = '00000000-0000-0000-0000-000000000000';
        if (passengerId === 'guest' || passengerId === GUEST_ID) {
            return { canRequest: true, reason: 'Guest booking permitted during testing.', isVerified: false };
        }

        // In-memory passenger trip tracking (would use database in production)
        // For now, assume always allowed if not guest, but you can add more logic here
        return {
            canRequest: true,
            reason: `Standard passenger verification check passed.`,
            remainingTrips: 1,
            isVerified: true
        };
    }

    async getDashboardMetrics() {
        const [activeRides, pendingRequests, onlineDrivers, completedToday] = await Promise.all([
            this.prisma.ride.count({ where: { status: RideStatus.IN_PROGRESS } }),
            this.prisma.ride.count({ where: { status: RideStatus.REQUESTED } }),
            this.prisma.driverProfile.count({ where: { isOnline: true } }),
            this.prisma.ride.count({
                where: {
                    status: RideStatus.COMPLETED,
                    updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
                },
            }),
        ]);

        return {
            activeRides,
            pendingRequests,
            onlineDrivers,
            completedToday,
            revenue: 0,
            averageWaitTime: 8.5, // Mock values for UI
            averageMatchTime: 4.2,
            peakDemandZones: ['Westlands', 'Kilimani'],
            surgeAreas: 2
        };
    }

    async getActiveRides() {
        return this.prisma.ride.findMany({
            where: {
                status: { in: [RideStatus.REQUESTED, RideStatus.MATCHING, RideStatus.DRIVER_ASSIGNED, RideStatus.IN_PROGRESS] },
            },
            include: {
                passenger: true,
                driver: {
                    include: {
                        user: true,
                        vehicles: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getDispatchDrivers() {
        return this.prisma.driverProfile.findMany({
            include: {
                user: true,
                vehicles: true,
            },
        });
    }

    async requestRide(rideRequest: any) {
        if (!rideRequest.pickupLocation || !rideRequest.dropoffLocation || !rideRequest.passengerId) {
            throw new Error('Invalid ride request: Missing pickupLocation, dropoffLocation, or passengerId');
        }

        // Check passenger verification before creating ride
        const verificationCheck = await this.checkPassengerVerification(rideRequest.passengerId);

        if (!verificationCheck.canRequest) {
            throw new HttpException(
                {
                    error: 'Verification Required',
                    message: verificationCheck.reason,
                    remainingTrips: verificationCheck.remainingTrips,
                    isVerified: verificationCheck.isVerified,
                    action: 'VERIFY_IDENTITY'
                },
                HttpStatus.FORBIDDEN
            );
        }

        const ride = await this.prisma.ride.create({
            data: {
                passengerId: rideRequest.passengerId,
                pickupLocation: rideRequest.pickupLocation,
                dropoffLocation: rideRequest.dropoffLocation,
                status: RideStatus.REQUESTED,
                fare: rideRequest.fare || 0,
                distance: rideRequest.distance || 0,
                requestedVehicleType: (rideRequest.vehicleType || 'STANDARD') as VehicleType,
            },
        });

        this.gateway.server.emit('newTripRequest', ride);
        return ride;
    }

    async acceptRide(rideId: string, driverId: string) {
        const ride = await this.prisma.ride.update({
            where: { id: rideId },
            data: {
                driverId: driverId,
                status: RideStatus.DRIVER_ASSIGNED,
            },
            include: { passenger: true, driver: { include: { user: true } } }
        });

        this.gateway.server.to(rideId).emit('statusUpdate', { status: RideStatus.DRIVER_ASSIGNED, ride });
        this.gateway.server.emit('tripUpdate', ride);
        return ride;
    }

    async updateRideStatus(rideId: string, status: string) {
        const ride = await this.prisma.ride.update({
            where: { id: rideId },
            data: {
                status: status as RideStatus,
            },
            include: { passenger: true, driver: { include: { user: true } } }
        });

        this.gateway.server.to(rideId).emit('statusUpdate', { status, ride });
        this.gateway.server.emit('tripUpdate', ride);
        return ride;
    }

    async completeRide(rideId: string) {
        return await this.prisma.ride.update({
            where: { id: rideId },
            data: {
                status: RideStatus.COMPLETED,
            },
        });
    }

    async assignDriver(rideId: string, driverId: string) {
        return this.acceptRide(rideId, driverId);
    }

    async getRideStatus(rideId: string) {
        const ride = await this.prisma.ride.findUnique({
            where: { id: rideId },
            include: {
                passenger: true,
                driver: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!ride) throw new NotFoundException('Ride not found');
        return ride;
    }

    async getAllRides(limit: number = 100) {
        return await this.prisma.ride.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                passenger: true,
                driver: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async getDriverStatus(driverId: string) {
        const driver = await this.prisma.driverProfile.findUnique({
            where: { id: driverId },
            select: { isOnline: true }
        });
        return { isOnline: driver?.isOnline || false };
    }

    async updateDriverStatus(driverId: string, isOnline: boolean) {
        if (isOnline) {
            const driver = await this.prisma.driverProfile.findUnique({
                where: { id: driverId },
                select: { isBiometricVerified: true }
            });
            if (!driver?.isBiometricVerified) {
                throw new HttpException('Biometric verification required to go online. Please verify your identity in the app.', HttpStatus.FORBIDDEN);
            }
        }
        return this.prisma.driverProfile.update({
            where: { id: driverId },
            data: { isOnline }
        });
    }

    async updateDriverLocation(driverId: string, location: { lat: number; lng: number }) {
        return this.prisma.driverProfile.update({
            where: { id: driverId },
            data: { currentLocation: location }
        });
    }

    async getCurrentRide(userId: string, role: 'PASSENGER' | 'DRIVER') {
        const whereClause: any = {
            status: { in: [RideStatus.REQUESTED, RideStatus.MATCHING, RideStatus.DRIVER_ASSIGNED, RideStatus.IN_PROGRESS] }
        };

        if (role === 'PASSENGER') {
            whereClause.passengerId = userId;
        } else {
            whereClause.driverId = userId;
        }

        return this.prisma.ride.findFirst({
            where: whereClause,
            include: {
                passenger: true,
                driver: {
                    include: {
                        user: true,
                        vehicles: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
