import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { shiftId, vehicleId, driverProfileId } = req.body;

    try {
        let activeShift = null;

        if (shiftId) {
            activeShift = await prisma.vehicleShift.findUnique({
                where: { id: shiftId }
            });
        } else if (vehicleId && driverProfileId) {
            activeShift = await prisma.vehicleShift.findFirst({
                where: {
                    vehicleId,
                    driverProfileId,
                    status: 'ACTIVE'
                }
            });
        }

        if (!activeShift || activeShift.status !== 'ACTIVE') {
            return res.status(404).json({ success: false, message: 'Active shift not found' });
        }

        const endedShift = await prisma.vehicleShift.update({
            where: { id: activeShift.id },
            data: {
                status: 'ENDED',
                endedAt: new Date()
            },
            include: {
                vehicle: true,
                driver: {
                    include: { user: { select: { fullName: true } } }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Shift ended successfully',
            shift: endedShift
        });

    } catch (error: any) {
        console.error('Error ending shift:', error);
        return res.status(500).json({ success: false, message: 'Internal server error ending shift', error: error.message });
    }
}
