import { NextApiRequest, NextApiResponse } from 'next';
import * as jwt from 'jsonwebtoken';

function extractCallerUser(req: NextApiRequest): { sub?: string; id?: string; role?: string } | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
    if (!secret) return null;
    try {
        return jwt.verify(token, secret) as any;
    } catch {
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const caller = extractCallerUser(req);
    if (!caller) {
        return res.status(401).json({ message: 'Authentication required to book a ride' });
    }

    const { pickupLocation, dropoffLocation, vehicleType, fare, passengerId } = req.body;
    const callerId = caller.sub || caller.id;
    const effectivePassengerId = (caller.role === 'ADMIN' || caller.role === 'DISPATCHER') ? (passengerId || callerId) : callerId;

    if (!pickupLocation || !dropoffLocation || !vehicleType || !effectivePassengerId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const numericFare = Number(fare ?? 0);
    if (!Number.isFinite(numericFare) || numericFare < 0) {
        return res.status(400).json({ message: 'Fare must be a valid non-negative number' });
    }

    try {
        const rawDispatchUrl =
            process.env.DISPATCH_SERVICE_URL ||
            process.env.NEXT_PUBLIC_DISPATCH_SERVICE_URL ||
            'http://127.0.0.1:3334/api';
        const cleanBaseUrl = rawDispatchUrl.replace(/\/+$/, '');
        const targetUrl = cleanBaseUrl.endsWith('/api') ? `${cleanBaseUrl}/rides` : `${cleanBaseUrl}/api/rides`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                passengerId: effectivePassengerId,
                pickupLocation,
                dropoffLocation,
                vehicleType,
                fare: numericFare,
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
