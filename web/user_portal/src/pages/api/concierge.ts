import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { extractCallerUser } from '@/lib/serverAuth';

const CONCIERGE_KEY = 'driver_concierge:requests';

interface ConciergeTicket {
    id: string;
    userId?: string;
    category: string;
    subject: string;
    message: string;
    driverPhone: string;
    status: string;
    createdAt: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const caller = extractCallerUser(req);

    if (req.method === 'GET') {
        const record = await prisma.setting.findUnique({ where: { key: CONCIERGE_KEY } });
        const allRequests: ConciergeTicket[] = record
            ? (typeof record.value === 'string' ? JSON.parse(record.value) : record.value)
            : [];

        // Admin or Dispatcher sees all tickets
        if (caller && (caller.role === 'ADMIN' || caller.role === 'DISPATCHER')) {
            return res.status(200).json({ success: true, requests: allRequests });
        }

        // Authenticated driver/user only sees their own tickets
        if (caller) {
            const callerId = caller.sub || caller.id;
            const callerPhone = caller.phone ? caller.phone.trim() : null;

            const userRequests = allRequests.filter(
                (t) => (t.userId && t.userId === callerId) || (callerPhone && t.driverPhone === callerPhone)
            );
            return res.status(200).json({ success: true, requests: userRequests });
        }

        // Unauthenticated callers cannot see any tickets (prevent PII leakage)
        const queryPhone = typeof req.query.phone === 'string' ? req.query.phone.trim() : null;
        if (!queryPhone) {
            return res.status(200).json({
                success: true,
                requests: [],
                message: 'Sign in to view your submitted support tickets.',
            });
        }

        // Return empty for unauthenticated queries to prevent phone number probing
        return res.status(200).json({
            success: true,
            requests: [],
            message: 'Sign in with your driver account to view tickets associated with this phone.',
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { category, subject, message, driverPhone } = req.body ?? {};
    if (!subject || !message) {
        return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    const cleanPhone = String(driverPhone || caller?.phone || '').trim();
    if (!cleanPhone && !caller) {
        return res.status(400).json({ success: false, message: 'Driver contact phone number is required.' });
    }

    const record = await prisma.setting.findUnique({ where: { key: CONCIERGE_KEY } });
    const existing: ConciergeTicket[] = record
        ? (typeof record.value === 'string' ? JSON.parse(record.value) : record.value)
        : [];

    const ticket: ConciergeTicket = {
        id: `CON-${Date.now().toString().slice(-6)}`,
        userId: caller ? caller.sub || caller.id : undefined,
        category: String(category || 'GENERAL_CONCIERGE'),
        subject: String(subject).trim(),
        message: String(message).trim(),
        driverPhone: cleanPhone,
        status: 'ASSIGNED_TO_CONCIERGE',
        createdAt: new Date().toISOString(),
    };

    existing.unshift(ticket);
    await prisma.setting.upsert({
        where: { key: CONCIERGE_KEY },
        update: { value: JSON.stringify(existing) },
        create: { key: CONCIERGE_KEY, value: JSON.stringify(existing) },
    });

    return res.status(201).json({
        success: true,
        ticket,
        message: 'Driver Concierge ticket created. A dedicated specialist will contact you shortly.',
    });
}
