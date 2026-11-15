import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const slug = Array.isArray(req.query.slug) ? req.query.slug : [String(req.query.slug || '')];

    if (slug[0] === 'health') {
        return res.status(200).json({ status: 'UP', service: 'sacco' });
    }

    if (slug[0] === 'balance') {
        const driverId = String(req.query.driverId || '');
        try {
            const profile = await prisma.driverProfile.findFirst({
                where: { OR: [{ id: driverId }, { userId: driverId }] },
                include: { saccoLedger: true },
            });
            const totalSavings =
                profile?.saccoLedger?.reduce((sum, entry: any) => sum + Number(entry.amount || 0), 0) ?? 0;
            return res.status(200).json({
                driverId,
                balance: totalSavings,
                totalSavings,
                loanEligibility: totalSavings * 3,
                currency: 'KES',
            });
        } catch {
            return res.status(200).json({ driverId, balance: 0, totalSavings: 0, loanEligibility: 0, currency: 'KES' });
        }
    }

    if (slug[0] === 'transactions') {
        const driverId = String(req.query.driverId || '');
        try {
            const profile = await prisma.driverProfile.findFirst({
                where: { OR: [{ id: driverId }, { userId: driverId }] },
                include: { saccoLedger: { orderBy: { createdAt: 'desc' }, take: 50 } },
            });
            return res.status(200).json(profile?.saccoLedger ?? []);
        } catch {
            return res.status(200).json([]);
        }
    }

    return res.status(200).json({ data: [] });
}
