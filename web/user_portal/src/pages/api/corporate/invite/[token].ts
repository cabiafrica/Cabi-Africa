import type { NextApiRequest, NextApiResponse } from 'next';
import { corporateService } from '@/lib/corporateService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.query;

    if (typeof token !== 'string' || !token) {
        return res.status(400).json({ success: false, message: 'Invite token is required' });
    }

    if (req.method === 'GET') {
        try {
            const data = corporateService.getInviteByToken(token);
            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'Invitation not found or has already been accepted/expired'
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    companyName: data.account.companyName,
                    city: data.account.city,
                    country: data.account.country,
                    email: data.invite.email,
                    phone: data.invite.phone,
                    role: data.invite.role,
                    department: data.invite.department,
                    expiresAt: data.invite.expiresAt
                }
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error checking invitation' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { userId } = req.body;
            const acceptedMember = corporateService.acceptInvite(token, userId);

            if (!acceptedMember) {
                return res.status(400).json({
                    success: false,
                    message: 'Unable to accept invitation. Token may be invalid, expired, or already used.'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Invitation accepted! You are now linked to your company’s corporate travel account.',
                data: acceptedMember
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error accepting invitation' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
