import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email: identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Missing email/phone or password' });
        }

        const normalizedIdentifier = identifier.toLowerCase().trim();

        // Support login by email OR phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedIdentifier },
                    { phone: identifier.trim() },
                    { email: identifier.trim() } // Fallback for case-sensitive matches if stored weirdly
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // In a real app, generate a JWT here
        const token = 'mock-jwt-token-' + user.id;

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
