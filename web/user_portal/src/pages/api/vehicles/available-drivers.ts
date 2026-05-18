import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const drivers = await prisma.driverProfile.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            phone: true,
                            email: true
                        }
                    }
                },
                take: 50 // Limit for UI performance
            });

            // Map and format for frontend
            const formattedDrivers = drivers.map(d => ({
                driverProfileId: d.id,
                userId: d.userId,
                fullName: d.user?.fullName || 'Unnamed Driver',
                phone: d.user?.phone || 'N/A',
                email: d.user?.email || 'N/A',
                licenseNumber: d.licenseNumber,
                isOnline: d.isOnline,
                rating: d.averageRating || 5.0
            }));

            return res.status(200).json({ success: true, drivers: formattedDrivers });
        } catch (error: any) {
            console.error('Error fetching available drivers:', error);
            return res.status(500).json({ success: false, message: 'Internal server error fetching drivers', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
