import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid vehicle ID' });
    }

    if (req.method === 'GET') {
        try {
            const vehicle = await prisma.vehicle.findUnique({
                where: { id },
                include: {
                    driver_profiles: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    phone: true,
                                    email: true
                                }
                            }
                        }
                    },
                    fleetManager: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    vehicleDrivers: {
                        where: { isActive: true },
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
                        }
                    },
                    vehicleShifts: {
                        orderBy: { startedAt: 'desc' },
                        take: 10,
                        include: {
                            driver: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    benefitClaims: {
                        orderBy: { reportedAt: 'desc' },
                        include: {
                            benefit: true,
                            driver: {
                                include: {
                                    user: {
                                        select: {
                                            fullName: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!vehicle) {
                return res.status(404).json({ success: false, message: 'Vehicle not found' });
            }

            // Compute unlocked qualifications
            const approvedBenefitIds = new Set(
                vehicle.benefitClaims
                    .filter((c: { status: string }) => c.status === 'APPROVED')
                    .map((c: { benefitId: string }) => c.benefitId)
            );

            const allQualifications = await prisma.vehicleQualification.findMany({
                where: { isActive: true },
                include: { requirements: true }
            });

            const unlockedQualifications = allQualifications.filter((q: { requirements: any[] }) => {
                if (!q.requirements || q.requirements.length === 0) return false;
                return q.requirements.every((req: { benefitId: string }) => approvedBenefitIds.has(req.benefitId));
            });

            return res.status(200).json({ success: true, vehicle, unlockedQualifications });
        } catch (error: any) {
            console.error('Error fetching vehicle details:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        const { isShared, fleetManagerId, usage, capacity } = req.body;

        try {
            const updatedVehicle = await prisma.vehicle.update({
                where: { id },
                data: {
                    ...(isShared !== undefined && { isShared: Boolean(isShared) }),
                    ...(fleetManagerId !== undefined && { fleetManagerId }),
                    ...(usage !== undefined && { usage }),
                    ...(capacity !== undefined && { capacity: Number(capacity) })
                }
            });

            return res.status(200).json({ success: true, vehicle: updatedVehicle });
        } catch (error: any) {
            console.error('Error updating vehicle:', error);
            return res.status(500).json({ success: false, message: 'Internal server error updating vehicle', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
