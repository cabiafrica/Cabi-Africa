import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { pickupLocation, dropoffLocation, vehicleType, fare, passengerId } = req.body;

    if (!pickupLocation || !dropoffLocation || !vehicleType || !passengerId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const DISPATCH_SERVICE_URL = process.env.NEXT_PUBLIC_DISPATCH_SERVICE_URL || process.env.DISPATCH_SERVICE_URL || 'http://localhost:3334/api';
        
        const response = await fetch(`${DISPATCH_SERVICE_URL}/rides`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                passengerId,
                pickupLocation,
                dropoffLocation,
                vehicleType,
                fare: fare ?? 0,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Dispatch service error:', errorData);
            return res.status(response.status).json({ message: errorData.message || 'Failed to book ride via dispatch service' });
        }

        const ride = await response.json();
        return res.status(201).json(ride);
    } catch (error) {
        console.error('Booking error:', error);
        return res.status(500).json({ message: 'Failed to connect to dispatch service' });
    }
}
