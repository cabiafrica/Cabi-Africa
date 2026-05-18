import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid benefit ID' });
    }

    if (req.method === 'PUT') {
        const { name, description, category, iconEmoji, isActive } = req.body;

        try {
            const updatedBenefit = await prisma.vehicleBenefit.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(category && { category }),
                    ...(iconEmoji && { iconEmoji }),
                    ...(isActive !== undefined && { isActive })
                }
            });

            return res.status(200).json({ success: true, benefit: updatedBenefit });
        } catch (error: any) {
            console.error('Error updating benefit:', error);
            return res.status(500).json({ success: false, message: 'Internal server error updating benefit', error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            // Soft delete by deactivating
            const deletedBenefit = await prisma.vehicleBenefit.update({
                where: { id },
                data: { isActive: false }
            });

            return res.status(200).json({ success: true, benefit: deletedBenefit, message: 'Benefit deactivated successfully' });
        } catch (error: any) {
            console.error('Error deleting benefit:', error);
            return res.status(500).json({ success: false, message: 'Internal server error deleting benefit', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
