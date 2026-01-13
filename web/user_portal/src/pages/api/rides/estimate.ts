import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { pickup, destination } = req.body;

    if (!pickup || !destination) {
        return res.status(400).json({ message: 'Pickup and destination are required' });
    }

    try {
        // In a real app, you would use a maps API to get distance.
        // Here we simulate some estimates.
        const distance = Math.random() * 10 + 2; // 2-12 km

        const estimates = [
            { id: 'v1', name: 'Standard', price: distance * 50 + 100, eta: Math.floor(Math.random() * 5) + 2, icon: '🚗' },
            { id: 'v2', name: 'Comfort', price: distance * 70 + 150, eta: Math.floor(Math.random() * 7) + 3, icon: '✨' },
            { id: 'v3', name: 'XL', price: distance * 100 + 200, eta: Math.floor(Math.random() * 10) + 5, icon: '🚙' },
            { id: 'v4', name: 'Green', price: distance * 55 + 120, eta: Math.floor(Math.random() * 6) + 3, icon: '🌱' },
        ];

        return res.status(200).json(estimates);
    } catch (error) {
        console.error('Estimate error:', error);
        return res.status(500).json({ message: 'Failed to get estimates' });
    }
}
