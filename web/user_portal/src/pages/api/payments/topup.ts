import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { initiateAirtelCollection } from '@/lib/airtelMoney';
import { initiateStkPush } from '@/lib/mpesa';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, phone, amount, provider = 'MPESA' } = req.body ?? {};
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 10) {
        return res.status(400).json({ success: false, message: 'Minimum top-up amount is KES 10.' });
    }
    if (!phone && provider !== 'CARD') {
        return res.status(400).json({ success: false, message: 'Phone number is required for mobile money top-up.' });
    }

    const reference = `TOPUP-${Date.now()}`;
    const upperProvider = String(provider).toUpperCase();

    try {
        let providerResult: any = { success: true, transactionId: reference, message: 'Top-up initiated.' };

        if (upperProvider === 'AIRTEL_MONEY' || upperProvider === 'AIRTEL') {
            providerResult = await initiateAirtelCollection({
                phone: String(phone),
                amount: numericAmount,
                reference,
            });
        } else if (upperProvider === 'MPESA') {
            const mpesaRes = await initiateStkPush({
                phone: String(phone),
                amount: numericAmount,
                accountReference: reference,
                transactionDesc: 'CABI Wallet Top-Up',
            });
            // Graceful sandbox fallback if Daraja env vars are not set locally
            if (!mpesaRes.success && !process.env.MPESA_CONSUMER_KEY) {
                providerResult = {
                    success: true,
                    mode: 'sandbox_mock',
                    transactionId: `MPESA-SIM-${Date.now()}`,
                    message: `M-Pesa STK Push simulated for ${phone} (KES ${numericAmount}).`,
                };
            } else {
                providerResult = {
                    success: mpesaRes.success,
                    transactionId: mpesaRes.checkoutRequestId || reference,
                    message: mpesaRes.customerMessage || mpesaRes.error || 'M-Pesa STK Push sent.',
                };
            }
        }

        if (!providerResult.success) {
            return res.status(400).json({ success: false, message: providerResult.message || 'Top-up failed.' });
        }

        if (userId) {
            const key = `wallet_balance:${String(userId)}`;
            const existing = await prisma.setting.findUnique({ where: { key } });
            const currentBalance = existing ? Number(existing.value) || 0 : 0;
            const newBalance = currentBalance + numericAmount;
            await prisma.setting.upsert({
                where: { key },
                update: { value: String(newBalance) },
                create: { key, value: String(newBalance) },
            });
            return res.status(200).json({
                success: true,
                provider: upperProvider,
                amount: numericAmount,
                newBalance,
                transactionId: providerResult.transactionId,
                message: providerResult.message,
            });
        }

        return res.status(200).json({
            success: true,
            provider: upperProvider,
            amount: numericAmount,
            transactionId: providerResult.transactionId,
            message: providerResult.message,
        });
    } catch (error: any) {
        console.error('Top-up error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Top-up failed.' });
    }
}
