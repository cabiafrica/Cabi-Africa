import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, RideStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { pickup, destination, vehicleType, fare, passengerId } = req.body;

    if (!pickup || !destination || !vehicleType || !fare || !passengerId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const ride = await prisma.ride.create({
            data: {
                passengerId,
                pickupLocation: pickup,
                dropoffLocation: destination,
                status: RideStatus.REQUESTED,
                fare: fare,
                // In a real app, distance and other fields would be calculated
                distance: 5.0,
            }
        });

        return res.status(201).json(ride);
    } catch (error) {
        console.error('Booking error:', error);
        return res.status(500).json({ message: 'Failed to book ride' });
    }
}
