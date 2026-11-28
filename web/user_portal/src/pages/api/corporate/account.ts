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
            const account = corporateService.getAccount(targetOrgId);
            if (!account) {
                return res.status(404).json({ success: false, message: 'Corporate account not found' });
            }
            return res.status(200).json({ success: true, data: account });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to fetch account info' });
        }
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
        try {
            const updates = req.body;
            const updated = corporateService.updateAccount(targetOrgId, updates);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Corporate account not found' });
            }
            return res.status(200).json({
                success: true,
                message: 'Company settings updated successfully',
                data: updated
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to update company settings' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
