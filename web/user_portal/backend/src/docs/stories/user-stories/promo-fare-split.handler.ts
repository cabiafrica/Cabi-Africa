import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';
import { UserServiceClient } from './user.service.client';

/**
 * Represents the structure of the TripPaid event.
 * Note: The passengerId is crucial for this handler.
 */
interface TripPaidEvent {
  tripId: string;
  passengerId: string;
  finalFare: number;
}

/**
 * This is the main handler for the Lambda function that processes
 * the promotional passenger fare split.
 * It's triggered by an SQS message originating from the `TripPaid` SNS topic.
 */
export async function handlePromoFareSplit(event: TripPaidEvent): Promise<void> {
  console.log(`Checking for passenger promo distribution for trip: ${event.tripId}`);

  const adminClient = new AdminServiceClient();

  // 1. Check if the promotion is even active. If not, exit immediately.
  const promoIsActive = await adminClient.isPromoActive();
  if (!promoIsActive) {
    console.log('Passenger fare promotion is not active. No action taken.');
    return;
  }

  console.log('Passenger fare promotion is active. Proceeding with distribution logic.');
  const userClient = new UserServiceClient();
  const transactionRepo = new TransactionRepository();

  try {
    // 2. Fetch all required data in parallel
    const [uplines, config] = await Promise.all([
      userClient.getUplines(event.passengerId), // Get passenger's upline
      adminClient.getPromoFareConfig(),
    ]);

    const [upline1HasBadge, upline2HasBadge] = await Promise.all([
      userClient.hasEarningBadge(uplines.upline1_userId),
      uplines.upline2_userId ? userClient.hasEarningBadge(uplines.upline2_userId) : Promise.resolve(false),
    ]);

    const transactions: Promise<void>[] = [];

    // 3. Conditionally log transaction for Upline 1
    if (upline1HasBadge) {
      const upline1Share = event.finalFare * config.upline1Cut;
      if (upline1Share > 0) {
        transactions.push(transactionRepo.create({
          toUserId: uplines.upline1_userId,
          amount: upline1Share,
          type: 'COMMISSION_PROMO_PASSENGER',
          relatedTripId: event.tripId,
        }));
      }
    }

    // 4. Conditionally log transaction for Upline 2
    if (uplines.upline2_userId && upline2HasBadge) {
      const upline2Share = event.finalFare * config.upline2Cut;
      if (upline2Share > 0) {
        transactions.push(transactionRepo.create({
          toUserId: uplines.upline2_userId,
          amount: upline2Share,
          type: 'COMMISSION_PROMO_PASSENGER',
          relatedTripId: event.tripId,
        }));
      }
    }

    // 5. Execute all transaction logging in parallel
    await Promise.all(transactions);

    console.log(`Successfully processed passenger promo distribution for trip: ${event.tripId}`);
  } catch (error) {
    console.error('Failed to process passenger promo distribution:', error);
    throw error;
  }
}