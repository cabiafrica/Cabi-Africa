/**
 * Cabi Africa - Safaricom Daraja M-Pesa Integration Utility
 * Handles OAuth Token Generation, STK Push (Lipa Na M-Pesa Online), and Callbacks
 */

export interface StkPushParams {
    phone: string;
    amount: number;
    accountReference: string;
    transactionDesc?: string;
}

export interface StkPushResponse {
    success: boolean;
    merchantRequestId?: string;
    checkoutRequestId?: string;
    responseCode?: string;
    responseDescription?: string;
    customerMessage?: string;
    error?: string;
}

function getMpesaBaseUrl(): string {
    const env = process.env.MPESA_ENVIRONMENT || 'sandbox';
    return env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
}

function normalizeMsisdn(phone: string): string {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('254')) return clean;
    if (clean.startsWith('0')) return `254${clean.slice(1)}`;
    if (clean.length === 9) return `254${clean}`;
    return clean;
}

export async function getDarajaAccessToken(): Promise<string> {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error('Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET in environment variables');
    }

    const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const baseUrl = getMpesaBaseUrl();

    const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
            Authorization: `Basic ${authHeader}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate M-Pesa access token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function initiateStkPush({
    phone,
    amount,
    accountReference,
    transactionDesc = 'Cabi Africa Trip Fare',
}: StkPushParams): Promise<StkPushResponse> {
    try {
        const token = await getDarajaAccessToken();
        const shortCode = process.env.MPESA_SHORTCODE || '174379';
        const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
        const callbackUrl =
            process.env.MPESA_CALLBACK_URL ||
            'https://www.cabi.africa/api/payments/mpesa/callback';

        const now = new Date();
        const timestamp = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
            String(now.getHours()).padStart(2, '0'),
            String(now.getMinutes()).padStart(2, '0'),
            String(now.getSeconds()).padStart(2, '0'),
        ].join('');

        const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
        const formattedPhone = normalizeMsisdn(phone);
        const integerAmount = Math.max(1, Math.round(Number(amount) || 1));

        const baseUrl = getMpesaBaseUrl();
        const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: integerAmount,
                PartyA: formattedPhone,
                PartyB: shortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: callbackUrl,
                AccountReference: accountReference.slice(0, 12),
                TransactionDesc: transactionDesc.slice(0, 32),
            }),
        });

        const data = await response.json();

        if (response.ok && data.ResponseCode === '0') {
            return {
                success: true,
                merchantRequestId: data.MerchantRequestID,
                checkoutRequestId: data.CheckoutRequestID,
                responseCode: data.ResponseCode,
                responseDescription: data.ResponseDescription,
                customerMessage: data.CustomerMessage,
            };
        }

        return {
            success: false,
            responseCode: data.ResponseCode,
            responseDescription: data.ResponseDescription,
            customerMessage: data.errorMessage || data.ResponseDescription,
            error: data.errorMessage || 'STK Push failed',
        };
    } catch (error: any) {
        console.error('M-Pesa STK Push error:', error);
        return {
            success: false,
            error: error.message || 'Unknown M-Pesa error',
        };
    }
}
