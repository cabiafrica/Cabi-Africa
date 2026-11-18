import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { vehicleId, plateNumber } = req.body ?? {};
    if (!vehicleId && !plateNumber) {
        return res.status(400).json({ message: 'vehicleId or plateNumber is required.' });
    }

    try {
        const vehicle = await prisma.vehicle.findFirst({
            where: vehicleId
                ? { id: String(vehicleId) }
                : { plateNumber: { equals: String(plateNumber).trim(), mode: 'insensitive' } },
        });

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found.' });
        }

        const originalPlate = vehicle.plateNumber;
        const archivedPlate = `RELEASED_${originalPlate}_${Date.now().toString().slice(-6)}`;

        await prisma.$transaction(async (tx) => {
            await tx.vehicleDriver.deleteMany({ where: { vehicleId: vehicle.id } });
            await tx.vehicle.update({
                where: { id: vehicle.id },
                data: {
                    plateNumber: archivedPlate,
                    driverProfileId: null,
                    fleetManagerId: null,
                },
            });
            await tx.setting.deleteMany({
                where: { key: `vehicle_transfer:${originalPlate}` },
            });
        });

        return res.status(200).json({
            success: true,
            releasedPlate: originalPlate,
            message: `Vehicle ${originalPlate} has been released and is now available for new registration.`,
        });
    } catch (error: any) {
        console.error('Vehicle release error:', error);
        return res.status(500).json({ message: error?.message || 'Failed to release vehicle.' });
    }
}
