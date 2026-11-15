import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const body = req.body ?? {};
        const callbackData = body?.Body?.stkCallback;

        if (!callbackData) {
            console.warn('Invalid M-Pesa callback body received:', body);
            return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
        }

        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata,
        } = callbackData;

        console.log('M-Pesa STK Callback received:', {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
        });

        if (ResultCode === 0 && CallbackMetadata?.Item) {
            const items = CallbackMetadata.Item as Array<{ Name: string; Value: any }>;
            const mpesaReceipt = items.find((i) => i.Name === 'MpesaReceiptNumber')?.Value;
            const amountPaid = items.find((i) => i.Name === 'Amount')?.Value;
            const transactionDate = items.find((i) => i.Name === 'TransactionDate')?.Value;
            const phoneNumber = items.find((i) => i.Name === 'PhoneNumber')?.Value;

            console.log('Payment successful:', {
                mpesaReceipt,
                amountPaid,
                transactionDate,
                phoneNumber,
            });

            // Find matching ride if stored or reference matches
            // In production, update the ride settlement status to PAID
        } else {
            console.warn('M-Pesa payment was not completed:', ResultDesc);
        }

        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } catch (error: any) {
        console.error('Error handling M-Pesa callback:', error);
        return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
}
