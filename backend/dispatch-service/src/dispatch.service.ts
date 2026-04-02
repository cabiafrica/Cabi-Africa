import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideStatus, VehicleType } from '@prisma/client';

@Injectable()
export class DispatchService {
    constructor(private prisma: PrismaService) { }

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
            revenue: 0, // Calculate from fares or remove if complex
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

    async assignDriver(rideId: string, driverId: string) {
        return this.prisma.ride.update({
            where: { id: rideId },
            data: {
                driverId,
                status: RideStatus.DRIVER_ASSIGNED,
            },
        });
    }

    async createRide(data: any) {
        return this.prisma.ride.create({
            data: {
                passengerId: data.passengerId,
                pickupLocation: data.pickupLocation,
                dropoffLocation: data.dropoffLocation,
                fare: data.fare,
                distance: data.distance,
                status: RideStatus.REQUESTED,
            },
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
