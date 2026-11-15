import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideStatus, VehicleType, ShiftStatus, ClaimStatus } from '@prisma/client';

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
        const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
        const [activeRides, pendingRequests, onlineDrivers, completedTodayRides] = await Promise.all([
            this.prisma.ride.count({ where: { status: RideStatus.IN_PROGRESS } }),
            this.prisma.ride.count({ where: { status: RideStatus.REQUESTED } }),
            this.prisma.driverProfile.count({ where: { isOnline: true } }),
            this.prisma.ride.findMany({
                where: {
                    status: RideStatus.COMPLETED,
                    updatedAt: { gte: startOfToday },
                },
                select: {
                    fare: true,
                    matchingDurationMs: true,
                },
            }),
        ]);

        const completedToday = completedTodayRides.length;
        const revenue = completedTodayRides.reduce((sum, r) => sum + Number(r.fare ?? 0), 0);
        const matchedRides = completedTodayRides.filter((r) => typeof r.matchingDurationMs === 'number' && r.matchingDurationMs > 0);
        const averageMatchTime =
            matchedRides.length > 0
                ? Number((matchedRides.reduce((sum, r) => sum + (r.matchingDurationMs ?? 0) / 1000, 0) / matchedRides.length).toFixed(1))
                : 0;

        return {
            activeRides,
            pendingRequests,
            onlineDrivers,
            completedToday,
            revenue,
            averageWaitTime: 0,
            averageMatchTime,
            peakDemandZones: [],
            surgeAreas: 0,
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
            status: { in: [RideStatus.REQUESTED, RideStatus.MATCHING, RideStatus.DRIVER_ASSIGNED, RideStatus.DRIVER_ARRIVED, RideStatus.IN_PROGRESS] }
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

    // ── Vehicle Account Management ──────────────────────────────────────────

    async getVehicles() {
        return (this.prisma as any).vehicle.findMany({
            include: {
                driver_profiles: { select: { id: true, isOnline: true, user: { select: { fullName: true, phone: true } } } },
                vehicleDrivers: {
                    where: { isActive: true },
                    include: { driver: { select: { id: true, user: { select: { fullName: true } } } } },
                },
                vehicleShifts: {
                    where: { status: ShiftStatus.ACTIVE },
                    take: 1,
                    orderBy: { startedAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getVehicleAccount(vehicleId: string) {
        const vehicle = await (this.prisma as any).vehicle.findUnique({
            where: { id: vehicleId },
            include: {
                driver_profiles: { select: { id: true, totalRidesCompleted: true, isOnline: true, user: { select: { fullName: true, phone: true, passportPhotoUrl: true } } } },
                vehicleDrivers: {
                    where: { isActive: true },
                    include: { driver: { select: { id: true, totalRidesCompleted: true, user: { select: { fullName: true } } } } },
                },
                vehicleShifts: {
                    orderBy: { startedAt: 'desc' },
                    take: 10,
                },
                benefitClaims: {
                    include: { benefit: true },
                    orderBy: { reportedAt: 'desc' },
                },
            },
        });

        if (!vehicle) throw new NotFoundException(`Vehicle ${vehicleId} not found`);

        // Aggregate trip stats from rides
        const rides = await this.prisma.ride.findMany({
            where: { driverId: vehicle.driverProfileId ?? undefined, status: RideStatus.COMPLETED },
            select: { fare: true, distance: true, createdAt: true },
        });

        const totalTrips = rides.length;
        const totalRevenue = rides.reduce((sum, r) => sum + Number(r.fare ?? 0), 0);
        const totalDistanceKm = rides.reduce((sum, r) => sum + Number(r.distance ?? 0), 0);

        const approvedClaims = vehicle.benefitClaims.filter((c: any) => c.status === ClaimStatus.APPROVED);
        const pendingClaims = vehicle.benefitClaims.filter((c: any) => c.status === ClaimStatus.PENDING);

        return {
            ...vehicle,
            stats: {
                totalTrips,
                totalRevenue,
                totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
                approvedClaimsCount: approvedClaims.length,
                pendingClaimsCount: pendingClaims.length,
            },
        };
    }

    async claimVehicleIncentive(vehicleId: string, data: { benefitId: string; driverProfileId: string; notes?: string; evidenceUrl?: string }) {
        // Prevent duplicate pending claims
        const existing = await (this.prisma as any).vehicleBenefitClaim.findFirst({
            where: { vehicleId, benefitId: data.benefitId, status: ClaimStatus.PENDING },
        });

        if (existing) {
            return { message: 'A pending claim already exists for this benefit.', claim: existing };
        }

        const claim = await (this.prisma as any).vehicleBenefitClaim.create({
            data: {
                vehicleId,
                benefitId: data.benefitId,
                reportedByDriverId: data.driverProfileId,
                notes: data.notes ?? null,
                evidenceUrl: data.evidenceUrl ?? null,
                status: ClaimStatus.PENDING,
            },
            include: { benefit: true },
        });

        return { message: 'Incentive claim submitted successfully.', claim };
    }
}
