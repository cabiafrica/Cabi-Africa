import type { NextApiRequest, NextApiResponse } from 'next';
import * as jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

function resolveUserIdFromToken(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7).trim();
    const sessionMatch = token.match(/^cabi-session-([0-9a-fA-F-]{36})-\d+$/);
    if (sessionMatch) {
        return sessionMatch[1];
    }
    try {
        const decoded = jwt.decode(token) as { sub?: string; id?: string } | null;
        return decoded?.sub || decoded?.id || null;
    } catch {
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = resolveUserIdFromToken(req.headers.authorization);
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

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
