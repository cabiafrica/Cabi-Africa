import type { NextApiRequest, NextApiResponse } from 'next';

interface ValidateReferralResponse {
    success: boolean;
    valid?: boolean;
    referrerName?: string;
    referrerRole?: string;
    error?: string;
}

/**
 * Validate a referral code
 * POST /api/referrals/validate
 * Body: { referralCode: string }
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ValidateReferralResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { referralCode } = req.body;

        if (!referralCode) {
            return res.status(400).json({ success: false, error: 'Referral code is required' });
        }

        // TODO: Look up referral code in database
        // const referrer = await db.users.findUnique({ where: { referralCode } });

        // Mock validation for now
        const mockReferrers: Record<string, { name: string; role: string }> = {
            'DRV-ABC123': { name: 'John Kamau', role: 'driver' },
            'PSG-XYZ789': { name: 'Sarah Ochieng', role: 'passenger' },
            'ORG-DEF456': { name: 'Nairobi Sacco', role: 'organization' },
        };

        const referrer = mockReferrers[referralCode.toUpperCase()];

        if (!referrer) {
            return res.status(200).json({
                success: true,
                valid: false,
            });
        }

        return res.status(200).json({
            success: true,
            valid: true,
            referrerName: referrer.name,
            referrerRole: referrer.role,
        });
    } catch (error) {
        console.error('Error validating referral code:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to validate referral code',
        });
    }
}
