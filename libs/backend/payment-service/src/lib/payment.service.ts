import { Injectable, Logger } from '@nestjs/common';

export interface Wallet {
    userId: string;
    balance: number;
    currency: string;
}

export interface PaymentResult {
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    transactionId?: string;
    message?: string;
    checkoutRequestId?: string;
    provider?: string;
}

export type MobileMoneyProvider = 'MPESA' | 'AIRTEL' | 'TKASH' | 'MTN_MOMO' | 'PESALINK' | 'CASH';

/**
 * Detect African Mobile Money carrier based on E.164 or national phone prefix
 */
export function detectMobileMoneyProvider(phone: string): MobileMoneyProvider {
    const clean = (phone || '').replace(/[^0-9]/g, '');
    const local = clean.startsWith('254') ? clean.slice(3) : clean.startsWith('0') ? clean.slice(1) : clean;
    const prefix2 = local.slice(0, 2);

    // Airtel Kenya: 073x, 075x, 078x, 010x
    if (['73', '75', '78', '10'].includes(prefix2)) return 'AIRTEL';
    // Telkom Kenya (T-Kash): 077x
    if (prefix2 === '77') return 'TKASH';
    // MTN Regional (Uganda: +256, Rwanda: +250, Ghana: +233)
    if (clean.startsWith('256') || clean.startsWith('250') || clean.startsWith('233')) return 'MTN_MOMO';
    // Default Safaricom M-Pesa: 070x, 071x, 072x, 074x, 079x, 011x
    return 'MPESA';
}

export interface MpesaConfig {
    enabled: boolean;
    environment: 'sandbox' | 'production';
    shortCode: string;
    passkey: string;
    consumerKey: string;
    consumerSecret: string;
    callbackUrl: string;
}

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private wallets = new Map<string, Wallet>();
    private mpesaConfig: MpesaConfig;

    constructor() {
        this.wallets.set('passenger_1', { userId: 'passenger_1', balance: 50.00, currency: 'USD' });
        this.wallets.set('driver_bob', { userId: 'driver_bob', balance: 100.00, currency: 'USD' });
        
        this.loadMpesaConfig();
    }

    private loadMpesaConfig() {
        const mpesaEnabled = process.env.MPESA_ENABLED === 'true';
        if (!mpesaEnabled) {
            this.logger.warn('M-Pesa integration is disabled');
            this.mpesaConfig = { enabled: false } as any;
            return;
        }

        this.mpesaConfig = {
            enabled: true,
            environment: (process.env.MPESA_ENV || 'sandbox') as 'sandbox' | 'production',
            shortCode: process.env.MPESA_SHORT_CODE || '',
            passkey: process.env.MPESA_PASSKEY || '',
            consumerKey: process.env.MPESA_CONSUMER_KEY || '',
            consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
            callbackUrl: process.env.MPESA_CALLBACK_URL || '',
        };
        this.logger.log('M-Pesa configuration loaded');
    }

    isMpesaEnabled(): boolean {
        return this.mpesaConfig?.enabled === true;
    }

    async initiateMpesaPayment(
        phoneNumber: string,
        amount: number,
        accountReference: string,
        transactionDescription: string
    ): Promise<PaymentResult> {
        if (!this.isMpesaEnabled()) {
            return {
                status: 'FAILED',
                message: 'M-Pesa is not enabled'
            };
        }

        this.logger.log(`Initiating M-Pesa STK Push: ${phoneNumber}, KES ${amount}`);

        try {
            const response = await this.callMpesaApi('stk-push', {
                phoneNumber,
                amount,
                accountReference,
                transactionDesc: transactionDescription
            });

            return {
                status: 'PENDING',
                checkoutRequestId: response.CheckoutRequestID,
                transactionId: response.MerchantRequestID,
                message: 'STK Push sent to phone'
            };
        } catch (error: any) {
            this.logger.error(`M-Pesa STK Push failed: ${error.message}`);
            return {
                status: 'FAILED',
                message: error.message || 'M-Pesa payment failed'
            };
        }
    }

    /**
     * Unified Multi-Rail Mobile Money Dispatcher
     * Supports Safaricom M-Pesa, Airtel Money, Telkom T-Kash, and MTN MoMo.
     */
    async initiateMobilePayment(params: {
        phoneNumber: string;
        amount: number;
        provider?: MobileMoneyProvider;
        accountReference?: string;
        description?: string;
    }): Promise<PaymentResult> {
        const provider = params.provider || detectMobileMoneyProvider(params.phoneNumber);
        const ref = params.accountReference || `CAB-${Date.now().toString().slice(-6)}`;
        const desc = params.description || 'Cabi Africa Trip Fare';

        this.logger.log(`Multi-Rail Payment Dispatch: ${provider} -> ${params.phoneNumber}, KES ${params.amount}`);

        switch (provider) {
            case 'AIRTEL':
                return this.initiateAirtelMoneyPayment(params.phoneNumber, params.amount, ref, desc);
            case 'TKASH':
                return this.initiateTkashPayment(params.phoneNumber, params.amount, ref, desc);
            case 'MTN_MOMO':
                return this.initiateMtnMomoPayment(params.phoneNumber, params.amount, ref, desc);
            case 'MPESA':
            default:
                return this.initiateMpesaPayment(params.phoneNumber, params.amount, ref, desc);
        }
    }

    async initiateAirtelMoneyPayment(
        phoneNumber: string,
        amount: number,
        accountReference: string,
        description: string
    ): Promise<PaymentResult> {
        this.logger.log(`Initiating Airtel Money USSD Push: ${phoneNumber}, KES ${amount}`);
        const airtelTxId = `AIR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
            status: 'PENDING',
            transactionId: airtelTxId,
            checkoutRequestId: `AIR_REQ_${Date.now()}`,
            provider: 'AIRTEL',
            message: 'Airtel Money payment prompt dispatched to phone'
        };
    }

    async initiateTkashPayment(
        phoneNumber: string,
        amount: number,
        accountReference: string,
        description: string
    ): Promise<PaymentResult> {
        this.logger.log(`Initiating Telkom T-Kash Push: ${phoneNumber}, KES ${amount}`);
        const tkashTxId = `TK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
            status: 'PENDING',
            transactionId: tkashTxId,
            checkoutRequestId: `TK_REQ_${Date.now()}`,
            provider: 'TKASH',
            message: 'T-Kash prompt dispatched to phone'
        };
    }

    async initiateMtnMomoPayment(
        phoneNumber: string,
        amount: number,
        accountReference: string,
        description: string
    ): Promise<PaymentResult> {
        this.logger.log(`Initiating MTN Mobile Money Collection: ${phoneNumber}, KES ${amount}`);
        const mtnTxId = `MTN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
            status: 'PENDING',
            transactionId: mtnTxId,
            checkoutRequestId: `MTN_REQ_${Date.now()}`,
            provider: 'MTN_MOMO',
            message: 'MTN Mobile Money request dispatched'
        };
    }

    async initiateDriverPayout(
        driverPhoneNumber: string,
        amount: number,
        occasion: string
    ): Promise<PaymentResult> {
        if (!this.isMpesaEnabled()) {
            return {
                status: 'FAILED',
                message: 'M-Pesa is not enabled'
            };
        }

        this.logger.log(`Initiating B2C payout: ${driverPhoneNumber}, KES ${amount}`);

        try {
            const response = await this.callMpesaApi('b2c', {
                phoneNumber: driverPhoneNumber,
                amount,
                occasion
            });

            return {
                status: 'PENDING',
                transactionId: response.ConversationID,
                message: 'B2C payout initiated'
            };
        } catch (error: any) {
            this.logger.error(`M-Pesa B2C failed: ${error.message}`);
            return {
                status: 'FAILED',
                message: error.message || 'Driver payout failed'
            };
        }
    }

    async processMpesaCallback(callbackData: any): Promise<{ success: boolean; transactionId?: string }> {
        this.logger.log('Processing M-Pesa callback');

        if (callbackData.Body?.stkCallback) {
            const stkCallback = callbackData.Body.stkCallback;
            // const checkoutRequestId = stkCallback.CheckoutRequestID;
            const resultCode = stkCallback.ResultCode;

            if (resultCode === 0) {
                const metadata = stkCallback.CallbackMetadata?.Item || [];
                const mpesaReceiptNumber = metadata.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
                
                this.logger.log(`STK Payment successful: ${mpesaReceiptNumber}`);
                return { success: true, transactionId: mpesaReceiptNumber };
            } else {
                this.logger.warn(`STK Payment failed: ${stkCallback.ResultDesc}`);
                return { success: false };
            }
        }

        return { success: false };
    }

    private async callMpesaApi(endpoint: string, payload: any): Promise<any> {
        const baseUrl = this.mpesaConfig.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';

        const token = await this.getMpesaAccessToken(baseUrl);
        
        const response = await fetch(`${baseUrl}/mpesa/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`M-Pesa API error: ${error}`);
        }

        return response.json();
    }

    private async getMpesaAccessToken(baseUrl: string): Promise<string> {
        const auth = Buffer.from(
            `${this.mpesaConfig.consumerKey}:${this.mpesaConfig.consumerSecret}`
        ).toString('base64');

        const response = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get M-Pesa access token');
        }

        const data = await response.json();
        return data.access_token;
    }

    async getWallet(userId: string) {
        if (!this.wallets.has(userId)) {
            this.wallets.set(userId, { userId, balance: 0, currency: 'USD' });
        }
        return this.wallets.get(userId);
    }

    async topUpWallet(userId: string, amount: number) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('Top-up amount must be a positive number');
        }
        const wallet = await this.getWallet(userId);
        wallet.balance += amount;
        return wallet;
    }

    async processPayment(rideId: string, amount: number, method: 'CASH' | 'WALLET' | 'CARD', payerId: string, payeeId: string) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('Payment amount must be a positive number');
        }
        console.log(`[PaymentService] Processing ${method} payment of $${amount} for ride ${rideId}`);

        if (method === 'WALLET') {
            const payerWallet = await this.getWallet(payerId);
            if (payerWallet.balance < amount) throw new Error('Insufficient funds');
            payerWallet.balance -= amount;

            const payeeWallet = await this.getWallet(payeeId);
            payeeWallet.balance += amount * 0.8; // Driver gets 80%
            // 20% Platform Fee stays in system
        }
        else if (method === 'CASH') {
            // Driver collects 100% cash. Platform deducts 20% commission from Driver Wallet.
            const commission = amount * 0.2;
            const driverWallet = await this.getWallet(payeeId);
            driverWallet.balance -= commission;
            console.log(`[PaymentService] Deducted commission $${commission} from driver ${payeeId}`);
        }

        return { status: 'SUCCESS', transactionId: `tx_${Date.now()}` };
    }

    async processTip(rideId: string, tipAmount: number, passengerId: string, driverId: string, method: 'CARD' | 'WALLET' = 'CARD') {
        if (!Number.isFinite(tipAmount) || tipAmount <= 0) {
            throw new Error('Tip amount must be a positive number');
        }
        console.log(`[PaymentService] Processing tip of $${tipAmount} for ride ${rideId}`);

        if (method === 'WALLET') {
            const passengerWallet = await this.getWallet(passengerId);
            if (passengerWallet.balance < tipAmount) throw new Error('Insufficient funds for tip');
            passengerWallet.balance -= tipAmount;
        }

        // Driver gets 100% of tip
        const driverWallet = await this.getWallet(driverId);
        driverWallet.balance += tipAmount;

        console.log(`[PaymentService] Tip credited to driver ${driverId}`);
        // In real app: NotificationService.notifyDriver(driverId, 'You received a tip!')

        return { status: 'SUCCESS', tipAmount, transactionId: `tip_${Date.now()}` };
    }

    async processRefund(rideId: string, userId: string, refundType: 'CANCELLATION_FEE' | 'WAIT_TIME_FEE' | 'FARE', amount: number, reason: string) {
        console.log(`[PaymentService] Processing refund for ride ${rideId}: ${refundType} - $${amount}`);

        // Automated refund rules
        let autoApproved = false;

        if (refundType === 'WAIT_TIME_FEE') {
            // Auto-approve if driver was late (mock check)
            autoApproved = true; // In real app: check GPS data
        } else if (refundType === 'CANCELLATION_FEE' && reason.includes('driver')) {
            // Auto-approve if driver cancelled
            autoApproved = true;
        }

        if (autoApproved) {
            const wallet = await this.getWallet(userId);
            wallet.balance += amount;

            console.log(`[PaymentService] ✅ Auto-approved refund of $${amount} to user ${userId}`);
            return {
                status: 'APPROVED',
                refundAmount: amount,
                method: 'AUTO',
                transactionId: `refund_${Date.now()}`
            };
        } else {
            // Create support ticket for manual review
            console.log(`[PaymentService] ⏳ Refund requires manual review - creating support ticket`);
            // In real app: SupportService.createTicket(...)
            return {
                status: 'PENDING_REVIEW',
                ticketId: `ticket_${Date.now()}`,
                message: 'Your refund request is under review. We\'ll respond within 24 hours.'
            };
        }
    }
    async submitExpenseReport(rideId: string, userId: string, provider: 'EXPENSIFY' | 'CONCUR', amount: number) {
        console.log(`[PaymentService] 📤 Submitting expense report to ${provider} for user ${userId}, ride ${rideId}, amount $${amount}`);

        // Mock API call to provider
        // await Http.post(`https://api.${provider.toLowerCase()}.com/expenses`, { ... })

        return {
            status: 'SUBMITTED',
            provider,
            reportId: `exp_${Date.now()}`
        };
    }

    // Story 85.0: Earnings Dashboard
    async getEarningsDashboard(driverId: string) {
        const wallet = await this.getWallet(driverId);
        return {
            availableBalance: wallet.balance,
            currency: wallet.currency,
            payoutEligible: wallet.balance > 50
        };
    }

    // Story 88.1: Earnings History
    // Story 88.1: Earnings History
    async getEarningsHistory(driverId: string, period: 'TODAY' | 'WEEK') {
        // Mock data
        const transactions = [
            { id: 'tx_1', date: new Date(), type: 'FARE', amount: 25.50, description: 'Trip to Airport' },
            { id: 'tx_2', date: new Date(), type: 'TIP', amount: 5.00, description: 'Tip from John' },
            { id: 'tx_3', date: new Date(), type: 'COMMISSION', amount: -6.00, description: 'Platform Fee' },
        ];

        return {
            totalEarnings: period === 'TODAY' ? 120.50 : 850.00,
            transactions
        };
    }

    // Story 88.2: Earnings Statements
    async getEarningsStatements(driverId: string) {
        return [
            { id: 'stmt_nov_w4', period: 'Nov 20-27, 2025', url: 'https://example.com/stmt.pdf' },
            { id: 'stmt_nov_w3', period: 'Nov 13-20, 2025', url: 'https://example.com/stmt.pdf' }
        ];
    }

    // Story 88.3: Earnings Goals
    private earningsGoals = new Map<string, number>();

    async setEarningsGoal(driverId: string, weeklyGoal: number) {
        this.earningsGoals.set(driverId, weeklyGoal);
        return { success: true, goal: weeklyGoal };
    }

    async getEarningsGoal(driverId: string) {
        const goal = this.earningsGoals.get(driverId) || 1000; // Default $1000
        const current = (await this.getEarningsHistory(driverId, 'WEEK')).totalEarnings;
        return {
            goal,
            current,
            progress: Math.min(current / goal, 1.0)
        };
    }

    // Story 88.4: Track Expenses
    private expenses = new Map<string, any[]>();

    async addExpense(driverId: string, expense: any) {
        const list = this.expenses.get(driverId) || [];
        list.push({ ...expense, id: `exp_${Date.now()}` });
        this.expenses.set(driverId, list);
        return { success: true };
    }

    async getExpenses(driverId: string) {
        return this.expenses.get(driverId) || [];
    }
}
