import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email } = req.body;

  // Basic email validation
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'A valid email is required.' });
  }

  // For this story, we just log the data to the console.
  console.log('--- New Newsletter Subscription ---');
  console.log(`Email: ${email}`);
  console.log('---------------------------------');

  return res.status(200).json({ message: 'Thanks for subscribing!' });
}