import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface RemittancePayload {
    driverId: string;
    tripId: string;
    amount: number;
    currency: string;
    timestamp: string;
    partnerRef?: string;
}

export interface RemittanceResult {
    success: boolean;
    externalReference?: string;
    message?: string;
    fallbackToLedger?: boolean;
}

/**
 * Handles outbound communication to the external Sacco partner.
 * Supports REST API and Ledger Export connector types.
 * Falls back to local ledger recording when the partner API is unavailable.
 */
@Injectable()
export class SaccoIntegrationService {
    private readonly logger = new Logger(SaccoIntegrationService.name);
    private readonly maxRetries = 3;
    private readonly retryDelayMs = 1000;

    private validateSafePartnerUrl(baseUrl: string): string {
        let parsed: URL;
        try {
            parsed = new URL(baseUrl);
        } catch {
            throw new HttpException('Invalid partner API base URL', HttpStatus.BAD_REQUEST);
        }

        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            throw new HttpException('Partner API URL must use HTTPS or HTTP', HttpStatus.BAD_REQUEST);
        }
        if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
            throw new HttpException('Partner API URL must use HTTPS in production', HttpStatus.BAD_REQUEST);
        }

        const host = parsed.hostname.toLowerCase();
        const blockedHostPatterns = [
            /^localhost$/,
            /^127\./,
            /^0\./,
            /^169\.254\./,
            /^10\./,
            /^192\.168\./,
            /^172\.(1[6-9]|2\d|3[0-1])\./,
            /^\[?::1\]?$/,
            /metadata\.google\.internal$/,
            /\.internal$/,
        ];

        if (blockedHostPatterns.some((pattern) => pattern.test(host))) {
            throw new HttpException('Partner API URL points to a restricted internal or metadata address', HttpStatus.FORBIDDEN);
        }

        return parsed.origin;
    }

    private buildClient(baseUrl: string, apiKey: string): AxiosInstance {
        const safeBaseUrl = this.validateSafePartnerUrl(baseUrl);
        return axios.create({
            baseURL: safeBaseUrl,
            maxRedirects: 0,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-Partner': 'cabi-africa',
            },
            timeout: 10_000,
        });
    }

    /**
     * Sends a remittance notification to the external Sacco partner REST API.
     * Retries with exponential backoff up to maxRetries times.
     */
    async sendRemittanceToPartner(
        apiBaseUrl: string,
        apiKey: string,
        payload: RemittancePayload
    ): Promise<RemittanceResult> {
        const client = this.buildClient(apiBaseUrl, apiKey);
        let lastError: any;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                this.logger.log(`Sending remittance to partner (attempt ${attempt}): trip=${payload.tripId}, amount=${payload.amount}`);

                const response = await client.post('/api/cabi/remittance', payload);

                this.logger.log(`Remittance accepted by partner. Ref: ${response.data?.reference}`);
                return {
                    success: true,
                    externalReference: response.data?.reference,
                    message: 'Remittance sent successfully',
                };
            } catch (error: any) {
                lastError = error;
                this.logger.warn(`Remittance attempt ${attempt} failed: ${error?.message}`);

                if (attempt < this.maxRetries) {
                    await this.sleep(this.retryDelayMs * Math.pow(2, attempt - 1));
                }
            }
        }

        this.logger.error(`All ${this.maxRetries} remittance attempts failed. Falling back to local ledger.`, lastError);
        return {
            success: false,
            message: `Partner API unreachable: ${lastError?.message}`,
            fallbackToLedger: true,
        };
    }

    /**
     * Tests connectivity to the external Sacco partner API.
     * Returns latency and a success/failure status.
     */
    async testConnection(apiBaseUrl: string, apiKey: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
        const client = this.buildClient(apiBaseUrl, apiKey);
        const start = Date.now();

        try {
            await client.get('/api/cabi/health');
            const latencyMs = Date.now() - start;
            this.logger.log(`Partner connection test succeeded in ${latencyMs}ms`);
            return { success: true, latencyMs, message: 'Connection successful' };
        } catch (error: any) {
            const latencyMs = Date.now() - start;
            const message = error?.response
                ? `HTTP ${error.response.status}: ${error.response.statusText}`
                : `Network error: ${error?.message}`;
            this.logger.warn(`Partner connection test failed: ${message}`);
            return { success: false, latencyMs, message };
        }
    }

    /**
     * Formats a remittance batch as CSV for Ledger Export connector type.
     * Used when the partner does not have a REST API.
     */
    formatLedgerExportCsv(entries: RemittancePayload[]): string {
        const header = 'driver_id,trip_id,amount,currency,timestamp,partner_ref';
        const rows = entries.map(e =>
            `${e.driverId},${e.tripId},${e.amount},${e.currency},${e.timestamp},${e.partnerRef ?? ''}`
        );
        return [header, ...rows].join('\n');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
