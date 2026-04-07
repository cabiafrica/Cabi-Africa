import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { passengerId } = req.query;

    if (!passengerId) {
        return res.status(400).json({ message: 'Missing passengerId' });
    }

    try {
        const ride = await prisma.ride.findFirst({
            where: {
                passengerId: passengerId as string,
                status: {
                    in: ['REQUESTED', 'DRIVER_ASSIGNED', 'IN_PROGRESS']
                }
            },
            include: {
                driver: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!ride) {
            return res.status(404).json({ message: 'No active ride found' });
        }

        return res.status(200).json(ride);
    } catch (error) {
        console.error('Fetch ride status error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
