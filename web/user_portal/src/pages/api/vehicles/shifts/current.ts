import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { vehicleId, driverProfileId } = req.query;

    if (!vehicleId && !driverProfileId) {
        return res.status(400).json({ success: false, message: 'Please provide vehicleId or driverProfileId' });
    }

    try {
        const whereClause: any = { status: 'ACTIVE' };

        if (vehicleId) whereClause.vehicleId = vehicleId as string;
        if (driverProfileId) whereClause.driverProfileId = driverProfileId as string;

        const currentShift = await prisma.vehicleShift.findFirst({
            where: whereClause,
            include: {
                vehicle: {
                    select: { id: true, plateNumber: true, make: true, model: true, color: true }
                },
                driver: {
                    include: {
                        user: { select: { fullName: true, phone: true } }
                    }
                }
            }
        });

        if (!currentShift) {
            return res.status(200).json({ success: true, active: false, shift: null });
        }

        return res.status(200).json({ success: true, active: true, shift: currentShift });

    } catch (error: any) {
        console.error('Error fetching current shift:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}
