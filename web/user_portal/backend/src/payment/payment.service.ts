import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationService } from '@cabi/backend/notification-service'; // Mocking import

interface FareSplitParticipant {
  userId: string;
  share: number;
  status: 'pending' | 'accepted' | 'declined';
}

interface FareSplit {
  id: string;
  tripId: string;
  initiatorId: string;
  totalFare: number;
  createdAt: Date;
  participants: FareSplitParticipant[];
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly notificationService = new NotificationService(); // Mocking injection

  // Mock data store
  private fareSplits: FareSplit[] = [];

  async initiateSplit(tripId: string, initiatorId: string, participantIds: string[], totalFare: number): Promise<FareSplit> {
    const numParticipants = participantIds.length + 1; // +1 for the initiator
    const share = totalFare / numParticipants;

    const newSplit: FareSplit = {
      id: `split-${Math.random().toString(36).substring(2, 9)}`,
      tripId,
      initiatorId,
      totalFare,
      createdAt: new Date(),
      participants: participantIds.map(id => ({ userId: id, share, status: 'pending' })),
    };

    this.fareSplits.push(newSplit);
    this.logger.log(`Fare split initiated for trip ${tripId}.`);

    // Send notifications to participants
    for (const participant of newSplit.participants) {
      this.notificationService.sendNotification({
        userId: participant.userId,
        title: 'Split Fare Request',
        body: `${initiatorId} wants to split a fare of ${totalFare} with you.`,
      });
    }

    return newSplit;
  }

  async respondToSplit(splitId: string, participantId: string, response: 'accepted' | 'declined'): Promise<FareSplit> {
    const split = this.fareSplits.find(s => s.id === splitId);
    if (!split) throw new NotFoundException(`Split with ID ${splitId} not found.`);

    const participant = split.participants.find(p => p.userId === participantId);
    if (!participant) throw new NotFoundException(`Participant ${participantId} not found in split.`);

    participant.status = response;
    this.logger.log(`Participant ${participantId} has ${response} the split request.`);

    if (response === 'accepted') {
      this.logger.log(`Processing payment of ${participant.share} for user ${participantId}.`);
      // In a real app, charge the user's payment method here.
    } else {
      this.logger.log(`Re-attributing declined share to initiator ${split.initiatorId}.`);
      // In a real app, logic to charge the initiator the extra share would go here.
    }

    return split;
  }

  async handleExpiredSplits(): Promise<void> {
    const now = new Date();
    const timeoutMinutes = 15;
    const expiryThreshold = new Date(now.getTime() - timeoutMinutes * 60 * 1000);

    const pendingSplits = this.fareSplits.filter(
      s => s.createdAt < expiryThreshold && s.participants.some(p => p.status === 'pending')
    );

    if (pendingSplits.length === 0) {
      this.logger.log('No expired fare splits to process.');
      return;
    }

    this.logger.log(`Found ${pendingSplits.length} splits with expired requests.`);

    for (const split of pendingSplits) {
      for (const participant of split.participants) {
        if (participant.status === 'pending') {
          await this.respondToSplit(split.id, participant.userId, 'declined');
        }
      }
    }
  }

  async processMultiSourcePayment(
    tripId: string,
    totalFare: number,
    sources: { sourceId: string; amount: number }[],
  ): Promise<{ status: 'success' | 'failed'; message: string }> {
    const allocatedAmount = sources.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(allocatedAmount - totalFare) > 0.01) {
      return { status: 'failed', message: 'Allocated amounts do not match total fare.' };
    }

    const successfulCharges: { sourceId: string; amount: number }[] = [];

    for (const source of sources) {
      this.logger.log(`Attempting to charge ${source.amount} to source ${source.sourceId}...`);
      // Mock failure condition
      if (source.sourceId === 'card-insufficient-funds') {
        this.logger.error(`Charge failed for source ${source.sourceId}: Insufficient funds.`);
        // Rollback previous charges for this transaction
        for (const charge of successfulCharges) {
          this.logger.log(`Rolling back charge of ${charge.amount} from source ${charge.sourceId}.`);
          // Add rollback logic here (e.g., refunding a card, crediting a wallet)
        }
        return { status: 'failed', message: `Payment failed on source ${source.sourceId}.` };
      }

      this.logger.log(`Successfully charged ${source.amount} to source ${source.sourceId}.`);
      successfulCharges.push(source);
    }

    this.logger.log(`Successfully processed multi-source payment for trip ${tripId}.`);
    return { status: 'success', message: 'Payment successful.' };
  }
}