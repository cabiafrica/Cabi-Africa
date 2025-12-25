import type { NextApiRequest, NextApiResponse } from 'next';

export interface AppStats {
  activeDrivers: number;
  completedTrips: number;
  happyPassengers: number;
}

const mockStats: AppStats = {
  activeDrivers: 1250,
  completedTrips: 450321,
  happyPassengers: 8900,
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AppStats>
) {
  // Simulate a network delay to show loading states
  setTimeout(() => {
    res.status(200).json(mockStats);
  }, 500);
}