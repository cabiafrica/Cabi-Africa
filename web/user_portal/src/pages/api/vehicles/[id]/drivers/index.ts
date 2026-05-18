import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    }

    if (req.method === 'GET') {
        try {
            const drivers = await prisma.vehicleDriver.findMany({
                where: { vehicleId: id, isActive: true },
                include: {
                    driver: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    phone: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: { assignedAt: 'desc' }
            });

            return res.status(200).json({ success: true, drivers });
        } catch (error: any) {
            console.error('Error fetching vehicle drivers:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    if (req.method === 'POST') {
        const { driverProfileId } = req.body;

        if (!driverProfileId) {
            return res.status(400).json({ success: false, message: 'Driver Profile ID is required' });
        }

        try {
            // Check if already assigned
            const existingAssignment = await prisma.vehicleDriver.findFirst({
                where: { vehicleId: id, driverProfileId }
            });

            if (existingAssignment) {
                if (existingAssignment.isActive) {
                    return res.status(400).json({ success: false, message: 'Driver is already assigned to this vehicle' });
                } else {
                    // Reactivate
                    const reactivated = await prisma.vehicleDriver.update({
                        where: { id: existingAssignment.id },
                        data: { isActive: true, removedAt: null, assignedAt: new Date() },
                        include: {
                            driver: {
                                include: { user: { select: { fullName: true, phone: true } } }
                            }
                        }
                    });
                    return res.status(200).json({ success: true, message: 'Driver reassigned successfully', assignment: reactivated });
                }
            }

            const newAssignment = await prisma.vehicleDriver.create({
                data: {
                    vehicleId: id,
                    driverProfileId,
                    isActive: true
                },
                include: {
                    driver: {
                        include: { user: { select: { fullName: true, phone: true } } }
                    }
                }
            });

            return res.status(201).json({ success: true, message: 'Driver assigned successfully', assignment: newAssignment });
        } catch (error: any) {
            console.error('Error assigning driver:', error);
            return res.status(500).json({ success: false, message: 'Internal server error assigning driver', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
