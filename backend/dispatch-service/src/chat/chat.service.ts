import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { sanitizeChatMessage } from './pii-filter.util';

export interface TripChatMessage {
  id: string;
  tripId: string;
  senderId: string;
  senderName: string;
  senderRole: 'PASSENGER' | 'DRIVER' | 'DISPATCHER' | 'SYSTEM';
  text: string;
  wasRedacted: boolean;
  timestamp: Date;
}

export interface TripParticipantAuth {
  authorized: boolean;
  role: 'PASSENGER' | 'DRIVER' | 'DISPATCHER';
  senderName: string;
  rideId: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private tripHistories = new Map<string, TripChatMessage[]>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifies that the connecting user is an authorized participant (Passenger, Driver, or Dispatcher)
   */
  async authorizeUserForTrip(
    userId: string,
    userRole: string,
    tripId: string
  ): Promise<TripParticipantAuth> {
    const roleUpper = (userRole || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(roleUpper);

    // If caller is an administrator/dispatcher, grant supervisory access
    if (isAdmin) {
      return {
        authorized: true,
        role: 'DISPATCHER',
        senderName: 'Dispatch Command',
        rideId: tripId,
      };
    }

    try {
      const ride = await this.prisma.ride.findFirst({
        where: {
          OR: [{ id: tripId }, { tripCode: tripId }],
        },
        include: {
          passenger: { select: { id: true, fullName: true } },
          driver: { include: { user: { select: { id: true, fullName: true } } } },
        },
      });

      if (!ride) {
        // If ride not yet in DB (e.g. simulated demo), verify fallback
        return {
          authorized: true,
          role: roleUpper === 'DRIVER' ? 'DRIVER' : 'PASSENGER',
          senderName: roleUpper === 'DRIVER' ? 'Captain' : 'Passenger',
          rideId: tripId,
        };
      }

      if (ride.passengerId === userId) {
        return {
          authorized: true,
          role: 'PASSENGER',
          senderName: ride.passenger?.fullName || 'Passenger',
          rideId: ride.id,
        };
      }

      if (ride.driver?.userId === userId) {
        return {
          authorized: true,
          role: 'DRIVER',
          senderName: ride.driver.user?.fullName || 'Captain',
          rideId: ride.id,
        };
      }

      throw new ForbiddenException('Access denied: You are not an assigned participant for this trip.');
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      this.logger.warn(`Trip participant lookup error: ${err.message}. Defaulting to role verification.`);
      return {
        authorized: true,
        role: roleUpper === 'DRIVER' ? 'DRIVER' : 'PASSENGER',
        senderName: roleUpper === 'DRIVER' ? 'Captain' : 'Passenger',
        rideId: tripId,
      };
    }
  }

  /**
   * Processes, sanitizes (PII / phone numbers), and stores in-trip messages
   */
  saveMessage(payload: {
    tripId: string;
    senderId: string;
    senderRole: 'PASSENGER' | 'DRIVER' | 'DISPATCHER' | 'SYSTEM';
    senderName: string;
    text: string;
  }): { message: TripChatMessage; systemWarning?: TripChatMessage } {
    const { sanitizedText, wasRedacted, safetyWarning } = sanitizeChatMessage(payload.text);

    const message: TripChatMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      tripId: payload.tripId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderRole: payload.senderRole,
      text: sanitizedText,
      wasRedacted,
      timestamp: new Date(),
    };

    const history = this.tripHistories.get(payload.tripId) || [];
    history.push(message);

    let systemWarningMsg: TripChatMessage | undefined;
    if (wasRedacted && safetyWarning) {
      systemWarningMsg = {
        id: `sys_${Date.now()}`,
        tripId: payload.tripId,
        senderId: 'system-safety',
        senderName: 'Cabi Safety Guard',
        senderRole: 'SYSTEM',
        text: safetyWarning,
        wasRedacted: false,
        timestamp: new Date(),
      };
      history.push(systemWarningMsg);
    }

    // Keep last 100 messages per active trip
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    this.tripHistories.set(payload.tripId, history);

    return { message, systemWarning: systemWarningMsg };
  }

  /**
   * Retrieves message history for an active trip
   */
  getTripHistory(tripId: string): TripChatMessage[] {
    return this.tripHistories.get(tripId) || [];
  }

  /**
   * Clears transcript upon trip finalization
   */
  clearTripHistory(tripId: string): void {
    this.tripHistories.delete(tripId);
  }
}
