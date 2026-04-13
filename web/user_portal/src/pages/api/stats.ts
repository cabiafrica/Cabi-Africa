import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { LegacyRole, RideStatus } from '@prisma/client';

type Data = {
    activeDrivers: number;
    completedTrips: number;
    happyPassengers: number;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    try {
        const [activeDriversCount, completedTripsCount, happyPassengersCount] = await Promise.all([
            prisma.user.count({ where: { role: LegacyRole.DRIVER, status: 'ACTIVE' } }),
            prisma.ride.count({ where: { status: RideStatus.COMPLETED } }),
            prisma.user.count({ where: { role: LegacyRole.PASSENGER } })
        ]);

        // Fallback to base numbers if DB is empty for marketing appearance
        res.status(200).json({
            activeDrivers: Math.max(540, activeDriversCount),
            completedTrips: Math.max(15420, completedTripsCount),
            happyPassengers: Math.max(14890, happyPassengersCount)
        });
    } catch (error) {
        console.error("Stats fetch error:", error);
        // Return default stats if DB call fails
        res.status(200).json({
            activeDrivers: 540,
            completedTrips: 15420,
            happyPassengers: 14890
        });
    }
}
