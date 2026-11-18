/**
 * Cabi Africa - Airtel Money Open API v2 Integration Adapter
 * Supports Collection (USSD Push) and Instant Disbursement (B2C Payouts)
 * with configurable environment variables and sandbox/mock fallback.
 */

export interface AirtelPaymentParams {
    phone: string;
    amount: number;
    reference: string;
    transactionId?: string;
}

export interface AirtelResponse {
    success: boolean;
    mode: 'live' | 'sandbox_mock';
    transactionId: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    message: string;
}

function getAirtelBaseUrl(): string {
    const env = process.env.AIRTEL_ENVIRONMENT || 'sandbox';
    return env === 'production'
        ? 'https://openapi.airtel.africa'
        : 'https://openapiuat.airtel.africa';
}

export function normalizeAirtelMsisdn(phone: string): string {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('254')) return clean.slice(3);
    if (clean.startsWith('0')) return clean.slice(1);
    return clean;
}

async function getAirtelAccessToken(): Promise<string | null> {
    const clientId = process.env.AIRTEL_CLIENT_ID;
    const clientSecret = process.env.AIRTEL_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const res = await fetch(`${getAirtelBaseUrl()}/auth/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
        }),
    });

    if (!res.ok) {
        throw new Error(`Airtel OAuth failed: ${res.status}`);
    }
    const data = await res.json();
    return data.access_token || null;
}

export async function initiateAirtelCollection(params: AirtelPaymentParams): Promise<AirtelResponse> {
    const txId = params.transactionId || `AIR-COL-${Date.now()}`;
    const msisdn = normalizeAirtelMsisdn(params.phone);
    const country = process.env.AIRTEL_COUNTRY || 'KE';
    const currency = process.env.AIRTEL_CURRENCY || 'KES';

    try {
        const token = await getAirtelAccessToken();
        if (!token) {
            console.log(`[Airtel Money Sandbox] Collection USSD Push -> +254${msisdn}, ${currency} ${params.amount}, Ref: ${params.reference}`);
            return {
                success: true,
                mode: 'sandbox_mock',
                transactionId: txId,
                status: 'SUCCESS',
                message: `Airtel Money USSD prompt simulated for +254${msisdn} (${currency} ${params.amount}).`,
            };
        }

        const res = await fetch(`${getAirtelBaseUrl()}/merchant/v2/payments/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Country': country,
                'X-Currency': currency,
            },
            body: JSON.stringify({
                reference: params.reference,
                subscriber: { country, currency, msisdn },
                transaction: {
                    amount: Math.round(params.amount),
                    country,
                    currency,
                    id: txId,
                },
            }),
        });

        const data = await res.json().catch(() => ({}));
        const ok = res.ok && (data?.status?.success !== false);
        return {
            success: ok,
            mode: 'live',
            transactionId: data?.data?.transaction?.id || txId,
            status: ok ? 'PENDING' : 'FAILED',
            message: data?.status?.message || (ok ? 'Airtel Money prompt sent to your phone.' : 'Airtel Money request failed.'),
        };
    } catch (error: any) {
        return {
            success: false,
            mode: 'live',
            transactionId: txId,
            status: 'FAILED',
            message: error?.message || 'Airtel Money collection error.',
        };
    }
}

export async function initiateAirtelDisbursement(params: AirtelPaymentParams): Promise<AirtelResponse> {
    const txId = params.transactionId || `AIR-PAY-${Date.now()}`;
    const msisdn = normalizeAirtelMsisdn(params.phone);
    const country = process.env.AIRTEL_COUNTRY || 'KE';
    const currency = process.env.AIRTEL_CURRENCY || 'KES';
    const pin = process.env.AIRTEL_PIN || '';

    try {
        const token = await getAirtelAccessToken();
        if (!token) {
            console.log(`[Airtel Money Sandbox] Instant B2C Disbursement -> +254${msisdn}, ${currency} ${params.amount}, Ref: ${params.reference}`);
            return {
                success: true,
                mode: 'sandbox_mock',
                transactionId: txId,
                status: 'SUCCESS',
                message: `Instant Airtel Money payout of ${currency} ${params.amount} disbursed to +254${msisdn}.`,
            };
        }

        const res = await fetch(`${getAirtelBaseUrl()}/standard/v2/disbursements/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Country': country,
                'X-Currency': currency,
            },
            body: JSON.stringify({
                payee: { msisdn },
                reference: params.reference,
                pin,
                transaction: {
                    amount: Math.round(params.amount),
                    id: txId,
                },
            }),
        });

        const data = await res.json().catch(() => ({}));
        const ok = res.ok && (data?.status?.success !== false);
        return {
            success: ok,
            mode: 'live',
            transactionId: data?.data?.transaction?.id || txId,
            status: ok ? 'SUCCESS' : 'FAILED',
            message: data?.status?.message || (ok ? 'Instant Airtel Money payout completed.' : 'Airtel Money disbursement failed.'),
        };
    } catch (error: any) {
        return {
            success: false,
            mode: 'live',
            transactionId: txId,
            status: 'FAILED',
            message: error?.message || 'Airtel Money disbursement error.',
        };
    }
}
