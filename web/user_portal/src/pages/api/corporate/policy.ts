import type { NextApiRequest, NextApiResponse } from 'next';
import { corporateService } from '@/lib/corporateService';
import { requireAuth } from '@/lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const caller = requireAuth(req, res);
    if (!caller) return;

    const { orgId } = req.query;
    const targetOrgId = (typeof orgId === 'string' && orgId) ? orgId : 'corp-nexus-tech-01';

    if (req.method === 'GET') {
        try {
            const policy = corporateService.getPolicy(targetOrgId);
            return res.status(200).json({ success: true, data: policy });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to fetch corporate policy' });
        }
    }

    if (req.method === 'PUT' || req.method === 'POST') {
        try {
            const updates = req.body;
            const updated = corporateService.updatePolicy(targetOrgId, updates);
            return res.status(200).json({
                success: true,
                message: 'Corporate ride policy updated successfully',
                data: updated
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to update corporate policy' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
