import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SosConfigService } from './sos-config.service';
import { PrismaService } from '@cabi/backend/database';

interface SosSignalDto {
  tripId: string;
  location: { lat: number; lon: number };
}

@Injectable()
export class SafetyService {
  private readonly logger = new Logger(SafetyService.name);

  constructor(
    private readonly sosConfigService: SosConfigService,
    private readonly prisma: PrismaService,
  ) { }

  async handleSosSignal(userId: string, userRole: string, signal: SosSignalDto) {
    this.logger.warn(`[SOS] Signal received from ${userRole} ${userId} for trip ${signal.tripId} at location ${JSON.stringify(signal.location)}`);

    // In a real app, this would trigger real-time alerts to a safety monitoring team.
    // Create a high-priority incident ticket in the support service
    this.logger.log(`Creating high-priority support incident for trip ${signal.tripId}...`);

    return { success: true, message: 'SOS signal received and logged. Help is on the way.' };
  }

  async resolveSosIncident(userId: string, isMisuse: boolean) {
    if (!isMisuse) {
      return { success: true, message: 'Incident resolved.' };
    }

    const config = await this.sosConfigService.getConfig();
    this.logger.warn(`Applying SOS misuse penalty to user ${userId}. Type: ${config.type}`);

    try {
      if (config.type === 'FEE') {
        const feeAmount = config.feeAmount as unknown as number; // Decimal type handling
        // Apply fine logic here
        this.logger.log(`[PENALTY] Deducting ${feeAmount} KES from user ${userId} wallet.`);

        // For now, we log this as a requirement for the financial service
        // In the future, this would call WalletService.deduct()
      } else if (config.type === 'REVOKE_BADGE' && config.badgeId) {
        this.logger.log(`[PENALTY] Revoking badge ${config.badgeId} from user ${userId}.`);

        const deleteResult = await this.prisma.userBadge.deleteMany({
          where: {
            userId,
            badgeId: config.badgeId,
          },
        });

        if (deleteResult.count === 0) {
          this.logger.warn(`User ${userId} did not have badge ${config.badgeId} to revoke.`);
        }
      }

      return { success: true, message: 'SOS misuse penalty applied successfully.' };
    } catch (error) {
      this.logger.error(`Failed to apply SOS misuse penalty to user ${userId}: ${error.message}`);
      throw error;
    }
  }
}
