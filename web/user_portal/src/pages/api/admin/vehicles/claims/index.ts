import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { status } = req.query;

    try {
        const claims = await prisma.vehicleBenefitClaim.findMany({
            where: {
                ...(status && { status: status as any })
            },
            include: {
                benefit: true,
                vehicle: {
                    select: { plateNumber: true, make: true, model: true }
                },
                driver: {
                    include: {
                        user: { select: { fullName: true, phone: true } }
                    }
                }
            },
            orderBy: { reportedAt: 'desc' }
        });

        const formattedClaims = claims.map((c: any) => ({
            ...c,
            evidenceFileUrl: c.evidenceUrl || c.evidenceFileUrl
        }));

        return res.status(200).json({ success: true, claims: formattedClaims });
    } catch (error: any) {
        console.error('Error fetching admin claims queue:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
}
