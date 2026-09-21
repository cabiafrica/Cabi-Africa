import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const BACKEND_URL =
    process.env.BACKEND_URL ||
    process.env.AUTH_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://auth-gateway-746659778850.us-central1.run.app/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email/phone or password' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Try proxying to backend microservice
    try {
        const cleanBaseUrl = BACKEND_URL.replace(/\/+$/, '');
        const targetUrl = cleanBaseUrl.endsWith('/api') ? `${cleanBaseUrl}/auth/login` : `${cleanBaseUrl}/api/auth/login`;

        const response = await axios.post(
            targetUrl,
            {
                email,
                password,
            },
            { timeout: 5000 }
        );

        return res.status(200).json(response.data);
    } catch (backendError: any) {
        // If backend explicitly returned 401 or 400, forward the actual error
        if (backendError.response?.status === 401 || backendError.response?.status === 400) {
            return res.status(backendError.response.status).json(backendError.response.data);
        }
        console.warn('Backend proxy unreachable or error, attempting secure database fallback:', backendError.message);
    }

    // 2. Fallback: Authenticate via Prisma database directly with bcrypt validation
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
                fleetManagerProfile: true
            }
        });

        if (dbUser && dbUser.password) {
            const isMatch = await bcrypt.compare(password, dbUser.password);
            if (isMatch) {
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
                        fleetManagerId: dbUser.fleetManagerProfile?.id
                    }
                });
            }
        }
    } catch (dbError: any) {
        console.error('Direct DB authentication error:', dbError.message);
    }

    return res.status(401).json({
        message: 'Invalid credentials. Please verify your email and password.'
    });
}
