import { NextApiRequest, NextApiResponse } from 'next';

interface Coords {
    lat: number;
    lng: number;
}

function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

function haversineKm(a: Coords, b: Coords): number {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h =
        sinLat * sinLat +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function buildPolyline(a: Coords, b: Coords): [number, number][] {
    const midLat = (a.lat + b.lat) / 2 + (b.lng - a.lng) * 0.08;
    const midLng = (a.lng + b.lng) / 2 - (b.lat - a.lat) * 0.08;
    return [
        [a.lat, a.lng],
        [midLat, midLng],
        [b.lat, b.lng],
    ];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { pickup, destination, pickupCoords, dropoffCoords, includeTrajectory } = req.body ?? {};

    if (!pickup || !destination) {
        return res.status(400).json({ message: 'Pickup and destination are required' });
    }

    try {
        const start: Coords =
            pickupCoords && Number.isFinite(Number(pickupCoords.lat)) && Number.isFinite(Number(pickupCoords.lng))
                ? { lat: Number(pickupCoords.lat), lng: Number(pickupCoords.lng) }
                : { lat: -1.286389, lng: 36.817223 };

        const end: Coords =
            dropoffCoords && Number.isFinite(Number(dropoffCoords.lat)) && Number.isFinite(Number(dropoffCoords.lng))
                ? { lat: Number(dropoffCoords.lat), lng: Number(dropoffCoords.lng) }
                : { lat: -1.2655, lng: 36.8048 };

        const rawKm = haversineKm(start, end);
        const distanceKm = Number(Math.max(2.4, rawKm * 1.22).toFixed(1));
        const durationMin = Math.max(8, Math.round(distanceKm * 2.6));

        const estimates = [
            { id: 'boda', name: 'Cabi Boda', price: Math.round(distanceKm * 35 + 80), eta: 3, icon: '🏍️' },
            { id: 'cabigo', name: 'CabiGo', price: Math.round(distanceKm * 55 + 150), eta: 4, icon: '🚗' },
            { id: 'executive', name: 'Executive Suite', price: Math.round(distanceKm * 95 + 300), eta: 6, icon: '✨' },
            { id: 'xl', name: 'Diplomatic XL', price: Math.round(distanceKm * 130 + 450), eta: 8, icon: '🚙' },
        ];

        if (includeTrajectory) {
            return res.status(200).json({
                estimates,
                trajectory: {
                    distanceKm,
                    durationMin,
                    pickupCoords: start,
                    dropoffCoords: end,
                    polyline: buildPolyline(start, end),
                },
            });
        }

        return res.status(200).json(estimates);
    } catch (error) {
        console.error('Estimate error:', error);
        return res.status(500).json({ message: 'Failed to get estimates' });
    }
}
