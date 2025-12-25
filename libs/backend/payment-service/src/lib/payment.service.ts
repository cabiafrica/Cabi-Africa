import { Injectable } from '@nestjs/common';

export interface Wallet {
    userId: string;
    balance: number;
    currency: string;
}

@Injectable()
export class PaymentService {
    private wallets = new Map<string, Wallet>();

    constructor() {
        this.wallets.set('passenger_1', { userId: 'passenger_1', balance: 50.00, currency: 'USD' });
        this.wallets.set('driver_bob', { userId: 'driver_bob', balance: 100.00, currency: 'USD' });
    }

    async getWallet(userId: string) {
        if (!this.wallets.has(userId)) {
            this.wallets.set(userId, { userId, balance: 0, currency: 'USD' });
        }
        return this.wallets.get(userId);
    }

    async topUpWallet(userId: string, amount: number) {
        const wallet = await this.getWallet(userId);
        wallet.balance += amount;
        return wallet;
    }

    async processPayment(rideId: string, amount: number, method: 'CASH' | 'WALLET' | 'CARD', payerId: string, payeeId: string) {
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
