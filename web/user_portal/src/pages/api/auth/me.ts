import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { extractCallerUser } from '@/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const caller = extractCallerUser(req);
    if (!caller) {
        return res.status(401).json({ message: 'Unauthorized: Invalid, unverified, or expired session token.' });
    }

    const userId = caller.sub || caller.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                driverProfile: {
                    include: {
                        vehicles: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const nameParts = (user.fullName || 'Cabi User').split(' ');
        return res.status(200).json({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            phone: user.phone,
            role: user.driverProfile ? 'driver' : 'passenger',
            driverProfileId: user.driverProfile?.id,
            driverProfile: user.driverProfile,
        });
    } catch (error: any) {
        console.error('auth/me error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
