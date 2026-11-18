import nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const OTP_TTL_MS = 10 * 60 * 1000;

function getJwtSecret(): string {
    return (
        process.env.JWT_SECRET ||
        (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '')
    );
}

export async function sendEmailMessage(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{ filename: string; content: string; contentType?: string }>;
}): Promise<{ delivered: boolean; mode: 'smtp' | 'sandbox' }> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || 'CABI Africa <no-reply@cabi.africa>';

    if (!host || !user || !pass) {
        console.log(`[Email Sandbox] To: ${params.to} | Subject: ${params.subject}\n${params.text || ''}`);
        return { delivered: true, mode: 'sandbox' };
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    await transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
        attachments: params.attachments,
    });

    return { delivered: true, mode: 'smtp' };
}

export async function sendSmsMessage(
    phone: string,
    message: string
): Promise<{ delivered: boolean; mode: 'africastalking' | 'sandbox' }> {
    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;
    const senderId = process.env.AT_SENDER_ID || 'CABI';

    if (!username || !apiKey) {
        console.log(`[SMS Sandbox] To: ${phone} | Message: ${message}`);
        return { delivered: true, mode: 'sandbox' };
    }

    const body = new URLSearchParams({
        username,
        to: phone,
        message,
        from: senderId,
    });

    const res = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            apiKey,
        },
        body: body.toString(),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn('AfricaTalking SMS failed, falling back to log:', res.status, errText);
        return { delivered: false, mode: 'sandbox' };
    }

    return { delivered: true, mode: 'africastalking' };
}

export async function generateAndStoreOtp(identifier: string, purpose: string): Promise<string> {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const key = `otp:${purpose}:${identifier.trim().toLowerCase()}`;
    const value = JSON.stringify({
        code,
        expiresAt: Date.now() + OTP_TTL_MS,
    });

    await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });

    return code;
}

export async function verifyStoredOtp(
    identifier: string,
    purpose: string,
    code: string,
    consume = true
): Promise<boolean> {
    const key = `otp:${purpose}:${identifier.trim().toLowerCase()}`;
    const record = await prisma.setting.findUnique({ where: { key } });
    if (!record) return false;

    try {
        const parsed = (typeof record.value === 'string' ? JSON.parse(record.value) : record.value) as { code: string; expiresAt: number };
        if (Date.now() > parsed.expiresAt) {
            if (consume) await prisma.setting.delete({ where: { key } }).catch(() => undefined);
            return false;
        }
        const match = parsed.code === code.trim();
        if (match && consume) {
            await prisma.setting.delete({ where: { key } }).catch(() => undefined);
        }
        return match;
    } catch {
        return false;
    }
}

export function createPasswordResetToken(userId: string, email: string): string {
    const secret = getJwtSecret();
    if (!secret) throw new Error('JWT_SECRET is not configured');
    return jwt.sign({ sub: userId, email, purpose: 'password_reset' }, secret, { expiresIn: '1h' });
}

export function verifyPasswordResetToken(token: string): { sub: string; email: string } | null {
    const secret = getJwtSecret();
    if (!secret) return null;
    try {
        const decoded = jwt.verify(token, secret) as { sub: string; email: string; purpose?: string };
        if (decoded.purpose !== 'password_reset') return null;
        return { sub: decoded.sub, email: decoded.email };
    } catch {
        return null;
    }
}
