import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/database';

/**
 * Represents the structure of the TripPaid event.
 */
export interface TripPaidEvent {
    tripId: string;
    driverId: string;
    finalFare: number;
}

@Injectable()
export class SaccoService {
    private readonly logger = new Logger(SaccoService.name);

    constructor(private readonly prisma: PrismaService) { }

    async processDeduction(event: TripPaidEvent): Promise<any> {
        this.logger.log(`Processing SACCO deduction for trip: ${event.tripId}`);

        try {
            // 1. Fetch all required configuration (Simulated or from DB settings)
            // Ideally fetch from Settings table if available, else usage defaults
            const saccoConfig = { savingsRate: 0.05 }; // 5%
            const commissionConfig = { totalCommission: 0.2 }; // 20%

            this.logger.log(`Fetched SACCO config: ${JSON.stringify(saccoConfig)}`);

            // 2. Check if savings rate is zero
            if (saccoConfig.savingsRate <= 0) {
                this.logger.log('SACCO savings rate is zero. No deduction will be made.');
                return { status: 'skipped', reason: 'zero_savings_rate' };
            }

            // 3. Calculate the deduction amount
            const totalCommission = Number(event.finalFare) * commissionConfig.totalCommission;
            const savingsAmount = totalCommission * saccoConfig.savingsRate;

            if (savingsAmount <= 0) {
                this.logger.log('Calculated savings amount is zero. No deduction will be made.');
                return { status: 'skipped', reason: 'zero_amount' };
            }

            // 4. Persist the transaction to DB
            this.logger.log(`Persisting SACCO transaction for driver: ${event.driverId}, amount: ${savingsAmount}`);

            const transaction = await this.prisma.saccoLedger.create({
                data: {
                    driverId: event.driverId,
                    amount: savingsAmount,
                    type: 'SACCO_SAVING',
                    relatedTripId: event.tripId,
                }
            });

            this.logger.log(`Successfully processed SACCO deduction of ${savingsAmount} for driver: ${event.driverId}. Ledger ID: ${transaction.id}`);

            return {
                status: 'success',
                transaction
            };

        } catch (error) {
            this.logger.error('Failed to process SACCO deduction', error);
            // Don't crash the consumer, just log error? depending on requirements.
            // Throwing allows retry strategies if configured.
            throw error;
        }
    }

    async getHealth() {
        return { status: 'OK', service: 'sacco-service', timestamp: new Date() };
    }

    async getSavingsBalance(driverId: string) {
        // Sum up all transactions for the driver
        // Assuming withdrawals or loans would be negative amounts or handled via type
        // For simplicity: All 'SACCO_SAVING' are positive. Withdrawals should be subtracted.
        // We can group by type or just sum amount if we store negatives for withdrawals.

        // Let's assume for now we just sum everything.
        // Prisma aggregate
        const result = await this.prisma.saccoLedger.aggregate({
            _sum: {
                amount: true
            },
            where: {
                driverId: driverId
            }
        });

        // If no transactions, sum is null
        const totalSavings = result._sum.amount ? Number(result._sum.amount) : 0;

        // Available might be less if there are loans locked, etc.
        // For now: available = total
        return {
            totalSavings,
            availableWithdrawal: totalSavings
        };
    }

    async getTransactions(driverId: string) {
        return this.prisma.saccoLedger.findMany({
            where: { driverId },
            orderBy: { createdAt: 'desc' },
            take: 50 // limit to recent 50
        });
    }
}
