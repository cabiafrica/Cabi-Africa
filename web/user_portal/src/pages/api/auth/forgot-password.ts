import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import {
    createPasswordResetToken,
    generateAndStoreOtp,
    sendEmailMessage,
    sendSmsMessage,
} from '@/lib/otpService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { identifier } = req.body ?? {};
    const clean = typeof identifier === 'string' ? identifier.trim() : '';
    if (!clean) {
        return res.status(400).json({ message: 'Please provide your email address or phone number.' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: clean.toLowerCase() }, { phone: clean }],
            },
        });

        // Always return generic success for security if user doesn't exist in production
        if (!user) {
            return res.status(200).json({
                sent: true,
                message: 'If an account matches that email or phone, a reset link and OTP have been sent.',
            });
        }

        const token = createPasswordResetToken(user.id, user.email);
        const otp = await generateAndStoreOtp(user.email, 'password_reset');

        const baseUrl =
            process.env.NEXT_PUBLIC_SITE_URL ||
            (req.headers.origin ? String(req.headers.origin) : 'https://www.cabi.africa');
        const resetUrl = `${baseUrl.replace(/\/+$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

        if (user.email) {
            await sendEmailMessage({
                to: user.email,
                subject: 'Reset Your CABI Africa Password',
                text: `Reset your password using this link: ${resetUrl}\nOr use OTP code: ${otp} (valid for 10 minutes).`,
                html: `<div style="font-family:sans-serif;padding:24px;background:#0a0a0c;color:#f8fafc;border-radius:12px;">
                    <h2 style="color:#d4af37;margin:0 0 12px;">Reset Your CABI Password</h2>
                    <p>Click the button below to set a new password (link expires in 1 hour):</p>
                    <p style="margin:20px 0;">
                        <a href="${resetUrl}" style="background:#d4af37;color:#0a0a0c;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:800;">
                            Reset Password
                        </a>
                    </p>
                    <p style="font-size:13px;color:#cbd5e1;">Or enter verification code: <strong style="color:#d4af37;">${otp}</strong></p>
                </div>`,
            });
        }

        if (user.phone) {
            await sendSmsMessage(
                user.phone,
                `CABI Africa password reset OTP: ${otp}. Valid for 10 minutes.`
            );
        }

        return res.status(200).json({
            sent: true,
            message: 'Password reset link and OTP sent to your registered email and phone.',
            ...(process.env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl, devOtp: otp } : {}),
        });
    } catch (error: any) {
        console.error('forgot-password error:', error);
        return res.status(500).json({ message: error?.message || 'Failed to initiate password reset.' });
    }
}
