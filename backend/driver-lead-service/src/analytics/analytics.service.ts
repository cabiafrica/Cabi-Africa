import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getBIStats() {
        // In a real scenario, this would aggregate data from 'Ride', 'User', 'DriverProfile' tables.
        // Since 'Ride' table might be in dispatch-service or replicated, we check local schema.
        // The Schema has 'Ride' model.

        // Total gross bookings (sum of ride fares)
        const rides = await this.prisma.ride.aggregate({
            _sum: {
                fare: true,
            },
            _count: {
                id: true,
            },
            where: {
                status: 'COMPLETED'
            }
        });

        // New Users (Total Passengers)
        const newUsers = await this.prisma.user.count({
            where: { role: 'PASSENGER' }
        });

        // Active Drivers (Online)
        const activeDrivers = await this.prisma.driverProfile.count({
            where: { isOnline: true }
        });

        // Avg Rating
        // Schema doesn't currently have a rating field on DriverProfile. 
        // Returning 0 until schema is updated.
        const avgRating = 0;

        return {
            grossBookings: rides._sum.fare || 0,
            trips: rides._count.id || 0,
            newUsers: newUsers || 0,
            activeDrivers: activeDrivers || 0,
            avgRating: avgRating
        };
    }

    async getCityKPIs(cityId: string) {
        // Mocking city logic since we don't have City entities linking everything yet.
        return {
            activeDrivers: await this.prisma.driverProfile.count({ where: { isOnline: true } }),
            totalTrips: await this.prisma.ride.count(),
            avgSurge: 1.0,
            complaints: 0
        };
    }

    async getHeatMapData(type: 'DEMAND' | 'SUPPLY') {
        if (type === 'SUPPLY') {
            const drivers = await this.prisma.driverProfile.findMany({
                where: {
                    isOnline: true,
                    currentLocation: { not: undefined }
                },
                select: { currentLocation: true }
            });

            return drivers.map(d => {
                const loc = d.currentLocation as any; // { lat, lng }
                if (!loc || !loc.lat) return null;
                return { lat: loc.lat, lng: loc.lng, intensity: 1 };
            }).filter((item): item is { lat: any; lng: any; intensity: number } => item !== null);
        }

        // For Demand: Recent Ride Requests.
        const rides = await this.prisma.ride.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            select: { pickupLocation: true }
        });

        return rides.map(r => {
            const loc = r.pickupLocation as any;
            if (!loc || !loc.lat) return null;
            return { lat: loc.lat, lng: loc.lng, intensity: 1 };
        }).filter((item): item is { lat: any; lng: any; intensity: number } => item !== null);
    }
}
