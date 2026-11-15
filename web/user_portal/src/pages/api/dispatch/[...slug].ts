import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const slug = Array.isArray(req.query.slug) ? req.query.slug : [String(req.query.slug || '')];

    // /api/dispatch/drivers/:driverId/status
    if (slug[0] === 'drivers' && slug[1] && slug[2] === 'status' && req.method === 'GET') {
        const driverId = slug[1];
        try {
            const profile = await prisma.driverProfile.findFirst({
                where: { OR: [{ id: driverId }, { userId: driverId }] },
            });
            return res.status(200).json({ isOnline: profile?.isOnline ?? false });
        } catch {
            return res.status(200).json({ isOnline: false });
        }
    }

    // /api/dispatch/drivers/:driverId/toggle-status
    if (slug[0] === 'drivers' && slug[1] && slug[2] === 'toggle-status' && req.method === 'POST') {
        const driverId = slug[1];
        const isOnline = Boolean(req.body?.isOnline);
        try {
            const profile = await prisma.driverProfile.findFirst({
                where: { OR: [{ id: driverId }, { userId: driverId }] },
            });
            if (profile) {
                const updated = await prisma.driverProfile.update({
                    where: { id: profile.id },
                    data: { isOnline },
                });
                return res.status(200).json({ isOnline: updated.isOnline });
            }
        } catch (err) {
            console.warn('toggle-status fallback:', err);
        }
        return res.status(200).json({ isOnline });
    }

    // /api/dispatch/drivers/:driverId/location
    if (slug[0] === 'drivers' && slug[1] && slug[2] === 'location' && req.method === 'POST') {
        const driverId = slug[1];
        const { lat, lng } = req.body ?? {};
        try {
            const profile = await prisma.driverProfile.findFirst({
                where: { OR: [{ id: driverId }, { userId: driverId }] },
            });
            if (profile && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
                await prisma.driverProfile.update({
                    where: { id: profile.id },
                    data: { currentLocation: { lat: Number(lat), lng: Number(lng), updatedAt: new Date().toISOString() } },
                });
            }
        } catch (err) {
            console.warn('driver location update fallback:', err);
        }
        return res.status(200).json({ success: true });
    }

    return res.status(200).json({ status: 'ok' });
}
