import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const activeRides = await prisma.ride.findMany({
            where: {
                status: { in: ['REQUESTED', 'MATCHING'] as any[] },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const hotspots = activeRides
            .map((r) => {
                const pickup = (r.pickupLocation as any) || {};
                const lat = Number(pickup.lat ?? pickup.latitude);
                const lng = Number(pickup.lng ?? pickup.longitude);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
                return {
                    id: r.id,
                    name: pickup.address || 'Active Ride Demand',
                    lat,
                    lng,
                    intensity: 1.0,
                };
            })
            .filter(Boolean);

        return res.status(200).json({ data: hotspots });
    } catch {
        return res.status(200).json({ data: [] });
    }
}
