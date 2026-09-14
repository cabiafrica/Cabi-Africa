import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

const IS_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEMO_VEHICLES = [
    {
        id: 'demo-v-1',
        plateNumber: 'KDA 789B',
        make: 'Toyota',
        model: 'Fielder Hybrid',
        year: 2021,
        color: 'Pearl White',
        status: 'ACTIVE',
        usage: 'COMMERCIAL',
        isShared: true,
        dailyTarget: 3500,
        driver_profiles: {
            user: {
                fullName: 'Samuel Mwangi',
                phone: '+254712345678',
                email: 'samuel.mwangi@cabi.africa'
            }
        },
        vehicleDrivers: [
            { id: 'vd-1', driverProfileId: 'dp-1', isActive: true },
            { id: 'vd-2', driverProfileId: 'dp-2', isActive: true }
        ],
        vehicleShifts: [
            {
                id: 'vs-1',
                status: 'ACTIVE',
                startTime: new Date(Date.now() - 3 * 3600000).toISOString(),
                driver: {
                    user: {
                        firstName: 'Samuel',
                        lastName: 'Mwangi',
                        fullName: 'Samuel Mwangi'
                    }
                }
            }
        ],
        benefitClaims: [
            { id: 'bc-1', benefitId: 'b-1', status: 'APPROVED' }
        ]
    },
    {
        id: 'demo-v-2',
        plateNumber: 'KDJ 412C',
        make: 'Nissan',
        model: 'Note e-Power',
        year: 2022,
        color: 'Metallic Silver',
        status: 'ACTIVE',
        usage: 'COMMERCIAL',
        isShared: true,
        dailyTarget: 3200,
        driver_profiles: null,
        vehicleDrivers: [
            { id: 'vd-3', driverProfileId: 'dp-3', isActive: true }
        ],
        vehicleShifts: [],
        benefitClaims: []
    },
    {
        id: 'demo-v-3',
        plateNumber: 'KDF 654X',
        make: 'Mazda',
        model: 'Demio SkyActiv',
        year: 2020,
        color: 'Navy Blue',
        status: 'ACTIVE',
        usage: 'COMMERCIAL',
        isShared: false,
        dailyTarget: 2800,
        driver_profiles: {
            user: {
                fullName: 'Faith Chebet',
                phone: '+254723456789',
                email: 'faith.chebet@cabi.africa'
            }
        },
        vehicleDrivers: [
            { id: 'vd-4', driverProfileId: 'dp-4', isActive: true }
        ],
        vehicleShifts: [
            {
                id: 'vs-2',
                status: 'ACTIVE',
                startTime: new Date(Date.now() - 5 * 3600000).toISOString(),
                driver: {
                    user: {
                        firstName: 'Faith',
                        lastName: 'Chebet',
                        fullName: 'Faith Chebet'
                    }
                }
            }
        ],
        benefitClaims: [
            { id: 'bc-2', benefitId: 'b-2', status: 'PENDING' }
        ]
    }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { driverProfileId, fleetManagerId, isShared } = req.query;

        try {
            const whereClause: any = {};

            if (driverProfileId) {
                if (typeof driverProfileId === 'string' && IS_UUID.test(driverProfileId)) {
                    whereClause.OR = [
                        { driverProfileId: driverProfileId },
                        { vehicleDrivers: { some: { driverProfileId: driverProfileId, isActive: true } } }
                    ];
                }
            }

            if (fleetManagerId) {
                if (typeof fleetManagerId === 'string' && IS_UUID.test(fleetManagerId)) {
                    whereClause.fleetManagerId = fleetManagerId;
                } else {
                    // Non-UUID fleetManagerId (e.g. 'mock-fleet-manager-1' / demo mode)
                    return res.status(200).json({ success: true, vehicles: DEMO_VEHICLES });
                }
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

            // If empty, return gracefully
            return res.status(200).json({ success: true, vehicles });
        } catch (error: any) {
            console.error('Error fetching vehicles, falling back to demo fleet:', error);
            return res.status(200).json({ success: true, vehicles: DEMO_VEHICLES, fallback: true });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
