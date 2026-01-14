import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { plateNumber, logbookNumber } = req.query;

    if (!plateNumber && !logbookNumber) {
        return res.status(400).json({ message: 'Please provide a license plate or logbook number' });
    }

    try {
        const existingVehicle = await prisma.vehicle.findFirst({
            where: {
                OR: [
                    plateNumber ? { plateNumber: { equals: plateNumber as string, mode: 'insensitive' } } : {},
                    logbookNumber ? { logbookNumber: { equals: logbookNumber as string, mode: 'insensitive' } } : {},
                ]
            },
            select: {
                id: true,
                plateNumber: true,
                logbookNumber: true,
                make: true,
                model: true
            }
        });

        if (existingVehicle) {
            return res.status(200).json({
                exists: true,
                vehicle: existingVehicle,
                message: 'Vehicle already registered'
            });
        }

        return res.status(200).json({
            exists: false,
            message: 'Vehicle not found, available for registration'
        });

    } catch (error: any) {
        console.error('Vehicle check error:', error);
        return res.status(500).json({ message: 'Internal server error checking vehicle' });
    }
}
