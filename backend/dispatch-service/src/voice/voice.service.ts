import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';

export interface VoipSessionAudit {
  id: string;
  tripId: string;
  callerId: string;
  callerRole: 'PASSENGER' | 'DRIVER';
  receiverId: string;
  durationSeconds: number;
  disconnectionReason: 'NORMAL_HANGUP' | 'REJECTED' | 'ICE_TIMEOUT' | 'CELLULAR_FALLBACK';
  timestamp: Date;
}

export interface MaskedCallBridgeResult {
  success: boolean;
  sessionId: string;
  tripId: string;
  virtualProxyNumber: string;
  callerRole: 'PASSENGER' | 'DRIVER';
  destinationMasked: string;
  message: string;
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private activeVoiceSessions = new Map<string, any>();
  private callAudits: VoipSessionAudit[] = [];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Normalizes Kenyan/International telephone number to E.164
   */
  private formatPhoneNumber(phone: string): string {
    let clean = (phone || '').trim().replace(/[\s-]/g, '');
    if (clean.startsWith('0')) {
      clean = `+254${clean.slice(1)}`;
    } else if (clean.startsWith('254')) {
      clean = `+${clean}`;
    } else if (!clean.startsWith('+')) {
      clean = `+${clean}`;
    }
    return clean;
  }

  /**
   * Masks a telephone number for safe transmission to client (e.g. +254 7*** ***78)
   */
  private maskPhoneNumber(phone: string): string {
    const clean = this.formatPhoneNumber(phone);
    if (clean.length < 9) return '+254 7*** ***00';
    return `${clean.substring(0, 6)}*** ***${clean.substring(clean.length - 2)}`;
  }

  /**
   * Returns Cabi's virtual proxy number for direct cellular dialer fallback
   */
  getVirtualProxyNumber(): string {
    return process.env.AT_VOICE_NUMBER || '+254711082000';
  }

  /**
   * Initiates a dual-party masked cellular voice call bridge via Africa's Talking
   */
  async initiateMaskedCallBridge(
    tripId: string,
    initiatorUserId: string,
  ): Promise<MaskedCallBridgeResult> {
    const ride = await this.prisma.ride.findFirst({
      where: {
        OR: [{ id: tripId }, { tripCode: tripId }],
      },
      include: {
        passenger: true,
        driver: { include: { user: true } },
      },
    });

    if (!ride) {
      throw new NotFoundException(`Trip ${tripId} not found`);
    }

    const isPassenger = ride.passengerId === initiatorUserId;
    const isDriver = ride.driver?.userId === initiatorUserId;

    if (!isPassenger && !isDriver) {
      throw new ForbiddenException('Access denied: You are not an assigned participant in this trip.');
    }

    const callerRole: 'PASSENGER' | 'DRIVER' = isPassenger ? 'PASSENGER' : 'DRIVER';
    const callerPhone = isPassenger
      ? ride.passenger?.phoneNumber
      : ride.driver?.user?.phoneNumber;
    const destinationPhone = isPassenger
      ? ride.driver?.user?.phoneNumber
      : ride.passenger?.phoneNumber;

    const proxyNumber = this.getVirtualProxyNumber();
    const sessionId = `call_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const username = process.env.AT_USERNAME || process.env.AFRICASTALKING_USERNAME;
    const apiKey = process.env.AT_API_KEY || process.env.AFRICASTALKING_API_KEY;

    if (username && apiKey && username !== 'mock' && destinationPhone) {
      try {
        const isSandbox = username.toLowerCase() === 'sandbox';
        const endpoint = isSandbox
          ? 'https://voice.sandbox.africastalking.com/call'
          : 'https://voice.africastalking.com/call';

        const params = new URLSearchParams();
        params.append('username', username);
        params.append('from', proxyNumber);
        params.append('to', this.formatPhoneNumber(destinationPhone));

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            apiKey: apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: params.toString(),
        });

        const data: any = await response.json().catch(() => ({}));
        this.logger.log(
          `[Africa's Talking Voice] Initiated masked bridge for trip ${tripId}: HTTP ${response.status} (${JSON.stringify(data)})`,
        );
      } catch (err: any) {
        this.logger.warn(`[Africa's Talking Voice] Bridge API call warning: ${err.message}`);
      }
    } else {
      this.logger.log(
        `[Simulation] Masked voice bridge session ${sessionId} simulated between ${callerRole} and destination for trip ${tripId}`,
      );
    }

    // Save session mapping for inbound callback bridging
    this.activeVoiceSessions.set(sessionId, {
      tripId: ride.id,
      callerId: initiatorUserId,
      callerRole,
      callerPhone,
      destinationPhone,
      timestamp: new Date(),
    });

    return {
      success: true,
      sessionId,
      tripId: ride.id,
      virtualProxyNumber: proxyNumber,
      callerRole,
      destinationMasked: destinationPhone ? this.maskPhoneNumber(destinationPhone) : '+254 7*** ***00',
      message: 'Masked cellular call bridge initiated successfully.',
    };
  }

  /**
   * Handles Africa's Talking Voice IVR Webhook Callbacks
   */
  handleVoiceCallback(body: any): string {
    const isActive = body?.isActive === '1';
    const sessionId = body?.sessionId || body?.callSessionId;
    const callerNumber = body?.callerNumber;

    this.logger.log(
      `[Africa's Talking Callback] Session: ${sessionId}, isActive: ${isActive}, caller: ${callerNumber}`,
    );

    if (isActive) {
      // Find matching trip session
      let targetDestination: string | null = null;
      for (const [_, session] of this.activeVoiceSessions.entries()) {
        if (session.destinationPhone) {
          targetDestination = this.formatPhoneNumber(session.destinationPhone);
          break;
        }
      }

      if (targetDestination) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Connecting to your Cabi Africa trip participant. Your personal phone number remains private.</Say>
  <Dial phoneNumbers="${targetDestination}" record="false" sequential="true" />
</Response>`;
      }

      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling Cabi Africa. No active trip was found for this number.</Say>
  <Reject />
</Response>`;
    }

    // Call has completed
    const duration = parseInt(body?.durationInSeconds || '0', 10);
    this.logVoipSession({
      tripId: body?.tripId || 'trip_unknown',
      callerId: callerNumber || 'unknown',
      callerRole: 'PASSENGER',
      receiverId: 'peer',
      durationSeconds: duration,
      disconnectionReason: 'NORMAL_HANGUP',
    });

    return `<?xml version="1.0" encoding="UTF-8"?><Response />`;
  }

  /**
   * Records a VoIP or cellular call audit event for customer support and dispute records
   */
  logVoipSession(metadata: {
    tripId: string;
    callerId: string;
    callerRole: 'PASSENGER' | 'DRIVER';
    receiverId: string;
    durationSeconds: number;
    disconnectionReason: 'NORMAL_HANGUP' | 'REJECTED' | 'ICE_TIMEOUT' | 'CELLULAR_FALLBACK';
  }): VoipSessionAudit {
    const audit: VoipSessionAudit = {
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      tripId: metadata.tripId,
      callerId: metadata.callerId,
      callerRole: metadata.callerRole,
      receiverId: metadata.receiverId,
      durationSeconds: metadata.durationSeconds,
      disconnectionReason: metadata.disconnectionReason,
      timestamp: new Date(),
    };

    this.callAudits.push(audit);
    if (this.callAudits.length > 500) {
      this.callAudits.splice(0, this.callAudits.length - 500);
    }

    this.logger.log(
      `[VoIP Audit] Logged call for trip ${metadata.tripId} (${metadata.durationSeconds}s, reason: ${metadata.disconnectionReason})`,
    );

    return audit;
  }

  /**
   * Retrieves call audits for an active trip
   */
  getTripCallAudits(tripId: string): VoipSessionAudit[] {
    return this.callAudits.filter((a) => a.tripId === tripId);
  }
}
