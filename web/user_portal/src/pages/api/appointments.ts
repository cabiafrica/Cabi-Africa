import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { CONTACT_INFO, isValidContactPhone } from '@/config/contactConfig';
import { buildAppointmentIcs, getSlotsForDate } from '@/lib/appointmentSlots';
import { sendEmailMessage } from '@/lib/otpService';

async function getBookedForDate(dateStr: string): Promise<Array<{ timeSlot: string; reference: string }>> {
    try {
        const record = await prisma.setting.findUnique({ where: { key: `appointments:${dateStr}` } });
        if (!record) return [];
        return (typeof record.value === 'string' ? JSON.parse(record.value) : record.value) as Array<{ timeSlot: string; reference: string }>;
    } catch {
        return [];
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const dateStr = String(req.query.date || '').trim();
        if (!dateStr) {
            return res.status(400).json({ success: false, message: 'date query parameter is required.' });
        }
        const schedule = getSlotsForDate(dateStr);
        const booked = await getBookedForDate(dateStr);
        const bookedSet = new Set(booked.map((b) => b.timeSlot));

        return res.status(200).json({
            success: true,
            date: dateStr,
            isClosed: schedule.isClosed,
            reason: schedule.reason,
            slots: schedule.slots.map((s) => ({
                ...s,
                available: !bookedSet.has(s.value),
            })),
        });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['GET', 'POST']);
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

    const cleanDate = date.trim();
    const cleanSlot = timeSlot.trim();
    const schedule = getSlotsForDate(cleanDate);
    if (schedule.isClosed) {
        return res.status(400).json({ success: false, message: schedule.reason || 'Office is closed on this date.' });
    }

    const validSlot = schedule.slots.find((s) => s.value === cleanSlot || s.label === cleanSlot);
    if (!validSlot) {
        return res.status(400).json({
            success: false,
            message: 'Selected time slot is outside working hours (Mon–Fri 8am–4pm, Sat 8am–12:30pm).',
        });
    }

    const existingBookings = await getBookedForDate(cleanDate);
    if (existingBookings.some((b) => b.timeSlot === validSlot.value)) {
        return res.status(409).json({
            success: false,
            message: 'This 30-minute slot has just been booked. Please select another available slot.',
        });
    }

    const reference = `CABI-APT-${Math.floor(100000 + Math.random() * 900000)}`;
    const appointment = {
        reference,
        status: 'CONFIRMED',
        purpose: purpose.trim(),
        date: cleanDate,
        timeSlot: validSlot.label,
        slotValue: validSlot.value,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: typeof notes === 'string' ? notes.trim() : '',
        officeLocation: CONTACT_INFO.officeName,
        durationMinutes: 30,
        createdAt: new Date().toISOString(),
    };

    try {
        const updated = [...existingBookings, { timeSlot: validSlot.value, reference }];
        await prisma.setting.upsert({
            where: { key: `appointments:${cleanDate}` },
            update: { value: JSON.stringify(updated) },
            create: { key: `appointments:${cleanDate}`, value: JSON.stringify(updated) },
        });
    } catch (err) {
        console.warn('Could not persist appointment slot:', err);
    }

    const icsContent = buildAppointmentIcs({
        reference,
        purpose: appointment.purpose,
        date: cleanDate,
        timeSlot: validSlot.value,
        fullName: appointment.fullName,
        email: appointment.email,
        officeLocation: appointment.officeLocation,
    });

    try {
        await sendEmailMessage({
            to: appointment.email,
            subject: `Appointment Confirmed (${reference}) — CABI Africa`,
            text: `Hello ${appointment.fullName},\n\nYour 30-minute appointment is confirmed.\nReference: ${reference}\nPurpose: ${appointment.purpose}\nDate: ${cleanDate}\nTime: ${validSlot.label}\nLocation: ${appointment.officeLocation}\n\nA calendar invite (.ics) is attached.`,
            html: `<div style="font-family:sans-serif;padding:24px;background:#0a0a0c;color:#f8fafc;border-radius:12px;">
                <h2 style="color:#d4af37;margin:0 0 12px;">Appointment Confirmed</h2>
                <p>Hello <strong>${appointment.fullName}</strong>,</p>
                <p>Your 30-minute office appointment at <strong>${appointment.officeLocation}</strong> is confirmed:</p>
                <ul>
                    <li><strong>Reference:</strong> ${reference}</li>
                    <li><strong>Purpose:</strong> ${appointment.purpose}</li>
                    <li><strong>Date:</strong> ${cleanDate}</li>
                    <li><strong>Time Slot:</strong> ${validSlot.label} (30 mins)</li>
                </ul>
                <p style="font-size:12px;color:#94a3b8;">A calendar invite (.ics) is attached to add this to your calendar.</p>
            </div>`,
            attachments: [
                {
                    filename: `cabi-appointment-${reference}.ics`,
                    content: icsContent,
                    contentType: 'text/calendar; charset=utf-8; method=REQUEST',
                },
            ],
        });
    } catch (emailErr) {
        console.warn('Appointment confirmation email failed:', emailErr);
    }

    return res.status(201).json({
        success: true,
        emailSent: true,
        icsContent,
        appointment,
    });
}
