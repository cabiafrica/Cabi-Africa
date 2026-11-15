import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const userId = String(req.query.userId || '');
    const role = String(req.query.role || '').toUpperCase();

    if (!userId) {
        return res.status(200).json(null);
    }

    try {
        const activeStatuses = ['REQUESTED', 'MATCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS'] as any[];
        const whereClause =
            role === 'DRIVER'
                ? {
                      OR: [{ driverId: userId }, { driver: { userId } }],
                      status: { in: activeStatuses },
                  }
                : {
                      passengerId: userId,
                      status: { in: activeStatuses },
                  };

        const ride = await prisma.ride.findFirst({
            where: whereClause,
            include: {
                passenger: {
                    select: { id: true, fullName: true, phone: true },
                },
                driver: {
                    include: {
                        user: { select: { id: true, fullName: true, phone: true } },
                        vehicles: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json(ride || null);
    } catch (error) {
        console.error('rides/current error:', error);
        return res.status(200).json(null);
    }
}
