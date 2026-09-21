import type { NextApiRequest, NextApiResponse } from 'next';
import { corporateService } from '@/lib/corporateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { orgId } = req.query;
    const targetOrgId = (typeof orgId === 'string' && orgId) ? orgId : 'corp-nexus-tech-01';

    if (req.method === 'GET') {
        try {
            const trips = corporateService.getTrips(targetOrgId);
            return res.status(200).json({ success: true, data: trips });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to fetch corporate trips' });
        }
    }

    if (req.method === 'PATCH') {
        try {
            const { tripId, status, reviewedBy } = req.body;
            if (!tripId || !status) {
                return res.status(400).json({ success: false, message: 'tripId and status (APPROVED | FLAGGED) are required' });
            }

            const updatedTrip = corporateService.updateTripReview(
                tripId,
                status,
                reviewedBy || 'Company Admin'
            );

            if (!updatedTrip) {
                return res.status(404).json({ success: false, message: 'Trip not found' });
            }

            return res.status(200).json({
                success: true,
                message: `Trip review status updated to ${status}`,
                data: updatedTrip
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to update trip review' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
