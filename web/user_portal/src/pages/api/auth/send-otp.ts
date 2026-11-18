import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAndStoreOtp, sendEmailMessage, sendSmsMessage } from '@/lib/otpService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, phone, purpose = 'registration' } = req.body ?? {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

    if (!normalizedEmail && !normalizedPhone) {
        return res.status(400).json({ message: 'Email or phone number is required to send OTP.' });
    }

    try {
        const primaryIdentifier = normalizedPhone || normalizedEmail;
        const code = await generateAndStoreOtp(primaryIdentifier, purpose);
        const channels: string[] = [];

        if (normalizedPhone) {
            await sendSmsMessage(
                normalizedPhone,
                `Your CABI Africa verification code is ${code}. It expires in 10 minutes.`
            );
            channels.push('sms');
        }

        if (normalizedEmail) {
            await sendEmailMessage({
                to: normalizedEmail,
                subject: 'Your CABI Africa Verification Code',
                text: `Your CABI Africa verification code is ${code}. Valid for 10 minutes.`,
                html: `<div style="font-family:sans-serif;padding:24px;background:#0a0a0c;color:#f8fafc;border-radius:12px;">
                    <h2 style="color:#d4af37;margin:0 0 12px;">CABI Africa Verification</h2>
                    <p>Use the 6-digit code below to verify your account:</p>
                    <div style="font-size:32px;font-weight:900;letter-spacing:6px;color:#d4af37;margin:16px 0;">${code}</div>
                    <p style="font-size:12px;color:#94a3b8;">This code expires in 10 minutes.</p>
                </div>`,
            });
            channels.push('email');
        }

        return res.status(200).json({
            sent: true,
            channels,
            message: `Verification code sent via ${channels.join(' and ')}.`,
            ...(process.env.NODE_ENV !== 'production' ? { devOtp: code } : {}),
        });
    } catch (error: any) {
        console.error('send-otp error:', error);
        return res.status(500).json({ message: error?.message || 'Failed to send verification code.' });
    }
}
