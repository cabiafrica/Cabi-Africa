import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideService } from '../ride/ride.service';
import { SafetySmsService } from '../safety/safety-sms.service';
import { UssdService } from './ussd.service';
import {
  resolveLandmark,
  calculateDistanceKm,
  estimateOfflineFare,
} from './landmarks.util';

@Injectable()
export class SmsBookingService {
  private readonly logger = new Logger(SmsBookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rideService: RideService,
    private readonly ussdService: UssdService,
    private readonly safetySmsService: SafetySmsService,
  ) {}

  /**
   * Processes inbound SMS commands from Africa's Talking SMS Webhook
   */
  async handleInboundSms(payload: {
    from: string;
    to?: string;
    text: string;
    id?: string;
  }): Promise<{ reply: string; success: boolean }> {
    const fromPhone = payload.from;
    const bodyText = (payload.text || '').trim();

    this.logger.log(`[SMS Booking] Inbound SMS from ${fromPhone}: "${bodyText}"`);

    const lower = bodyText.toLowerCase();

    // 1. HELP command
    if (lower === 'cabi help' || lower === 'help' || lower === 'cabigo') {
      const reply =
        `Cabi Africa SMS Booking:\n` +
        `Send: CABIGO <Pickup> to <Dropoff>\n` +
        `Or: CABIGO BODA <Pickup> to <Dropoff>\n` +
        `Example: CABIGO CBD to Westlands\n` +
        `Check status: CABI STATUS\n` +
        `Cancel: CABI CANCEL`;
      await this.safetySmsService.sendSms(fromPhone, reply);
      return { reply, success: true };
    }

    // 2. STATUS command
    if (lower === 'cabi status' || lower === 'status') {
      const formatted = fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`;
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ phone: formatted }, { phone: formatted.replace('+', '') }] },
      });

      if (!user) {
        const reply = `Cabi Africa: No active ride found for your number. Send CABIGO <Pickup> to <Destination> to book.`;
        await this.safetySmsService.sendSms(fromPhone, reply);
        return { reply, success: false };
      }

      const active = await this.prisma.ride.findFirst({
        where: {
          passengerId: user.id,
          status: { in: ['REQUESTED', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] as any },
        },
        include: { driver: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (!active) {
        const reply = `Cabi Africa: You have no active trips at this time. Send CABIGO <Pickup> to <Destination> to book.`;
        await this.safetySmsService.sendSms(fromPhone, reply);
        return { reply, success: false };
      }

      const reply =
        `Cabi Africa Ride ${active.tripCode || active.id.substring(0, 8)}:\n` +
        `Status: ${active.status}\n` +
        `Captain: ${active.driver?.user?.fullName || 'Assigning nearest...'}\n` +
        `Fare: KES ${active.fare}\n` +
        `PIN: ${active.tripCode?.slice(-4) || '1234'}`;
      await this.safetySmsService.sendSms(fromPhone, reply);
      return { reply, success: true };
    }

    // 3. CANCEL command
    if (lower === 'cabi cancel' || lower === 'cancel') {
      const formatted = fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`;
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ phone: formatted }, { phone: formatted.replace('+', '') }] },
      });

      if (!user) {
        const reply = `Cabi Africa: No active booking found to cancel.`;
        await this.safetySmsService.sendSms(fromPhone, reply);
        return { reply, success: false };
      }

      const active = await this.prisma.ride.findFirst({
        where: {
          passengerId: user.id,
          status: { in: ['REQUESTED', 'ACCEPTED'] as any },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!active) {
        const reply = `Cabi Africa: No cancellable pending booking found. (In-progress rides cannot be cancelled).`;
        await this.safetySmsService.sendSms(fromPhone, reply);
        return { reply, success: false };
      }

      await this.prisma.ride.update({
        where: { id: active.id },
        data: { status: 'CANCELLED' as any },
      });

      const reply = `Cabi Africa: Your ride ${active.tripCode || ''} has been cancelled successfully. No fee charged.`;
      await this.safetySmsService.sendSms(fromPhone, reply);
      return { reply, success: true };
    }

    // 4. Booking Parser: CABIGO [BODA] <Pickup> to <Dropoff>
    const bookingRegex = /^(?:cabigo|cabi|ride)?\s*(boda)?\s*(.+?)\s+(?:to|-)\s+(.+)$/i;
    const match = bodyText.match(bookingRegex);

    if (!match) {
      const reply =
        `Cabi Africa: Could not understand booking format.\n` +
        `Please send: CABIGO <Pickup> to <Destination>\n` +
        `Example: CABIGO CBD to Westlands`;
      await this.safetySmsService.sendSms(fromPhone, reply);
      return { reply, success: false };
    }

    const isBoda = !!match[1] || lower.includes('boda');
    const vehicleType: 'STANDARD' | 'BODA' = isBoda ? 'BODA' : 'STANDARD';
    const pickupStr = match[2].trim();
    const dropoffStr = match[3].trim();

    const pickup = resolveLandmark(pickupStr);
    const dropoff = resolveLandmark(dropoffStr);

    if (!pickup || !dropoff) {
      const reply = `Cabi Africa: Could not locate locations "${pickupStr}" or "${dropoffStr}". Please use known landmarks like CBD, Westlands, JKIA, Kilimani.`;
      await this.safetySmsService.sendSms(fromPhone, reply);
      return { reply, success: false };
    }

    const distanceKm = calculateDistanceKm(
      pickup.latitude,
      pickup.longitude,
      dropoff.latitude,
      dropoff.longitude,
    );
    const fare = estimateOfflineFare(distanceKm, vehicleType);

    try {
      const passenger = await this.ussdService.ensureOfflinePassenger(fromPhone);

      const pickupData = {
        address: pickup.name,
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      };

      const dropoffData = {
        address: dropoff.name,
        latitude: dropoff.latitude,
        longitude: dropoff.longitude,
      };

      const ride = await this.rideService.createRide(
        passenger.id,
        pickupData,
        dropoffData,
        fare,
        vehicleType,
        true,
        'SMS_OFFLINE_VERIFIED',
      );

      const tripCode = ride.tripCode || `TRP-${Date.now().toString().slice(-5)}`;
      const boardingPin = ride.boardingPin || tripCode.slice(-4);

      const reply =
        `Cabi Africa: Ride ${tripCode} confirmed!\n` +
        `From: ${pickup.name}\n` +
        `To: ${dropoff.name}\n` +
        `Est Fare: KES ${fare} (${vehicleType === 'BODA' ? 'Boda' : 'Cab'})\n` +
        `Boarding PIN: ${boardingPin}\n` +
        `Matching Captain... Payment prompt sent on completion.`;

      await this.safetySmsService.sendSms(fromPhone, reply);
      return { reply, success: true };
    } catch (err: any) {
      this.logger.error(`SMS booking error: ${err.message}`);
      const reply = `Cabi Africa: Could not process booking right now: ${err.message}. Please dial *384*222#`;
      await this.safetySmsService.sendSms(fromPhone, reply);
      return { reply, success: false };
    }
  }
}
