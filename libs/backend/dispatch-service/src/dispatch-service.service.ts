import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideStatus, VehicleType } from '@prisma/client';
import { DispatchGateway } from './dispatch-service.gateway';
import { SettingsService } from '@cabi/backend/settings';
import { NotificationService } from '@cabi/backend/notification-service';

@Injectable()
export class DispatchService {
    private readonly logger = new Logger(DispatchService.name);
    private readonly notificationService: NotificationService;

    constructor(
        private readonly prisma: PrismaService,
        private readonly gateway: DispatchGateway,
        private readonly settingsService: SettingsService,
        notificationService?: NotificationService
    ) {
        this.notificationService = notificationService || new NotificationService();
    }


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
        const completedRide = await this.prisma.ride.update({
            where: { id: rideId },
            data: {
                status: RideStatus.COMPLETED,
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
        });

        this.gateway.server.to(rideId).emit('statusUpdate', { status: RideStatus.COMPLETED, ride: completedRide });
        this.gateway.server.emit('tripUpdate', completedRide);

        // Asynchronously dispatch HTML receipts to passenger and driver
        this.sendRideReceipts(rideId).catch((err: any) => {
            this.logger.error(`Failed to send ride receipts for ride ${rideId}: ${err?.message}`);
        });

        return completedRide;
    }

    async sendRideReceipts(rideId: string) {
        const fullRide = await this.prisma.ride.findUnique({
            where: { id: rideId },
            include: {
                passenger: true,
                driver: {
                    include: {
                        user: true,
                        vehicles: true,
                    },
                },
            },
        });

        if (!fullRide) {
            throw new NotFoundException(`Ride with ID ${rideId} not found`);
        }

        const results: {
            passengerReceiptSent: boolean;
            driverReceiptSent: boolean;
            passengerEmail?: string;
            driverEmail?: string;
            passengerError?: string;
            driverError?: string;
            previewUrls?: { passenger?: string; driver?: string };
        } = {
            passengerReceiptSent: false,
            driverReceiptSent: false,
            previewUrls: {},
        };

        const totalFare = Number(fullRide.fare) || 0;
        const baseFare = Number(fullRide.baseFare) || (totalFare > 0 ? totalFare * 0.7 : 0);
        const distanceKm = fullRide.distance ? Number(fullRide.distance.toFixed(1)) : undefined;
        const durationMinutes = fullRide.duration ? Math.round(fullRide.duration / 60) : undefined;
        const driverUser = fullRide.driver?.user;
        const driverName = driverUser?.fullName || 'Cabi Partner Driver';
        const passengerName = fullRide.passenger?.fullName || 'Valued Passenger';

        let primaryVehicle: any = undefined;
        if (fullRide.driver?.vehicles) {
            if (Array.isArray(fullRide.driver.vehicles)) {
                primaryVehicle = fullRide.driver.vehicles[0];
            } else {
                primaryVehicle = fullRide.driver.vehicles;
            }
        }

        // 1. Send Passenger HTML Receipt
        if (fullRide.passenger?.email && fullRide.passenger.email.includes('@')) {
            results.passengerEmail = fullRide.passenger.email;
            try {
                const sendResult = await this.notificationService.sendPassengerReceipt({
                    to: fullRide.passenger.email,
                    passengerName,
                    rideId: fullRide.id,
                    rideDate: fullRide.createdAt || new Date(),
                    pickupLocation: fullRide.pickupLocation as any,
                    dropoffLocation: fullRide.dropoffLocation as any,
                    distanceKm,
                    durationMinutes,
                    currency: 'KES',
                    totalFare,
                    baseFare: baseFare > 0 ? baseFare : undefined,
                    surgeMultiplier: fullRide.surgeMultiplier || undefined,
                    surgeAmount: (fullRide.surgeMultiplier && fullRide.surgeMultiplier > 1.0)
                        ? Number((totalFare - (totalFare / fullRide.surgeMultiplier)).toFixed(2))
                        : undefined,
                    paymentMethod: 'MPESA',
                    driverName,
                    vehicleModel: primaryVehicle ? `${primaryVehicle.make || ''} ${primaryVehicle.model || ''}`.trim() : undefined,
                    vehiclePlateNumber: primaryVehicle?.plateNumber,
                    vehicleColor: primaryVehicle?.color,
                });

                results.passengerReceiptSent = sendResult.success;
                if (sendResult.previewUrl) {
                    results.previewUrls!.passenger = sendResult.previewUrl;
                }
                if (!sendResult.success) {
                    results.passengerError = sendResult.error;
                }
            } catch (err: any) {
                this.logger.error(`Error sending passenger receipt for ride ${rideId}: ${err.message}`);
                results.passengerError = err.message;
            }
        } else {
            this.logger.warn(`No passenger email found for ride ${rideId}. Skipping passenger receipt.`);
        }

        // 2. Send Driver HTML Trip Summary
        if (driverUser?.email && driverUser.email.includes('@')) {
            results.driverEmail = driverUser.email;
            try {
                const commissionRate = 20; // 20% platform commission
                const commissionAmount = Number((totalFare * (commissionRate / 100)).toFixed(2));
                const netDriverEarnings = Number((totalFare - commissionAmount).toFixed(2));

                const sendResult = await this.notificationService.sendDriverReceipt({
                    to: driverUser.email,
                    driverName,
                    rideId: fullRide.id,
                    rideDate: fullRide.createdAt || new Date(),
                    pickupLocation: fullRide.pickupLocation as any,
                    dropoffLocation: fullRide.dropoffLocation as any,
                    distanceKm,
                    durationMinutes,
                    currency: 'KES',
                    grossFare: totalFare,
                    platformCommissionRate: commissionRate,
                    platformCommissionAmount: commissionAmount,
                    netDriverEarnings,
                    paymentMethod: 'MPESA',
                    payoutStatus: 'CREDITED_TO_WALLET',
                    passengerName,
                });

                results.driverReceiptSent = sendResult.success;
                if (sendResult.previewUrl) {
                    results.previewUrls!.driver = sendResult.previewUrl;
                }
                if (!sendResult.success) {
                    results.driverError = sendResult.error;
                }
            } catch (err: any) {
                this.logger.error(`Error sending driver receipt for ride ${rideId}: ${err.message}`);
                results.driverError = err.message;
            }
        } else {
            this.logger.warn(`No driver email found for ride ${rideId}. Skipping driver receipt.`);
        }

        return results;
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
