import type { NextApiRequest, NextApiResponse } from 'next';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyPasswordResetToken, verifyStoredOtp } from '@/lib/otpService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { token, identifier, otp, password } = req.body ?? {};
    if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    try {
        let userId: string | null = null;

        if (token && typeof token === 'string') {
            const decoded = verifyPasswordResetToken(token);
            if (!decoded) {
                return res.status(400).json({ message: 'Reset link is invalid or has expired. Please request a new one.' });
            }
            userId = decoded.sub;
        } else if (identifier && otp) {
            const clean = String(identifier).trim();
            const user = await prisma.user.findFirst({
                where: { OR: [{ email: clean.toLowerCase() }, { phone: clean }] },
            });
            if (!user) {
                return res.status(400).json({ message: 'Invalid verification code or account.' });
            }
            const validOtp = await verifyStoredOtp(user.email, 'password_reset', String(otp), true);
            if (!validOtp) {
                return res.status(400).json({ message: 'Invalid or expired OTP code.' });
            }
            userId = user.id;
        } else {
            return res.status(400).json({ message: 'A valid reset token or OTP code is required.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return res.status(200).json({
            success: true,
            message: 'Your password has been reset successfully. You can now sign in.',
        });
    } catch (error: any) {
        console.error('reset-password error:', error);
        return res.status(500).json({ message: error?.message || 'Failed to reset password.' });
    }
}
