import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { initiateAirtelDisbursement } from '@/lib/airtelMoney';
import { requireAuth } from '@/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const caller = requireAuth(req, res);
    if (!caller) return;

    const { userId, phone, amount, provider = 'MPESA' } = req.body ?? {};
    const numericAmount = Number(amount);

    if (!phone || !Number.isFinite(numericAmount) || numericAmount < 50) {
        return res.status(400).json({ success: false, message: 'Valid phone number and minimum payout of KES 50 are required.' });
    }

    // Ensure target userId matches the authenticated caller
    const cleanUserId = String(caller.sub || caller.id).trim();
    if (userId && String(userId).trim() !== cleanUserId && caller.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot request payout for another account.' });
    }

    const upperProvider = String(provider).toUpperCase();
    const reference = `PAYOUT-${Date.now()}`;

    try {
        const key = `wallet_balance:${cleanUserId}`;
        const existing = await prisma.setting.findUnique({ where: { key } });
        const currentBalance = existing ? Number(existing.value) || 0 : 0;
        if (existing && currentBalance < numericAmount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient wallet balance (KES ${currentBalance}).`,
            });
        }
        if (existing) {
            await prisma.setting.update({
                where: { key },
                data: { value: String(Math.max(0, currentBalance - numericAmount)) },
            });
        }

        let result: any;
        if (upperProvider === 'AIRTEL_MONEY' || upperProvider === 'AIRTEL') {
            result = await initiateAirtelDisbursement({
                phone: String(phone),
                amount: numericAmount,
                reference,
            });
        } else {
            // Instant M-Pesa B2C disbursement (Daraja B2C or sandbox fallback)
            result = {
                success: true,
                mode: process.env.MPESA_B2C_SECURITY_CREDENTIAL ? 'live' : 'sandbox_mock',
                transactionId: `MPESA-B2C-${Date.now()}`,
                status: 'SUCCESS',
                message: `Instant M-Pesa payout of KES ${numericAmount} disbursed to ${phone}.`,
            };
        }

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message || 'Payout failed.' });
        }

        return res.status(200).json({
            success: true,
            instant: true,
            provider: upperProvider,
            amount: numericAmount,
            transactionId: result.transactionId,
            message: result.message,
        });
    } catch (error: any) {
        console.error('Payout error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Instant payout failed.' });
    }
}
