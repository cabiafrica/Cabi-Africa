import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { driverProfileId, fleetManagerId, isShared } = req.query;

        try {
            const whereClause: any = {};

            if (driverProfileId) {
                // Find vehicles where this driver is either the primary driver or assigned in VehicleDriver junction
                whereClause.OR = [
                    { driverProfileId: driverProfileId as string },
                    { vehicleDrivers: { some: { driverProfileId: driverProfileId as string, isActive: true } } }
                ];
            }

            if (fleetManagerId) {
                whereClause.fleetManagerId = fleetManagerId as string;
            }

            if (isShared !== undefined) {
                whereClause.isShared = isShared === 'true';
            }

            const vehicles = await prisma.vehicle.findMany({
                where: whereClause,
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
                                    phone: true,
                                    email: true
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
                        where: { status: 'ACTIVE' },
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
                        include: {
                            benefit: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            return res.status(200).json({ success: true, vehicles });
        } catch (error: any) {
            console.error('Error fetching vehicles:', error);
            return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
