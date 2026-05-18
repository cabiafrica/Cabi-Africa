import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const qualifications = await prisma.vehicleQualification.findMany({
                where: { isActive: true },
                include: {
                    requirements: {
                        include: {
                            benefit: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });

            return res.status(200).json({ success: true, qualifications });
        } catch (error: any) {
            console.error('Error fetching qualifications:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    if (req.method === 'POST') {
        const { name, description, rewardLabel, rewardIconEmoji, requiredBenefitIds } = req.body;

        if (!name || !rewardLabel) {
            return res.status(400).json({ success: false, message: 'Name and reward label are required' });
        }

        try {
            const newQual = await prisma.vehicleQualification.create({
                data: {
                    name,
                    description,
                    rewardLabel,
                    rewardIconEmoji: rewardIconEmoji || '🏆',
                    isActive: true,
                    ...(Array.isArray(requiredBenefitIds) && requiredBenefitIds.length > 0 && {
                        requirements: {
                            create: requiredBenefitIds.map((benefitId: string) => ({ benefitId }))
                        }
                    })
                },
                include: {
                    requirements: { include: { benefit: true } }
                }
            });

            return res.status(201).json({ success: true, qualification: newQual });
        } catch (error: any) {
            console.error('Error creating qualification:', error);
            return res.status(500).json({ success: false, message: 'Internal server error creating qualification', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
