import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id, driverId } = req.query;

    if (typeof id !== 'string' || typeof driverId !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid vehicle ID or driver ID' });
    }

    try {
        const assignment = await prisma.vehicleDriver.findFirst({
            where: {
                vehicleId: id,
                driverProfileId: driverId,
                isActive: true
            }
        });

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Active driver assignment not found' });
        }

        const removed = await prisma.vehicleDriver.update({
            where: { id: assignment.id },
            data: {
                isActive: false,
                removedAt: new Date()
            }
        });

        return res.status(200).json({ success: true, message: 'Driver unassigned successfully', assignment: removed });

    } catch (error: any) {
        console.error('Error unassigning driver:', error);
        return res.status(500).json({ success: false, message: 'Internal server error unassigning driver', error: error.message });
    }
}
