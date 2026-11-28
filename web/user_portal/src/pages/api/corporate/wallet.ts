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
            const wallet = corporateService.getWallet(targetOrgId);
            const transactions = corporateService.getTransactions(targetOrgId);
            return res.status(200).json({
                success: true,
                data: {
                    wallet,
                    transactions
                }
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to fetch wallet info' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { amount, paymentMethod, reference, phone } = req.body;
            const numericAmount = Number(amount);

            if (!numericAmount || numericAmount <= 0) {
                return res.status(400).json({ success: false, message: 'Valid top-up amount is required' });
            }

            const chosenMethod = paymentMethod || 'MPESA';
            const generatedRef = reference || (chosenMethod === 'MPESA' 
                ? 'QGK' + Math.floor(1000000 + Math.random() * 9000000)
                : 'TXN-' + Math.floor(1000000 + Math.random() * 9000000));

            const updatedWallet = corporateService.topUpWallet(
                targetOrgId,
                numericAmount,
                chosenMethod,
                generatedRef
            );

            return res.status(200).json({
                success: true,
                message: `Successfully topped up KES ${numericAmount.toLocaleString()} via ${chosenMethod}`,
                data: {
                    wallet: updatedWallet,
                    reference: generatedRef
                }
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Failed to process top-up' });
        }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
}
