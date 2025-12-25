import { AdminServiceClient } from './admin.service.client';
import { TransactionRepository } from './transaction.repository';
import { UserServiceClient } from './user.service.client';

/**
 * Represents the structure of the DriverRegistered event.
 */
interface DriverRegisteredEvent {
  userId: string;
  feeAmount: number;
}

/**
 * This is the main handler for the Lambda function that processes
 * the driver registration fee distribution.
 * It's triggered by an SQS message originating from an SNS topic.
 */
export async function handleFeeDistribution(event: DriverRegisteredEvent): Promise<void> {
  console.log(`Processing fee distribution for user: ${event.userId} with amount: ${event.feeAmount}`);

  const adminClient = new AdminServiceClient();
  const userClient = new UserServiceClient();
  const transactionRepo = new TransactionRepository();

  try {
    // 1. Fetch upline and configuration in parallel
    const [uplines, config] = await Promise.all([
      userClient.getUplines(event.userId),
      adminClient.getFeeDistributionConfig(),
    ]);

    // 2. Calculate commission shares
    const upline1Share = event.feeAmount * config.upline1Cut;
    const upline2Share = event.feeAmount * config.upline2Cut;
    const systemShare = event.feeAmount * config.systemCut;

    const transactions: Promise<void>[] = [];

    // 3. Log Upline 1 transaction
    transactions.push(transactionRepo.create({
      toUserId: uplines.upline1_userId,
      amount: upline1Share,
      type: 'COMMISSION_UPLINE1',
      relatedUserId: event.userId,
    }));

    // 4. Log Upline 2 transaction (or system's share if no Upline 2)
    const upline2Recipient = uplines.upline2_userId ?? 'SYSTEM_ACCOUNT';
    transactions.push(transactionRepo.create({
      toUserId: upline2Recipient,
      amount: upline2Share,
      type: 'COMMISSION_UPLINE2',
      relatedUserId: event.userId,
    }));

    // 5. Execute all transaction logging in parallel
    await Promise.all(transactions);

    console.log(`Successfully distributed fee for user: ${event.userId}`);
  } catch (error) {
    console.error('Failed to process fee distribution:', error);
    // In a real app, this would re-throw the error to let SQS handle retries/DLQ
    throw error;
  }
}