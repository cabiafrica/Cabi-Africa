import type { NextApiRequest, NextApiResponse } from 'next';
import { CONTACT_INFO, isValidContactPhone } from '@/config/contactConfig';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { purpose, date, timeSlot, fullName, phone, email, notes } = req.body ?? {};

    if (
        typeof purpose !== 'string' || !purpose.trim() ||
        typeof date !== 'string' || !date.trim() ||
        typeof timeSlot !== 'string' || !timeSlot.trim() ||
        typeof fullName !== 'string' || fullName.trim().length < 2 ||
        typeof phone !== 'string' || !isValidContactPhone(phone) ||
        typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            success: false,
            message: 'Please provide visit purpose, preferred date, time slot, name, valid phone number, and email.',
        });
    }

    const reference = `CABI-APT-${Math.floor(100000 + Math.random() * 900000)}`;

    return res.status(201).json({
        success: true,
        appointment: {
            reference,
            status: 'CONFIRMED',
            purpose: purpose.trim(),
            date: date.trim(),
            timeSlot: timeSlot.trim(),
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            notes: typeof notes === 'string' ? notes.trim() : '',
            officeLocation: CONTACT_INFO.officeName,
            createdAt: new Date().toISOString(),
        },
    });
}

