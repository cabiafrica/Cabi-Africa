import type { NextApiRequest, NextApiResponse } from 'next';

interface GenerateReferralResponse {
    success: boolean;
    referralCode?: string;
    error?: string;
}

/**
 * Generate a unique referral code for a user
 * POST /api/referrals/generate
 * Body: { userId: string, userRole: 'driver' | 'passenger' | 'organization' }
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<GenerateReferralResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { userId, userRole } = req.body;

        if (!userId || !userRole) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Generate a unique referral code
        // Format: ROLE-RANDOMSTRING (e.g., DRV-ABC123, PSG-XYZ789, ORG-DEF456)
        const rolePrefix = userRole === 'driver' ? 'DRV' : userRole === 'passenger' ? 'PSG' : 'ORG';
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const referralCode = `${rolePrefix}-${randomString}`;

        // TODO: Store referral code in database
        // await db.users.update({ where: { id: userId }, data: { referralCode } });

        // For now, return the generated code
        return res.status(200).json({
            success: true,
            referralCode,
        });
    } catch (error) {
        console.error('Error generating referral code:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate referral code',
        });
    }
}
