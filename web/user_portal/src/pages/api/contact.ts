import type { NextApiRequest, NextApiResponse } from 'next';
import { isValidContactPhone } from '@/config/contactConfig';

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

  const { name, phone, email, issue, subject, message } = req.body ?? {};
  const resolvedSubject =
    typeof subject === 'string' && subject.trim()
      ? subject.trim()
      : typeof issue === 'string'
        ? issue.trim()
        : '';

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof phone !== 'string' || !isValidContactPhone(phone) ||
    typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof issue !== 'string' || !issue.trim() ||
    !resolvedSubject ||
    typeof message !== 'string' || !message.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please provide your name, valid phone number, email, issue category, and message.',
    });
  }

  return res.status(200).json({
    success: true,
    message: "Thank you for reaching out. Our concierge team will call or message you shortly.",
  });
}

