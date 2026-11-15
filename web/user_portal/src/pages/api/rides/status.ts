import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { passengerId, rideId } = req.query;

    if (!passengerId && !rideId) {
        return res.status(400).json({ message: 'Missing passengerId or rideId' });
    }

    try {
        const whereClause: Record<string, unknown> = rideId
            ? { id: rideId as string }
            : {
                  passengerId: passengerId as string,
                  status: {
                      in: ['REQUESTED', 'MATCHING', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'IN_PROGRESS'],
                  },
              };

        const ride = await prisma.ride.findFirst({
            where: whereClause,
            include: {
                driver: {
                    include: {
                        user: true,
                        vehicles: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!ride) {
            return res.status(404).json({ message: 'No active ride found' });
        }

        const tripCode = (ride as any).tripCode || (ride.pickupLocation as any)?.tripCode || ride.id;
        return res.status(200).json({ ...ride, tripCode });
    } catch (error) {
        console.error('Fetch ride status error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
