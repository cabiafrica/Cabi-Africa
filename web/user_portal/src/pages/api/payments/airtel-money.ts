import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { initiateAirtelCollection, initiateAirtelDisbursement } from '@/lib/airtelMoney';
import { extractCallerUser, requireAuth } from '@/lib/serverAuth';

export type AirtelFlowPurpose =
    | 'PASSENGER_DEPOSIT'
    | 'REFERRAL_WITHDRAWAL'
    | 'DRIVER_COMMISSION'
    | 'DRIVER_EARNINGS';

interface WalletState {
    walletBalance: number;
    referralBonusBalance: number;
    commissionDue: number;
    driverEarningsBalance: number;
    transactions: Array<{
        id: string;
        purpose: AirtelFlowPurpose;
        direction: 'IN' | 'OUT';
        amount: number;
        phone: string;
        status: string;
        message: string;
        createdAt: string;
    }>;
}

const DEFAULT_WALLET: WalletState = {
    walletBalance: 0,
    referralBonusBalance: 500,
    commissionDue: 350,
    driverEarningsBalance: 2400,
    transactions: [],
};

const MEMORY_WALLET_FALLBACK = new Map<string, WalletState>();

async function getWalletState(userId: string): Promise<WalletState> {
    try {
        const record = await prisma.setting.findUnique({ where: { key: `airtel_wallet:${userId}` } });
        if (!record) return MEMORY_WALLET_FALLBACK.get(userId) || { ...DEFAULT_WALLET, transactions: [] };
        const parsed = typeof record.value === 'string' ? JSON.parse(record.value) : record.value;
        return { ...DEFAULT_WALLET, ...parsed };
    } catch {
        return MEMORY_WALLET_FALLBACK.get(userId) || { ...DEFAULT_WALLET, transactions: [] };
    }
}

async function saveWalletState(userId: string, state: WalletState): Promise<void> {
    MEMORY_WALLET_FALLBACK.set(userId, state);
    try {
        await prisma.setting.upsert({
            where: { key: `airtel_wallet:${userId}` },
            update: { value: JSON.stringify(state) },
            create: { key: `airtel_wallet:${userId}`, value: JSON.stringify(state) },
        });
    } catch (err) {
        console.warn('Wallet state persisted to memory fallback (DB unreachable):', (err as Error).message);
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const caller = extractCallerUser(req);
        const queryUserId = typeof req.query.userId === 'string' ? req.query.userId.trim() : null;

        // If caller is authenticated, prioritize their own ID to prevent balance snooping
        const targetUserId = caller ? (caller.sub || caller.id) : (queryUserId || null);
        if (!targetUserId) {
            return res.status(401).json({ success: false, message: 'Authentication required to access wallet.' });
        }

        // Prevent unauthorized querying of another user's balance
        if (caller && queryUserId && queryUserId !== targetUserId && caller.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Forbidden: Cannot view another user wallet.' });
        }

        const wallet = await getWalletState(targetUserId);
        return res.status(200).json({ success: true, wallet });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const caller = requireAuth(req, res);
    if (!caller) return;

    const {
        userId,
        purpose,
        action,
        phone,
        amount,
        reference,
    } = req.body ?? {};

    const numericAmount = Number(amount);
    if (!phone || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid Airtel Money phone number and positive amount are required.',
        });
    }

    const resolvedPurpose: AirtelFlowPurpose =
        purpose === 'REFERRAL_WITHDRAWAL' ||
        purpose === 'DRIVER_COMMISSION' ||
        purpose === 'DRIVER_EARNINGS' ||
        purpose === 'PASSENGER_DEPOSIT'
            ? purpose
            : action === 'disburse'
            ? 'DRIVER_EARNINGS'
            : 'PASSENGER_DEPOSIT';

    // Disallow spoofing another user's ID
    const cleanUserId = String(caller.sub || caller.id).trim();
    if (userId && String(userId).trim() !== cleanUserId && caller.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot transact on behalf of another user.' });
    }

    const wallet = await getWalletState(cleanUserId);
    const ref = String(reference || `AIR-${resolvedPurpose}-${Date.now()}`);

    // Validate balances before outbound payouts
    if (resolvedPurpose === 'REFERRAL_WITHDRAWAL' && numericAmount > wallet.referralBonusBalance) {
        return res.status(400).json({
            success: false,
            message: `Insufficient referral bonus balance (KES ${wallet.referralBonusBalance}).`,
        });
    }
    if (resolvedPurpose === 'DRIVER_EARNINGS' && numericAmount > wallet.driverEarningsBalance) {
        return res.status(400).json({
            success: false,
            message: `Insufficient withdrawable driver earnings (KES ${wallet.driverEarningsBalance}).`,
        });
    }

    const isDisbursement =
        resolvedPurpose === 'REFERRAL_WITHDRAWAL' || resolvedPurpose === 'DRIVER_EARNINGS';

    const result = isDisbursement
        ? await initiateAirtelDisbursement({ phone: String(phone), amount: numericAmount, reference: ref })
        : await initiateAirtelCollection({ phone: String(phone), amount: numericAmount, reference: ref });

    if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
    }

    // Update persisted wallet balances
    if (resolvedPurpose === 'PASSENGER_DEPOSIT') {
        wallet.walletBalance += numericAmount;
    } else if (resolvedPurpose === 'REFERRAL_WITHDRAWAL') {
        wallet.referralBonusBalance = Math.max(0, wallet.referralBonusBalance - numericAmount);
    } else if (resolvedPurpose === 'DRIVER_COMMISSION') {
        wallet.commissionDue = Math.max(0, wallet.commissionDue - numericAmount);
    } else if (resolvedPurpose === 'DRIVER_EARNINGS') {
        wallet.driverEarningsBalance = Math.max(0, wallet.driverEarningsBalance - numericAmount);
    }

    const txRecord = {
        id: `TX-${Date.now().toString().slice(-6)}`,
        purpose: resolvedPurpose,
        direction: isDisbursement ? ('OUT' as const) : ('IN' as const),
        amount: numericAmount,
        phone: String(phone),
        status: 'SUCCESS',
        message: result.message,
        createdAt: new Date().toISOString(),
    };
    wallet.transactions.unshift(txRecord);
    await saveWalletState(cleanUserId, wallet);

    return res.status(200).json({
        success: true,
        message: result.message,
        reference: ref,
        wallet,
    });
}
