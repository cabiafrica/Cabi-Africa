import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

/**
 * Airtel Money Africa v2 Asynchronous Callback Webhook
 * Receives collection & disbursement status notifications from Airtel Africa.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const payload = req.body ?? {};
    const tx = payload.transaction || {};
    const transactionId = tx.id || payload.transactionId;
    const statusCode = tx.status_code || payload.status_code || 'TS';
    const message = tx.message || payload.message || 'Callback received';

    if (transactionId) {
        try {
            await prisma.setting.upsert({
                where: { key: `airtel_callback:${transactionId}` },
                update: {
                    value: JSON.stringify({
                        transactionId,
                        statusCode,
                        message,
                        payload,
                        receivedAt: new Date().toISOString(),
                    }),
                },
                create: {
                    key: `airtel_callback:${transactionId}`,
                    value: JSON.stringify({
                        transactionId,
                        statusCode,
                        message,
                        payload,
                        receivedAt: new Date().toISOString(),
                    }),
                },
            });
        } catch (err) {
            console.warn('Airtel callback DB log fallback:', (err as Error).message);
        }
    }

    return res.status(200).json({ status: 'OK', transactionId: transactionId || null });
}
