import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const benefits = await prisma.vehicleBenefit.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' }
            });

            return res.status(200).json({ success: true, benefits });
        } catch (error: any) {
            console.error('Error fetching benefits:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    if (req.method === 'POST') {
        const { name, description, category, iconEmoji } = req.body;

        if (!name || !category) {
            return res.status(400).json({ success: false, message: 'Name and category are required' });
        }

        try {
            const newBenefit = await prisma.vehicleBenefit.create({
                data: {
                    name,
                    description,
                    category,
                    iconEmoji: iconEmoji || '🔧',
                    isActive: true
                }
            });

            return res.status(201).json({ success: true, benefit: newBenefit });
        } catch (error: any) {
            console.error('Error creating benefit:', error);
            return res.status(500).json({ success: false, message: 'Internal server error creating benefit', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
