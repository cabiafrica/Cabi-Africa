import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid qualification ID' });
    }

    if (req.method === 'PUT') {
        const { name, description, rewardLabel, rewardIconEmoji, isActive, requiredBenefitIds } = req.body;

        try {
            // First update basic fields
            const updateData: any = {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(rewardLabel && { rewardLabel }),
                ...(rewardIconEmoji && { rewardIconEmoji }),
                ...(isActive !== undefined && { isActive })
            };

            // If requiredBenefitIds is provided, update requirements
            if (Array.isArray(requiredBenefitIds)) {
                // Delete existing requirements for this qualification and re-create
                await prisma.qualificationRequirement.deleteMany({
                    where: { qualificationId: id }
                });

                if (requiredBenefitIds.length > 0) {
                    updateData.requirements = {
                        create: requiredBenefitIds.map((benefitId: string) => ({ benefitId }))
                    };
                }
            }

            const updatedQual = await prisma.vehicleQualification.update({
                where: { id },
                data: updateData,
                include: {
                    requirements: { include: { benefit: true } }
                }
            });

            return res.status(200).json({ success: true, qualification: updatedQual });
        } catch (error: any) {
            console.error('Error updating qualification:', error);
            return res.status(500).json({ success: false, message: 'Internal server error updating qualification', error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            // Soft delete by deactivating
            const deletedQual = await prisma.vehicleQualification.update({
                where: { id },
                data: { isActive: false }
            });

            return res.status(200).json({ success: true, qualification: deletedQual, message: 'Qualification deactivated successfully' });
        } catch (error: any) {
            console.error('Error deleting qualification:', error);
            return res.status(500).json({ success: false, message: 'Internal server error deleting qualification', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
