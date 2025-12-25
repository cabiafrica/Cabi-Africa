import type { NextApiRequest, NextApiResponse } from 'next';

interface ReferralValidationResponse {
    valid: boolean;
    referrerName?: string;
    referrerId?: string;
    message?: string;
}

// Mock database of valid referral codes
const validReferralCodes: Record<string, { id: string; name: string }> = {
    'DRIVER123': { id: 'driver_001', name: 'John Kamau' },
    'WELCOME2024': { id: 'driver_002', name: 'Mary Wanjiku' },
    'REFER100': { id: 'driver_003', name: 'Peter Omondi' },
    'NAIROBI50': { id: 'driver_004', name: 'Grace Akinyi' },
    'MOMBASA25': { id: 'driver_005', name: 'Hassan Mohamed' },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ReferralValidationResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            valid: false,
            message: 'Method not allowed'
        });
    }

    try {
        const { code } = req.query;

        // Validate query parameter
        if (!code || typeof code !== 'string') {
            return res.status(400).json({
                valid: false,
                message: 'Referral code is required',
            });
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if code is valid
        const referralCode = code.toUpperCase().trim();
        const referrer = validReferralCodes[referralCode];

        if (referrer) {
            return res.status(200).json({
                valid: true,
                referrerId: referrer.id,
                referrerName: referrer.name,
                message: `Valid referral code from ${referrer.name}`,
            });
        } else {
            return res.status(200).json({
                valid: false,
                message: 'Invalid referral code',
            });
        }

    } catch (error) {
        console.error('Referral validation error:', error);
        return res.status(500).json({
            valid: false,
            message: 'An error occurred while validating the referral code',
        });
    }
}
