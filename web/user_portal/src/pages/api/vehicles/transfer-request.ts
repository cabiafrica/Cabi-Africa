import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const plate = String(req.query.plateNumber || '').trim().toUpperCase();
        if (!plate) return res.status(400).json({ message: 'plateNumber is required' });
        const record = await prisma.setting.findUnique({ where: { key: `vehicle_transfer:${plate}` } });
        return res.status(200).json({ request: record ? (typeof record.value === 'string' ? JSON.parse(record.value) : record.value) : null });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { plateNumber, requesterName, requesterPhone, reason } = req.body ?? {};
    const cleanPlate = String(plateNumber || '').trim().toUpperCase();

    if (!cleanPlate || !requesterName || !requesterPhone) {
        return res.status(400).json({ message: 'Plate number, your name, and phone number are required.' });
    }

    try {
        const vehicle = await prisma.vehicle.findFirst({
            where: { plateNumber: { equals: cleanPlate, mode: 'insensitive' } },
        });

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found. You can register it directly.' });
        }

        const payload = {
            plateNumber: vehicle.plateNumber,
            vehicleId: vehicle.id,
            requesterName: String(requesterName).trim(),
            requesterPhone: String(requesterPhone).trim(),
            reason: String(reason || 'Ownership / driver transfer request').trim(),
            status: 'PENDING_OWNER_RELEASE',
            requestedAt: new Date().toISOString(),
        };

        await prisma.setting.upsert({
            where: { key: `vehicle_transfer:${vehicle.plateNumber}` },
            update: { value: JSON.stringify(payload) },
            create: { key: `vehicle_transfer:${vehicle.plateNumber}`, value: JSON.stringify(payload) },
        });

        return res.status(201).json({
            success: true,
            message: `Transfer request submitted for ${vehicle.plateNumber}. The current owner has been notified to release the vehicle.`,
            transferRequest: payload,
        });
    } catch (error: any) {
        console.error('Vehicle transfer request error:', error);
        return res.status(500).json({ message: error?.message || 'Failed to submit transfer request.' });
    }
}
