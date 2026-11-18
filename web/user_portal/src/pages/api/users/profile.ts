import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const caller = requireAuth(req, res);
    if (!caller) return;

    const { userId, fullName, phone, email, preferredLanguage, privacySettings } = req.body ?? {};

    // Prevent IDOR: target userId MUST match authenticated caller (unless admin)
    const targetUserId = String(userId || caller.sub || caller.id).trim();
    if (targetUserId !== caller.sub && targetUserId !== caller.id && caller.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot modify another user profile.' });
    }

    try {
        const updated = await prisma.user.update({
            where: { id: targetUserId },
            data: {
                ...(fullName ? { fullName: String(fullName).trim() } : {}),
                ...(phone ? { phone: String(phone).trim() } : {}),
                ...(email ? { email: String(email).trim().toLowerCase() } : {}),
            },
            select: { id: true, fullName: true, email: true, phone: true },
        });

        await prisma.setting.upsert({
            where: { key: `user_prefs:${updated.id}` },
            update: { value: JSON.stringify({ preferredLanguage, privacySettings }) },
            create: { key: `user_prefs:${updated.id}`, value: JSON.stringify({ preferredLanguage, privacySettings }) },
        });

        return res.status(200).json({
            success: true,
            user: updated,
            message: 'Profile & app settings saved successfully.',
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return res.status(500).json({ success: false, message: error?.message || 'Failed to update profile.' });
    }
}
