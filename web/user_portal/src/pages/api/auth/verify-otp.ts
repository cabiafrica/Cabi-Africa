import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyStoredOtp } from '@/lib/otpService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { identifier, code, purpose = 'registration' } = req.body ?? {};
    if (!identifier || !code) {
        return res.status(400).json({ message: 'Identifier and OTP code are required.' });
    }

    const valid = await verifyStoredOtp(String(identifier), String(purpose), String(code), false);
    if (!valid) {
        return res.status(400).json({ verified: false, message: 'Invalid or expired verification code.' });
    }

    return res.status(200).json({ verified: true, message: 'OTP verified successfully.' });
}
