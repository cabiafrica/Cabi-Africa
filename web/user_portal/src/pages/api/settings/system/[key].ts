import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query;

  if (req.method === 'GET') {
    try {
      const base =
        process.env.DISPATCH_SERVICE_URL?.replace(/\/api\/?$/, '') ||
        (process.env.NODE_ENV === 'production'
          ? 'https://dispatch-service-746659778850.us-central1.run.app'
          : 'http://localhost:3334');
      const response = await fetch(`${base}/settings/system/${key}`);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error('Settings API Error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
