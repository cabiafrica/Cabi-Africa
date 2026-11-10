import type { NextApiRequest, NextApiResponse } from 'next';

interface ContactResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body ?? {};

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof subject !== 'string' || !subject.trim() ||
    typeof message !== 'string' || !message.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid name, email, subject, and message.',
    });
  }

  return res.status(200).json({
    success: true,
    message: "Thank you for your message. Our concierge team will respond shortly.",
  });
}

