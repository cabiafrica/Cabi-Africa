import type { NextApiRequest, NextApiResponse } from 'next';

const DEFAULT_CATEGORIES = [
    {
        category: 'BODA',
        displayName: 'Boda Boda',
        baseFare: 50.0,
        perKmRate: 25.0,
        perMinuteRate: 2.0,
        minimumFare: 50.0,
        roundingStep: 10,
    },
    {
        category: 'BASIC',
        displayName: 'Cabi Basic',
        baseFare: 100.0,
        perKmRate: 35.0,
        perMinuteRate: 3.0,
        minimumFare: 100.0,
        roundingStep: 25,
    },
    {
        category: 'STANDARD',
        displayName: 'Cabi Standard',
        baseFare: 150.0,
        perKmRate: 45.0,
        perMinuteRate: 5.0,
        minimumFare: 150.0,
        roundingStep: 50,
    },
    {
        category: 'XL',
        displayName: 'Cabi XL',
        baseFare: 250.0,
        perKmRate: 65.0,
        perMinuteRate: 7.0,
        minimumFare: 250.0,
        roundingStep: 50,
    },
    {
        category: 'PREMIUM',
        displayName: 'Cabi Premium',
        baseFare: 300.0,
        perKmRate: 85.0,
        perMinuteRate: 10.0,
        minimumFare: 300.0,
        roundingStep: 50,
    },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(DEFAULT_CATEGORIES);
}
