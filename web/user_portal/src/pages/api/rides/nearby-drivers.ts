import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const drivers = await prisma.driverProfile.findMany({
            where: { isOnline: true },
            include: {
                user: { select: { id: true, fullName: true, phone: true } },
                vehicles: true,
            },
            take: 25,
        });

        const formatted = drivers.map((d) => {
            const loc = (d.currentLocation as any) || {};
            return {
                id: d.id,
                userId: d.userId,
                name: d.user?.fullName || 'Cabi Driver',
                lat: Number(loc.lat ?? loc.latitude ?? -1.2921),
                lng: Number(loc.lng ?? loc.longitude ?? 36.8219),
                vehicleType: d.vehicles?.type || 'STANDARD',
                plateNumber: d.vehicles?.plateNumber || '',
                rating: d.averageRating ?? 4.9,
            };
        });

        return res.status(200).json({ data: formatted });
    } catch (error) {
        console.error('nearby-drivers error:', error);
        return res.status(200).json({ data: [] });
    }
}
