import { Injectable } from '@nestjs/common';

export interface Transaction {
    id: string;
    driverId: string;
    amount: number;
    type: 'EARNING' | 'PAYOUT' | 'TIP' | 'FEE';
    description: string;
    timestamp: Date;
}

export interface DriverFinance {
    driverId: string;
    balance: number;
    earningsGoal?: {
        period: 'DAILY' | 'WEEKLY';
        amount: number;
        current: number; // For visualization
    };
    transactions: Transaction[];
}

@Injectable()
export class FinanceService {
    private finances = new Map<string, DriverFinance>();

    constructor() {
        // Seed
        this.finances.set('driver_bob', {
            driverId: 'driver_bob',
            balance: 154.50,
            earningsGoal: { period: 'DAILY', amount: 200, current: 154.50 },
            transactions: [
                { id: 't1', driverId: 'driver_bob', amount: 25.50, type: 'EARNING', description: 'Trip 123', timestamp: new Date() }
            ]
        });
    }

    async getFinanceSummary(driverId: string) {
        let finance = this.finances.get(driverId);
        if (!finance) {
            finance = { driverId, balance: 0, transactions: [] };
            this.finances.set(driverId, finance);
        }
        return finance;
    }

    async setEarningsGoal(driverId: string, amount: number, period: 'DAILY' | 'WEEKLY') {
        const finance = await this.getFinanceSummary(driverId);
        finance.earningsGoal = {
            period,
            amount,
            current: finance.transactions
                .filter(t => t.type !== 'PAYOUT' && t.timestamp > new Date(Date.now() - 86400000)) // Mock daily filter
                .reduce((sum, t) => sum + t.amount, 0)
        };
        return finance;
    }

    async cashOut(driverId: string) {
        const finance = await this.getFinanceSummary(driverId);
        if (finance.balance < 5) throw new Error("Minimum cash out is $5.00");

        const payoutAmount = finance.balance - 0.50; // $0.50 fee

        const payoutTx: Transaction = {
            id: `tx_${Date.now()}`,
            driverId,
            amount: -finance.balance,
            type: 'PAYOUT',
            description: `Instant Payout ($0.50 fee)`,
            timestamp: new Date()
        };

        finance.transactions.push(payoutTx);
        finance.balance = 0;

        console.log(`[FinanceService] Processed instant payout of $${payoutAmount.toFixed(2)} to ${driverId}`);
        return { success: true, payoutAmount, remainingBalance: 0 };
    }
}
