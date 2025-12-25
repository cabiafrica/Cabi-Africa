import { Injectable, Logger, NotFoundException } from '@nestjs/common';

// Mock data models
interface PayoutAttempt {
  driverId: string;
  driverName: string;
  amount: number;
  status: 'Paid' | 'Failed';
}

interface PayoutBatch {
  batchId: string;
  dateProcessed: Date;
  status: 'Completed' | 'Failed';
  totalAmount: number;
  payouts: PayoutAttempt[];
}

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  // Mock database for payout batches
  private payoutBatches: PayoutBatch[] = [
    {
      batchId: 'batch-001', dateProcessed: new Date('2024-08-10T10:00:00Z'), status: 'Completed', totalAmount: 15000,
      payouts: [
        { driverId: 'driver-123', driverName: 'John Doe', amount: 7000, status: 'Paid' },
        { driverId: 'driver-456', driverName: 'Jane Smith', amount: 8000, status: 'Paid' },
      ],
    },
    {
      batchId: 'batch-002', dateProcessed: new Date('2024-08-03T10:00:00Z'), status: 'Failed', totalAmount: 9500,
      payouts: [
        { driverId: 'driver-789', driverName: 'Peter Jones', amount: 9500, status: 'Failed' },
      ],
    },
  ];

  async getBatchHistory(): Promise<Omit<PayoutBatch, 'payouts'>[]> {
    return this.payoutBatches.map(({ payouts, ...batch }) => batch);
  }

  async getBatchDetails(batchId: string): Promise<PayoutBatch> {
    const batch = this.payoutBatches.find(b => b.batchId === batchId);
    if (!batch) throw new NotFoundException(`Batch with ID ${batchId} not found.`);
    return batch;
  }
}