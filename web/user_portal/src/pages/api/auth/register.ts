import type { NextApiRequest, NextApiResponse } from 'next';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { firstName, lastName, fullName, email, phone, password, role, licenseNumber } = req.body ?? {};
    const resolvedFullName = (fullName || `${firstName || ''} ${lastName || ''}`).trim() || 'Cabi User';
    const normalizedPhone = (phone || '').trim();
    const normalizedEmail = (email || `${normalizedPhone.replace(/\W+/g, '')}@cabi.africa`).trim().toLowerCase();

    if (!normalizedPhone || !password) {
        return res.status(400).json({ message: 'Phone and password are required' });
    }

    try {
        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
            },
        });

        if (existing) {
            return res.status(400).json({ message: 'An account with this email or phone already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const isDriver = String(role || '').toUpperCase() === 'DRIVER';
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        const created = await prisma.user.create({
            data: {
                email: normalizedEmail,
                phone: normalizedPhone,
                password: hashedPassword,
                fullName: resolvedFullName,
                role: isDriver ? 'DRIVER' : 'PASSENGER',
                phoneOtpCode: otpCode,
                phoneOtpExpires: otpExpires,
                forgotEmailOtp: otpCode,
                forgotEmailOtpExpires: otpExpires,
                ...(isDriver
                    ? {
                          driverProfile: {
                              create: {
                                  licenseNumber: licenseNumber?.trim() || `DL-${Date.now()}`,
                              },
                          },
                      }
                    : {}),
            },
            include: {
                driverProfile: true,
            },
        });

        const token = `cabi-session-${created.id}-${Date.now()}`;
        const nameParts = created.fullName.split(' ');

        return res.status(201).json({
            id: created.id,
            token,
            accessToken: token,
            user: {
                id: created.id,
                email: created.email,
                fullName: created.fullName,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' '),
                phone: created.phone,
                role: isDriver ? 'driver' : 'passenger',
                driverProfileId: created.driverProfile?.id,
                driverProfile: created.driverProfile,
            },
        });
    } catch (error: any) {
        console.error('Mobile auth/register error:', error);
        return res.status(500).json({ message: error?.message || 'Registration failed' });
    }
}
