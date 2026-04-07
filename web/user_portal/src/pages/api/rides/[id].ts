import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Missing or invalid trip ID' });
    }

    try {
        const ride = await prisma.ride.findUnique({
            where: {
                id: id,
            },
            include: {
                driver: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                phone: true,
                                // Intentionally excluding sensitive data like password
                            }
                        },
                        vehicles: true
                    }
                },
                passenger: {
                    select: {
                        fullName: true,
                        phone: true,
                    }
                }
            }
        });

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Transform data for frontend if necessary, or return as is
        // The frontend expects: 
        // status, eta (calc?), driver { name, rating, vehicle, plate, phone }, 
        // pickup { address, position }, dropoff { address, position }, currentLocation, package?

        const start = ride.pickupLocation as any;
        const end = ride.dropoffLocation as any;
        const driverProfile = ride.driver;
        const vehicle = driverProfile?.vehicles?.[0];

        const responseData = {
            id: ride.id,
            status: ride.status,
            eta: ride.duration ? `${ride.duration} mins` : 'Calculating...', // This is total duration, not ETA. ETA needs current driver loc vs pickup/dropoff.
            driver: driverProfile ? {
                name: driverProfile.user.fullName,
                rating: 4.9, // Mock rating as it is not in schema directly yet (could be aggregated)
                vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle',
                plate: vehicle?.plateNumber || 'Unknown Plate',
                phone: driverProfile.user.phone
            } : null,
            pickup: {
                address: start?.address || 'Unknown Pickup',
                position: [start?.lat || 0, start?.lng || 0]
            },
            dropoff: {
                address: end?.address || 'Unknown Destination',
                position: [end?.lat || 0, end?.lng || 0]
            },
            currentLocation: driverProfile?.currentLocation || { lat: start?.lat || 0, lng: start?.lng || 0 }, // Fallback to pickup if no driver loc
            fare: ride.fare,
            distance: ride.distance
        };

        return res.status(200).json(responseData);
    } catch (error) {
        console.error('Fetch ride details error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
