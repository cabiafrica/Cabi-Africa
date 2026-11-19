import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { RideService } from '../ride/ride.service';
import { SafetySmsService } from '../safety/safety-sms.service';
import {
  POPULAR_LANDMARKS,
  Landmark,
  calculateDistanceKm,
  estimateOfflineFare,
  resolveLandmark,
} from './landmarks.util';

export interface UssdSessionDraft {
  vehicleType: 'STANDARD' | 'BODA';
  pickup?: Landmark;
  dropoff?: Landmark;
  fare?: number;
  distanceKm?: number;
  createdAt: number;
}

@Injectable()
export class UssdService {
  private readonly logger = new Logger(UssdService.name);
  private sessionDrafts = new Map<string, UssdSessionDraft>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly rideService: RideService,
    private readonly safetySmsService: SafetySmsService,
  ) {}

  /**
   * Normalizes telephone numbers to standard E.164 format (+254...)
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
   * Auto-provisions an offline passenger user profile if one does not exist
   */
  async ensureOfflinePassenger(phoneNumber: string): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: formattedPhone }, { phone: formattedPhone.replace('+', '') }],
      },
    });

    if (!user) {
      const email = `offline_${formattedPhone.replace(/\D/g, '')}@cabi.africa`;
      user = await this.prisma.user.create({
        data: {
          phone: formattedPhone,
          email,
          password: `offline_pass_${Date.now()}`,
          fullName: `Offline Rider (${formattedPhone.slice(-4)})`,
          role: 'PASSENGER',
          status: 'ACTIVE',
          isPhoneVerified: true,
          isVerifiedPassenger: true,
        },
      });
      this.logger.log(`Created new offline passenger profile for ${formattedPhone}: ${user.id}`);
    }

    return user;
  }

  /**
   * Main USSD state machine handler
   * Implements Africa's Talking USSD protocol (CON = continue, END = terminate)
   */
  async handleUssdRequest(payload: {
    sessionId: string;
    serviceCode: string;
    phoneNumber: string;
    text: string;
  }): Promise<string> {
    const phone = this.formatPhoneNumber(payload.phoneNumber);
    const rawText = (payload.text || '').trim();
    const parts = rawText ? rawText.split('*').map((p) => p.trim()) : [];

    this.logger.log(`[USSD] ${phone} -> text: "${rawText}" (parts: ${parts.length})`);

    // 1. Check for 5-Minute Session Resume
    const existingDraft = this.sessionDrafts.get(phone);
    const hasValidDraft =
      existingDraft &&
      Date.now() - existingDraft.createdAt < 5 * 60 * 1000 &&
      existingDraft.pickup &&
      existingDraft.dropoff &&
      existingDraft.fare;

    if (parts.length === 0 && hasValidDraft) {
      return (
        `CON Welcome back to Cabi Africa!\n` +
        `Resume booking to ${existingDraft.dropoff!.name}?\n` +
        `Fare: KES ${existingDraft.fare} (${existingDraft.vehicleType})\n\n` +
        `1. Confirm & Dispatch\n` +
        `2. Start Over`
      );
    }

    // If user was prompted with resume and replied:
    if (parts.length === 1 && hasValidDraft) {
      if (parts[0] === '1') {
        return this.dispatchOfflineBooking(phone, existingDraft);
      } else {
        // Discard draft and proceed to standard main menu
        this.sessionDrafts.delete(phone);
        return this.renderMainMenu();
      }
    }

    // 2. Main Menu Navigation
    if (parts.length === 0) {
      return this.renderMainMenu();
    }

    const choice = parts[0];

    // Branch 1: Standard Cab Booking
    // Branch 2: Boda Boda Booking
    if (choice === '1' || choice === '2') {
      const vehicleType = choice === '1' ? 'STANDARD' : 'BODA';
      return this.handleBookingFlow(phone, vehicleType, parts.slice(1));
    }

    // Branch 3: Check Active Trip Status
    if (choice === '3') {
      return this.handleActiveTripStatus(phone);
    }

    // Branch 4: Cancel Active Trip
    if (choice === '4') {
      return this.handleCancelTrip(phone);
    }

    // Branch 5: Cabi Safety & Support
    if (choice === '5') {
      return (
        `END Cabi Africa Safety Command Desk:\n` +
        `Police Emergency: 999 / 112\n` +
        `Cabi 24/7 Hotline: +254 711 082 000\n` +
        `All trips covered by Sacco Insurance.`
      );
    }

    return `END Invalid option selected. Please redial *384*222#`;
  }

  private renderMainMenu(): string {
    return (
      `CON Welcome to Cabi Africa Offline Dispatch\n` +
      `1. Book Cab (Standard)\n` +
      `2. Book Boda Boda\n` +
      `3. Check Active Trip Status\n` +
      `4. Cancel Active Trip\n` +
      `5. Cabi Safety & Support`
    );
  }

  private renderLandmarksMenu(title: string): string {
    let menu = `CON ${title}:\n`;
    for (let i = 0; i < 7; i++) {
      const lm = POPULAR_LANDMARKS[i];
      menu += `${lm.id}. ${lm.name.split('(')[0].trim()}\n`;
    }
    menu += `8. Other Location Name`;
    return menu;
  }

  private async handleBookingFlow(
    phone: string,
    vehicleType: 'STANDARD' | 'BODA',
    steps: string[],
  ): Promise<string> {
    // Step 1: Select Pickup
    if (steps.length === 0) {
      return this.renderLandmarksMenu('Select Pickup Landmark');
    }

    const pickupQuery = steps[0];
    const pickup = resolveLandmark(pickupQuery);
    if (!pickup) {
      return `CON Landmark not recognized.\n${this.renderLandmarksMenu('Select Pickup Landmark')}`;
    }

    // Step 2: Select Dropoff
    if (steps.length === 1) {
      return this.renderLandmarksMenu('Select Dropoff Destination');
    }

    const dropoffQuery = steps[1];
    const dropoff = resolveLandmark(dropoffQuery);
    if (!dropoff) {
      return `CON Destination not recognized.\n${this.renderLandmarksMenu('Select Dropoff Destination')}`;
    }

    // Step 3: Fare Preview & Confirmation
    const distanceKm = calculateDistanceKm(
      pickup.latitude,
      pickup.longitude,
      dropoff.latitude,
      dropoff.longitude,
    );
    const fare = estimateOfflineFare(distanceKm, vehicleType);

    // Save draft for 5-minute resume in case of telco timeout
    const draft: UssdSessionDraft = {
      vehicleType,
      pickup,
      dropoff,
      distanceKm,
      fare,
      createdAt: Date.now(),
    };
    this.sessionDrafts.set(phone, draft);

    if (steps.length === 2) {
      return (
        `CON Trip Preview:\n` +
        `From: ${pickup.code}\n` +
        `To: ${dropoff.code}\n` +
        `Dist: ${distanceKm} km\n` +
        `Fare: KES ${fare} (${vehicleType === 'BODA' ? 'Boda' : 'Cab'})\n` +
        `Payment: M-PESA STK Push / Cash\n\n` +
        `1. Confirm & Dispatch\n` +
        `2. Cancel`
      );
    }

    // Step 4: Dispatch Confirmation
    const confirmation = steps[2];
    if (confirmation === '1') {
      return this.dispatchOfflineBooking(phone, draft);
    }

    this.sessionDrafts.delete(phone);
    return `END Booking cancelled. Dial *384*222# anytime to book again.`;
  }

  /**
   * Finalizes offline booking, provisions rider, creates ride in DB, triggers matching, and dispatches SMS
   */
  async dispatchOfflineBooking(
    phone: string,
    draft: UssdSessionDraft,
  ): Promise<string> {
    try {
      this.sessionDrafts.delete(phone);

      // Ensure passenger account exists
      const passenger = await this.ensureOfflinePassenger(phone);

      const pickupData = {
        address: draft.pickup?.name || 'Nairobi Central',
        latitude: draft.pickup?.latitude || -1.286389,
        longitude: draft.pickup?.longitude || 36.817223,
      };

      const dropoffData = {
        address: draft.dropoff?.name || 'Destination',
        latitude: draft.dropoff?.latitude || -1.2683,
        longitude: draft.dropoff?.longitude || 36.8111,
      };

      const ride = await this.rideService.createRide(
        passenger.id,
        pickupData,
        dropoffData,
        draft.fare || 250,
        draft.vehicleType,
        true,
        'USSD_OFFLINE_VERIFIED',
      );

      const tripCode = ride.tripCode || `TRP-${Date.now().toString().slice(-5)}`;
      const boardingPin = ride.boardingPin || tripCode.slice(-4);

      // Dispatch Cellular SMS confirmation
      const smsMessage =
        `Cabi Africa: Ride ${tripCode} confirmed!\n` +
        `From: ${draft.pickup?.name}\n` +
        `To: ${draft.dropoff?.name}\n` +
        `Estimated Fare: KES ${draft.fare}\n` +
        `Boarding PIN: ${boardingPin}\n` +
        `Matching Captain... An M-PESA payment prompt will arrive upon completion.`;

      this.safetySmsService.sendSms(phone, smsMessage).catch((err) =>
        this.logger.warn(`Could not dispatch SMS to ${phone}: ${err.message}`),
      );

      return (
        `END Ride Confirmed! ${tripCode}\n` +
        `Fare: KES ${draft.fare}\n` +
        `Boarding PIN: ${boardingPin}\n` +
        `Searching for nearest Captain...\n` +
        `Driver plate and details sent via SMS.`
      );
    } catch (err: any) {
      this.logger.error(`Offline booking dispatch error: ${err.message}`);
      return `END Sorry, could not dispatch ride right now: ${err.message}. Please try again shortly.`;
    }
  }

  private async handleActiveTripStatus(phone: string): Promise<string> {
    const formattedPhone = this.formatPhoneNumber(phone);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: formattedPhone }, { phone: formattedPhone.replace('+', '') }],
      },
    });

    if (!user) {
      return `END You have no registered trips. Dial *384*222# to book a ride.`;
    }

    const activeRide = await this.prisma.ride.findFirst({
      where: {
        passengerId: user.id,
        status: { in: ['REQUESTED', 'ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] as any },
      },
      include: {
        driver: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeRide) {
      return `END No active trips found for your number. Dial *384*222# to book.`;
    }

    const captainName = activeRide.driver?.user?.fullName || 'Assigning Captain...';
    return (
      `END Active Ride: ${activeRide.tripCode || activeRide.id.substring(0, 8)}\n` +
      `Status: ${activeRide.status}\n` +
      `Captain: ${captainName}\n` +
      `Fare: KES ${activeRide.fare}\n` +
      `PIN: ${activeRide.tripCode?.slice(-4) || '1234'}`
    );
  }

  private async handleCancelTrip(phone: string): Promise<string> {
    const formattedPhone = this.formatPhoneNumber(phone);
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: formattedPhone }, { phone: formattedPhone.replace('+', '') }],
      },
    });

    if (!user) {
      return `END No active ride found to cancel.`;
    }

    const activeRide = await this.prisma.ride.findFirst({
      where: {
        passengerId: user.id,
        status: { in: ['REQUESTED', 'ACCEPTED'] as any },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeRide) {
      return `END No pending ride found to cancel. (In-progress rides cannot be cancelled via USSD).`;
    }

    await this.prisma.ride.update({
      where: { id: activeRide.id },
      data: { status: 'CANCELLED' as any },
    });

    this.safetySmsService.sendSms(
      phone,
      `Cabi Africa: Your ride ${activeRide.tripCode || ''} has been cancelled successfully. No fee charged.`,
    ).catch(() => {});

    return `END Trip ${activeRide.tripCode || ''} has been cancelled. No cancellation fee charged.`;
  }
}
