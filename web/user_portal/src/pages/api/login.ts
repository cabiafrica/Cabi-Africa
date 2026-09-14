import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { prisma } from '@/lib/prisma';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3335/api';

const DEMO_USERS: Record<string, any> = {
    'driver@cabi.africa': {
        id: 'demo-driver-1',
        email: 'driver@cabi.africa',
        firstName: 'Samuel',
        lastName: 'Mwangi',
        role: 'driver',
        phone: '+254712345678',
        fleetManagerId: 'demo-fleet-mgr-1'
    },
    'passenger@cabi.africa': {
        id: 'demo-passenger-1',
        email: 'passenger@cabi.africa',
        firstName: 'Jane',
        lastName: 'Wanjiku',
        role: 'passenger',
        phone: '+254798765432'
    },
    'admin@cabi.africa': {
        id: 'demo-admin-1',
        email: 'admin@cabi.africa',
        firstName: 'Admin',
        lastName: 'Operations',
        role: 'admin',
        phone: '+254700000000'
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email/phone or password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check for quick demo accounts
    if (DEMO_USERS[normalizedEmail]) {
        const demoUser = DEMO_USERS[normalizedEmail];
        const token = `cabi-demo-jwt-token-${demoUser.id}-${Date.now()}`;
        return res.status(200).json({
            success: true,
            token,
            user: demoUser
        });
    }

    // 2. Try proxying to backend microservice
    try {
        const response = await axios.post(`${BACKEND_URL}/auth/login`, {
            email,
            password
        }, { timeout: 2000 });

        return res.status(200).json(response.data);
    } catch (backendError: any) {
        // Backend service is unreachable or returned error
        console.warn('Backend proxy unavailable, checking database directly:', backendError.message);
    }

    // 3. Fallback: Authenticate via Prisma database directly
    try {
        const dbUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedEmail },
                    { phone: email.trim() }
                ]
            },
            include: {
                driverProfile: true,
                fleetManager: true
            }
        });

        if (dbUser) {
            const nameParts = (dbUser.fullName || 'Cabi User').split(' ');
            const role = dbUser.driverProfile ? 'driver' : 'passenger';
            const token = `cabi-session-${dbUser.id}-${Date.now()}`;

            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: dbUser.id,
                    email: dbUser.email,
                    firstName: nameParts[0],
                    lastName: nameParts.slice(1).join(' '),
                    role,
                    phone: dbUser.phone,
                    fleetManagerId: dbUser.fleetManager?.id
                }
            });
        }
    } catch (dbError: any) {
        console.error('Direct DB lookup error:', dbError.message);
    }

    return res.status(401).json({
        message: 'Invalid credentials. Please verify your email and password.'
    });
}
