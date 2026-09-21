import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideStatus, VehicleType } from '@prisma/client';

// Safe user fields for dispatch panel (excludes sensitive auth fields)
const SAFE_PASSENGER_SELECT = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  passportPhotoUrl: true,
  averageRating: true,
  isVerifiedPassenger: true,
  isIdentityVerified: true,
  status: true,
  role: true,
};

const SAFE_DRIVER_USER_SELECT = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  passportPhotoUrl: true,
  averageRating: true,
  status: true,
  role: true,
};

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

        const averageWaitTime = 8.5;
        const averageMatchTime = 4.2;

        return {
            activeRides,
            pendingRequests,
            onlineDrivers,
            completedToday,
            revenue: 0,
            averageWaitTime,
            averageMatchTime,
            peakDemandZones: ['Westlands', 'Kilimani'],
            surgeAreas: 2,
        };
    }

    async getActiveRides() {
        return this.prisma.ride.findMany({
            where: {
                status: { in: [RideStatus.REQUESTED, RideStatus.MATCHING, RideStatus.DRIVER_ASSIGNED, RideStatus.IN_PROGRESS] },
            },
            include: {
                passenger: { select: SAFE_PASSENGER_SELECT },
                driver: {
                    include: {
                        user: { select: SAFE_DRIVER_USER_SELECT },
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
                user: { select: SAFE_DRIVER_USER_SELECT },
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
                distance: data.distance || 0,
                status: RideStatus.REQUESTED,
                requestedVehicleType: data.vehicleType || VehicleType.STANDARD,
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
                passenger: { select: SAFE_PASSENGER_SELECT },
                driver: {
                    include: {
                        user: { select: SAFE_DRIVER_USER_SELECT },
                        vehicles: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
