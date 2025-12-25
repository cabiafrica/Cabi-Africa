import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';
import { UserServiceClient } from './user.service.client';

/**
 * Represents the structure of the TripPaid event.
 * This event needs to be enriched with passengerId.
 */
interface TripPaidEvent {
  tripId: string;
  driverId: string;
  passengerId: string; // Crucial for this handler
  finalFare: number;
}

/**
 * This is the main handler for the Lambda function that processes
 * the promotional passenger fare split.
 * It's triggered by an SQS message originating from the `TripPaid` SNS topic.
 */
export async function handlePromotionalFare(event: TripPaidEvent): Promise<void> {
  console.log(`Processing promotional fare split for trip: ${event.tripId}`);

  const adminClient = new AdminServiceClient();
  const userClient = new UserServiceClient();
  const transactionRepo = new TransactionRepository();

  try {
    // 1. Check if the promotion is active. If not, exit immediately.
    const promoConfig = await adminClient.getPromotionalFareConfig();
    if (!promoConfig.isActive) {
      console.log('Promotional fare split is not active. Terminating process.');
      return;
    }

    // 2. Fetch passenger's upline and their badge statuses in parallel.
    const uplines = await userClient.getUplines(event.passengerId);
    const [upline1HasBadge, upline2HasBadge] = await Promise.all([
      userClient.hasEarningBadge(uplines.upline1_userId),
      uplines.upline2_userId ? userClient.hasEarningBadge(uplines.upline2_userId) : Promise.resolve(false),
    ]);

    const transactions: Promise<void>[] = [];

    // 3. Conditionally log transaction for Upline 1
    const upline1Share = event.finalFare * promoConfig.upline1Cut;
    if (upline1HasBadge) {
      transactions.push(transactionRepo.create({
        toUserId: uplines.upline1_userId,
        amount: upline1Share,
        type: 'COMMISSION_PROMO_PASSENGER',
        relatedTripId: event.tripId,
      }));
    }

    // 4. Conditionally log transaction for Upline 2
    if (uplines.upline2_userId && upline2HasBadge) {
      const upline2Share = event.finalFare * promoConfig.upline2Cut;
      transactions.push(transactionRepo.create({
        toUserId: uplines.upline2_userId,
        amount: upline2Share,
        type: 'COMMISSION_PROMO_PASSENGER',
        relatedTripId: event.tripId,
      }));
    }

    // 5. Execute all transaction logging in parallel
    if (transactions.length > 0) {
      await Promise.all(transactions);
    }

    console.log(`Successfully processed promotional fare split for trip: ${event.tripId}`);
  } catch (error) {
    console.error('Failed to process promotional fare split:', error);
    throw error;
  }
}