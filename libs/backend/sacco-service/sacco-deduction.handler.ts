import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';

/**
 * Represents the structure of the TripPaid event.
 */
interface TripPaidEvent {
  tripId: string;
  driverId: string;
  finalFare: number;
}

/**
 * This is the main handler for the Lambda function that processes
 * the Sacco savings deduction.
 * It's triggered by an SQS message originating from the `TripPaid` SNS topic.
 */
export async function handleSaccoDeduction(event: TripPaidEvent): Promise<void> {
  console.log(`Processing Sacco deduction for trip: ${event.tripId}`);

  const adminClient = new AdminServiceClient();
  const transactionRepo = new TransactionRepository();

  try {
    // 1. Fetch all required configuration in parallel
    const [saccoConfig, commissionConfig] = await Promise.all([
      adminClient.getSaccoConfig(),
      adminClient.getFareCommissionConfig(),
    ]);

    // 2. Check if savings rate is zero
    if (saccoConfig.savingsRate <= 0) {
      console.log('Sacco savings rate is zero. No deduction will be made.');
      return;
    }

    // 3. Calculate the deduction amount (2% savings directly on final fare)
    const savingsAmount = event.finalFare * saccoConfig.savingsRate;

    if (savingsAmount <= 0) {
      console.log('Calculated savings amount is zero. No deduction will be made.');
      return;
    }

    // 4. Log the transaction
    await transactionRepo.create({
      userId: event.driverId,
      amount: savingsAmount,
      type: 'Sacco_SAVING',
      relatedTripId: event.tripId,
    });

    console.log(`Successfully processed Sacco deduction of ${savingsAmount} for driver: ${event.driverId}`);
  } catch (error) {
    console.error('Failed to process Sacco deduction:', error);
    throw error;
  }
}