import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideStatus, VehicleType } from '@prisma/client';

@Injectable()
export class DispatchService {
    constructor(private readonly prisma: PrismaService) { }

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
        if (!rideRequest.pickup || !rideRequest.dropoff || !rideRequest.passengerId) {
            throw new Error('Invalid ride request: Missing pickup, dropoff, or passengerId');
        }

        return await this.prisma.ride.create({
            data: {
                passengerId: rideRequest.passengerId,
                pickupLocation: rideRequest.pickup,
                dropoffLocation: rideRequest.dropoff,
                status: RideStatus.REQUESTED,
                fare: rideRequest.fare || 0,
                distance: rideRequest.distance || 0,
            },
        });
    }

    async acceptRide(rideId: string, driverId: string) {
        return await this.prisma.ride.update({
            where: { id: rideId },
            data: {
                driverId: driverId,
                status: RideStatus.DRIVER_ASSIGNED,
            },
        });
    }

    async updateRideStatus(rideId: string, status: string) {
        return await this.prisma.ride.update({
            where: { id: rideId },
            data: {
                status: status as RideStatus,
            },
        });
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
