import type { NextApiRequest, NextApiResponse } from 'next';

interface ReferralStatsResponse {
    success: boolean;
    stats?: {
        totalReferrals: number;
        rewardsEarned: number;
        referrals: Array<{
            id: string;
            name: string;
            role: string;
            status: string;
            registeredAt: string;
            reward: number;
        }>;
    };
    error?: string;
}

/**
 * Get referral statistics for a user
 * GET /api/referrals/stats/[userId]
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ReferralStatsResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid user ID' });
        }

        // TODO: Fetch referral stats from database
        // const stats = await db.referrals.findMany({ where: { referrerId: userId } });

        // Mock data for now
        const mockStats = {
            totalReferrals: 5,
            rewardsEarned: 2500,
            referrals: [
                {
                    id: '1',
                    name: 'Alice Wanjiku',
                    role: 'driver',
                    status: 'completed',
                    registeredAt: '2026-01-10T10:00:00Z',
                    reward: 500,
                },
                {
                    id: '2',
                    name: 'Michael Rotich',
                    role: 'passenger',
                    status: 'completed',
                    registeredAt: '2026-01-09T15:30:00Z',
                    reward: 250,
                },
                {
                    id: '3',
                    name: 'David Mwangi',
                    role: 'driver',
                    status: 'pending',
                    registeredAt: '2026-01-08T12:00:00Z',
                    reward: 0,
                },
            ],
        };

        return res.status(200).json({
            success: true,
            stats: mockStats,
        });
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch referral statistics',
        });
    }
}
