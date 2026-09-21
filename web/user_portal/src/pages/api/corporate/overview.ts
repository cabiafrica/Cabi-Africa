import type { NextApiRequest, NextApiResponse } from 'next';
import { corporateService } from '@/lib/corporateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { orgId } = req.query;
        const targetOrgId = (typeof orgId === 'string' && orgId) ? orgId : 'corp-nexus-tech-01';

        const stats = corporateService.getOverviewStats(targetOrgId);
        if (!stats.account) {
            return res.status(404).json({ success: false, message: 'Corporate account not found' });
        }

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        console.error('Error fetching corporate overview:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch corporate overview' });
    }
}
