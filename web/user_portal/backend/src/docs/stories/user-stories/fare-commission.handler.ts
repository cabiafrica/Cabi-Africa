import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';
import { UserServiceClient } from './user.service.client';

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
 * the standard fare commission distribution.
 * It's triggered by an SQS message originating from the `TripPaid` SNS topic.
 */
export async function handleFareCommission(event: TripPaidEvent): Promise<void> {
  console.log(`Processing fare commission for trip: ${event.tripId}`);

  const adminClient = new AdminServiceClient();
  const userClient = new UserServiceClient();
  const transactionRepo = new TransactionRepository();

  try {
    // 1. Fetch all required data in parallel
    const [uplines, config] = await Promise.all([
      userClient.getUplines(event.driverId),
      adminClient.getFareCommissionConfig(),
    ]);

    const [upline1HasBadge, upline2HasBadge] = await Promise.all([
      userClient.hasEarningBadge(uplines.upline1_userId),
      uplines.upline2_userId ? userClient.hasEarningBadge(uplines.upline2_userId) : Promise.resolve(false),
    ]);

    // 2. Calculate commission amounts
    const totalCommission = event.finalFare * config.totalCommission;
    const driverEarning = event.finalFare - totalCommission;

    let systemShare = totalCommission * config.systemCut;
    const upline1Share = totalCommission * config.upline1Cut;
    const upline2Share = totalCommission * config.upline2Cut;

    const transactions: Promise<void>[] = [];

    // 3. Log driver's net earning
    transactions.push(transactionRepo.create({
      toUserId: event.driverId,
      amount: driverEarning,
      type: 'DRIVER_EARNING',
      relatedTripId: event.tripId,
    }));

    // 4. Conditionally determine who gets Upline 1's share
    if (upline1HasBadge) {
      transactions.push(transactionRepo.create({
        toUserId: uplines.upline1_userId,
        amount: upline1Share,
        type: 'COMMISSION_FARE_UPLINE1',
        relatedTripId: event.tripId,
      }));
    } else {
      systemShare += upline1Share; // System gets the share
    }

    // 5. Conditionally determine who gets Upline 2's share
    if (uplines.upline2_userId && upline2HasBadge) {
      transactions.push(transactionRepo.create({
        toUserId: uplines.upline2_userId,
        amount: upline2Share,
        type: 'COMMISSION_FARE_UPLINE2',
        relatedTripId: event.tripId,
      }));
    } else {
      systemShare += upline2Share; // System gets the share
    }

    // 6. Log the final system share
    transactions.push(transactionRepo.create({ toUserId: 'SYSTEM_ACCOUNT', amount: systemShare, type: 'SYSTEM_CUT', relatedTripId: event.tripId }));

    // 7. Execute all transaction logging in parallel
    await Promise.all(transactions);

    console.log(`Successfully processed fare commission for trip: ${event.tripId}`);
  } catch (error) {
    console.error('Failed to process fare commission:', error);
    throw error;
  }
}