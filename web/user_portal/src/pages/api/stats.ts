import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
    activeDrivers: number;
    completedTrips: number;
    happyPassengers: number;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    res.status(200).json({
        activeDrivers: 540,
        completedTrips: 15420,
        happyPassengers: 14890
    });
}
