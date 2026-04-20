import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'user-portal'
  });
}
