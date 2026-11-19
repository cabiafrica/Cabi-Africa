import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { SOSGateway, SOSBroadcastAlert } from './sos.gateway';
import { SafetySmsService } from './safety-sms.service';
import { SosConfigService } from './sos-config.service';

export interface SosSignalDto {
  tripId: string;
  location: { lat: number; lon: number };
  emergencyContacts?: Array<{ name: string; phone: string }>;
}

export interface NearbyCaptainTarget {
  captainId: string;
  captainUserId: string;
  name: string;
  phone?: string;
  distanceKm: number;
  location: { lat: number; lng: number };
}

/**
 * Calculates surface distance in kilometres between two geographic coordinates using the Haversine formula
 */
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

@Injectable()
export class SafetyService {
  private readonly logger = new Logger(SafetyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sosGateway: SOSGateway,
    private readonly smsService: SafetySmsService,
    private readonly sosConfigService: SosConfigService,
  ) { }

  /**
   * Universal SOS Distress Handler: Proximity Mesh, Patron Routing, DB Persistence, Real Ledger Math, and SMS Rails
   */
  async handleSosSignal(userId: string, userRole: string, signal: SosSignalDto) {
    const isDriver = (userRole || '').toUpperCase() === 'DRIVER';
    const callerType: 'PASSENGER' | 'DRIVER' = isDriver ? 'DRIVER' : 'PASSENGER';
    const location = { lat: Number(signal.location.lat), lng: Number(signal.location.lon) };
    const tripId = signal.tripId || 'UNASSIGNED';

    this.logger.warn(
      `🚨 [SOS] Distress signal received from ${callerType} ${userId} at [${location.lat}, ${location.lng}] for trip ${tripId}`
    );

    // 1. Resolve User and Driver Profiles
    let driverProfileId: string | null = null;
    let callerName = isDriver ? 'Captain' : 'Passenger';
    let callerPhone: string | null = null;
    let groupPatronInfo: any = null;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { driverProfile: { include: { driver_groups: true } } },
      });

      if (user) {
        callerName = user.fullName || callerName;
        callerPhone = user.phone || null;
        if (user.driverProfile) {
          driverProfileId = user.driverProfile.id;
          if (user.driverProfile.driver_groups) {
            const group = user.driverProfile.driver_groups;
            groupPatronInfo = {
              id: group.parentGroupId || 'patron-stage',
              name: `Stage Patron (${group.name})`,
              phone: '+254722123456',
              groupName: group.name,
              channel: 'SMS_AND_INAPP',
            };
          }
        }
      }
    } catch (e: any) {
      this.logger.warn(`Could not resolve caller profile: ${e.message}`);
    }

    if (!groupPatronInfo) {
      groupPatronInfo = {
        id: 'patron-central-command',
        name: 'Central Sacco Security Patron',
        phone: process.env.EMERGENCY_DISPATCH_PHONE || '+254711000999',
        groupName: 'Cabi Rapid Response Mesh',
        channel: 'SMS_AND_INAPP',
      };
    }

    // 2. Universal Proximity Mesh: Find active online Captains within 2.5 km (or 10 closest)
    let nearbyCaptains: NearbyCaptainTarget[] = [];
    try {
      const activeDrivers = await this.prisma.driverProfile.findMany({
        where: {
          isOnline: true,
          userId: { not: userId },
        },
        include: {
          user: { select: { fullName: true, phone: true } },
        },
        take: 50,
      });

      const captainsWithDistances: NearbyCaptainTarget[] = [];
      for (const d of activeDrivers) {
        let lat: number | null = null;
        let lng: number | null = null;

        if (d.currentLocation && typeof d.currentLocation === 'object') {
          const loc = d.currentLocation as any;
          lat = Number(loc.lat);
          lng = Number(loc.lng || loc.lon);
        }

        if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
          captainsWithDistances.push({
            captainId: d.id,
            captainUserId: d.userId,
            name: d.user?.fullName || 'Captain',
            phone: d.user?.phone,
            distanceKm: calculateHaversineDistanceKm(location.lat, location.lng, lat, lng),
            location: { lat, lng },
          });
        }
      }

      captainsWithDistances.sort((a, b) => a.distanceKm - b.distanceKm);
      const within2_5km = captainsWithDistances.filter((c) => c.distanceKm <= 2.5);
      nearbyCaptains = within2_5km.length >= 10 ? within2_5km : captainsWithDistances.slice(0, 10);
    } catch (err: any) {
      this.logger.error(`Error resolving proximity mesh: ${err.message}`);
    }

    const obNumber = `OB-SOS-${Date.now()}`;
    const trackingUrl = `https://cabi.africa/sos/${obNumber}`;
    const rewardPoints = 500;
    const distressFee = isDriver ? 500 : 0;
    const distressFeeStatus = isDriver ? 'BILLED' : 'NONE';

    // 3. Persist Occurrence Record in PostgreSQL
    const locationDetails = {
      trackingUrl,
      coordinates: location,
      callerType,
      callerName,
      callerPhone,
      notifiedCaptainsCount: nearbyCaptains.length,
      nearbyCaptainsSummary: nearbyCaptains.map((c) => ({
        name: c.name,
        distanceKm: c.distanceKm,
        captainUserId: c.captainUserId,
      })),
      groupDistressPatron: groupPatronInfo,
      goodSamaritanRewardPoints: rewardPoints,
      distressFee,
      distressFeeStatus,
      responders: [],
      history: [
        {
          event: 'DISTRESS_SIGNAL_TRIGGERED',
          at: new Date().toISOString(),
          by: userId,
          role: callerType,
        },
      ],
    };

    let occurrence;
    try {
      occurrence = await this.prisma.occurrence.create({
        data: {
          obNumber,
          category: 'SAFETY_VIOLATION',
          severity: 'CRITICAL',
          title: `SOS Emergency Signal — ${isDriver ? 'Captain' : 'Passenger'} (${callerName})`,
          description: `Distress signal initiated at coordinates [${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}] on trip ${tripId}. Universal Proximity Mesh broadcast to ${nearbyCaptains.length} nearby Captains. ${isDriver ? 'KES 500 emergency distress fee billed with negative balance allowance (pardon available).' : ''}`,
          driverId: driverProfileId,
          passengerId: isDriver ? null : userId,
          rideId: tripId !== 'UNASSIGNED' ? tripId : null,
          occurrenceDate: new Date(),
          occurrenceTime: new Date(),
          occurredAt: new Date(),
          locationLat: location.lat as any,
          locationLng: location.lng as any,
          locationAddress: `Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
          locationCity: 'Nairobi',
          source: 'SOS_SYSTEM',
          registeredById: userId,
          status: 'OPEN',
          locationDetails: locationDetails as any,
        },
      });
      this.logger.log(`[SafetyService] Created Occurrence record #${occurrence.obNumber} (ID: ${occurrence.id})`);
    } catch (e: any) {
      this.logger.error(`Failed to create Occurrence record: ${e.message}`);
      throw new BadRequestException(`Could not record SOS incident in Occurrence Book: ${e.message}`);
    }

    // 4. Accurate Driver Ledger Debit (KES 500 with Negative Allowance)
    if (isDriver && driverProfileId) {
      try {
        await this.prisma.commissionLedger.create({
          data: {
            driverId: driverProfileId,
            amount: 500,
            type: 'DEBIT',
            transactionType: 'SOS_DISTRESS_FEE',
            reason: `Emergency distress call fee billed for incident #${obNumber}. Captain may submit pardon request to Senior Cabi Distress Official.`,
          },
        });
        this.logger.warn(`[SafetyService] Debited KES 500 distress fee from DriverProfile ${driverProfileId}`);
      } catch (ledgerErr: any) {
        this.logger.error(`Error writing distress fee to CommissionLedger: ${ledgerErr.message}`);
      }
    }

    // 5. Broadcast Real-Time WebSockets
    const broadcastAlert: SOSBroadcastAlert = {
      alertId: occurrence.id,
      occurrenceId: occurrence.id,
      obNumber,
      userId,
      userType: callerType,
      location,
      tripId,
      timestamp: occurrence.occurredAt,
      status: 'OPEN',
      notifiedCaptainsCount: nearbyCaptains.length,
      goodSamaritanRewardPoints: rewardPoints,
      distressFee,
      distressFeeStatus,
      groupDistressPatron: groupPatronInfo,
      trackingUrl,
    };

    // Broadcast to Ops Console, Dispatch Map, and Admin Panel
    this.sosGateway.sendAlert(broadcastAlert);

    // Broadcast to Sacco Distress Patron
    this.sosGateway.sendPatronDistressAlert(groupPatronInfo, broadcastAlert, trackingUrl);

    // Broadcast to Nearby Captains in Proximity Mesh
    if (nearbyCaptains.length > 0) {
      const captainUserIds = nearbyCaptains.map((c) => c.captainUserId);
      const distressBroadcastPayload = {
        alertId: occurrence.id,
        obNumber,
        callerType: isDriver ? 'CAPTAIN' : 'PASSENGER',
        callerName,
        callerUserId: userId,
        location,
        trackingUrl,
        rewardPoints,
        message: `🚨 DISTRESS ALERT: Fellow ${isDriver ? 'Captain' : 'Passenger'} needs immediate assistance nearby! Earn ${rewardPoints} Good Samaritan Points by responding.`,
      };
      this.sosGateway.sendNearbyCaptainsDistressAlert(captainUserIds, distressBroadcastPayload);
    }

    // 6. Cellular SMS Dispatch via Africa's Talking
    // A. Notify Passenger's Trusted Emergency Contacts
    try {
      const userContacts: Array<{ name: string; phone: string }> = [];

      // Add contacts passed in request
      if (Array.isArray(signal.emergencyContacts)) {
        userContacts.push(...signal.emergencyContacts);
      }

      // Add contacts saved in User privacySettings
      const userRecord = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { privacySettings: true },
      });

      if (userRecord?.privacySettings && typeof userRecord.privacySettings === 'object') {
        const priv = userRecord.privacySettings as any;
        if (Array.isArray(priv.emergencyContacts)) {
          userContacts.push(...priv.emergencyContacts);
        }
      }

      // Deduplicate phones
      const uniquePhones = new Set<string>();
      for (const contact of userContacts) {
        if (contact?.phone && !uniquePhones.has(contact.phone)) {
          uniquePhones.add(contact.phone);
          this.smsService.sendEmergencyContactAlert(
            contact.phone,
            callerName,
            trackingUrl,
            location
          ).catch((smsErr) => this.logger.warn(`SMS to contact failed: ${smsErr.message}`));
        }
      }
    } catch (contactErr: any) {
      this.logger.warn(`Could not process emergency contacts SMS: ${contactErr.message}`);
    }

    // B. Notify Sacco Distress Patron via SMS
    if (groupPatronInfo?.phone) {
      this.smsService.sendPatronDistressAlert(
        groupPatronInfo.phone,
        isDriver ? 'Captain' : 'Passenger',
        callerName,
        groupPatronInfo.groupName,
        trackingUrl
      ).catch((e) => this.logger.warn(`SMS to patron failed: ${e.message}`));
    }

    return {
      success: true,
      alertId: occurrence.id,
      obNumber,
      trackingUrl,
      status: 'OPEN',
      notifiedCaptainsCount: nearbyCaptains.length,
      distressFeeBilled: distressFee,
      message: `Emergency SOS signal confirmed. ${nearbyCaptains.length} nearby Captains and Safety Command Center alerted.`,
    };
  }

  /**
   * Lists SOS incidents from Occurrence records
   */
  async getAlerts(filter?: { status?: string; limit?: number }) {
    const where: any = {
      source: 'SOS_SYSTEM',
    };
    if (filter?.status) {
      where.status = filter.status;
    }

    const occurrences = await this.prisma.occurrence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter?.limit || 50,
      include: {
        driver: { include: { user: { select: { fullName: true, phone: true } } } },
        passenger: { select: { fullName: true, phone: true } },
      },
    });

    return occurrences.map((o) => {
      const details = (o.locationDetails as any) || {};
      return {
        id: o.id,
        obNumber: o.obNumber,
        title: o.title,
        description: o.description,
        status: o.status,
        severity: o.severity,
        category: o.category,
        occurredAt: o.occurredAt,
        location: {
          lat: Number(o.locationLat),
          lng: Number(o.locationLng),
          address: o.locationAddress,
        },
        driverName: o.driver?.user?.fullName || null,
        passengerName: o.passenger?.fullName || null,
        notifiedCaptainsCount: details.notifiedCaptainsCount || 0,
        distressFeeStatus: details.distressFeeStatus || 'NONE',
        distressFee: details.distressFee || 0,
        trackingUrl: details.trackingUrl || `https://cabi.africa/sos/${o.obNumber}`,
        responders: details.responders || [],
        history: details.history || [],
      };
    });
  }

  /**
   * Retrieves single incident details
   */
  async getAlertById(idOrOb: string) {
    const o = await this.prisma.occurrence.findFirst({
      where: {
        OR: [{ id: idOrOb }, { obNumber: idOrOb }],
      },
      include: {
        driver: { include: { user: { select: { fullName: true, phone: true } } } },
        passenger: { select: { fullName: true, phone: true } },
        registeredBy: { select: { id: true, fullName: true, role: true } },
      },
    });

    if (!o) throw new NotFoundException('Incident not found');
    return o;
  }

  /**
   * Dispatcher acknowledges an active emergency incident
   */
  async acknowledgeAlert(incidentId: string, adminId: string) {
    const incident = await this.getAlertById(incidentId);

    const details = (incident.locationDetails as any) || {};
    const history = details.history || [];
    history.push({
      event: 'ACKNOWLEDGED',
      at: new Date().toISOString(),
      by: adminId,
    });

    const updated = await this.prisma.occurrence.update({
      where: { id: incident.id },
      data: {
        status: 'UNDER_INVESTIGATION',
        locationDetails: {
          ...details,
          handledBy: adminId,
          history,
        },
      },
    });

    this.sosGateway.sendAcknowledge(updated.id, updated.obNumber, adminId);
    return { success: true, incident: updated };
  }

  /**
   * Resolves an emergency incident with resolution notes and misuse penalty adjudication
   */
  async resolveSosIncident(incidentId: string, adminId: string, isMisuse: boolean, notes: string) {
    const incident = await this.getAlertById(incidentId);
    if (!notes?.trim()) {
      throw new BadRequestException('Resolution notes are required');
    }

    const details = (incident.locationDetails as any) || {};
    const history = details.history || [];
    history.push({
      event: 'RESOLVED',
      at: new Date().toISOString(),
      by: adminId,
      isMisuse,
      notes,
    });

    // Handle Misuse Penalties
    if (isMisuse) {
      const config = await this.sosConfigService.getConfig();
      this.logger.warn(`Applying SOS misuse penalty to incident ${incident.id}. Type: ${config.type}`);

      if (config.type === 'FEE' && incident.driverId) {
        const feeAmount = Number(config.feeAmount) || 500;
        try {
          await this.prisma.commissionLedger.create({
            data: {
              driverId: incident.driverId,
              amount: feeAmount,
              type: 'DEBIT',
              transactionType: 'SOS_MISUSE_PENALTY',
              reason: `SOS false alarm misuse penalty for incident #${incident.obNumber}. Notes: ${notes}`,
            },
          });
        } catch (err: any) {
          this.logger.error(`Error debiting misuse fee: ${err.message}`);
        }
      } else if (config.type === 'REVOKE_BADGE' && config.badgeId && incident.driver?.userId) {
        try {
          await this.prisma.userBadge.deleteMany({
            where: {
              userId: incident.driver.userId,
              badgeId: config.badgeId,
            },
          });
        } catch (err: any) {
          this.logger.error(`Error revoking badge on misuse: ${err.message}`);
        }
      }
    }

    const updated = await this.prisma.occurrence.update({
      where: { id: incident.id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedById: adminId,
        resolutionNotes: notes,
        locationDetails: {
          ...details,
          isMisuse,
          resolutionNotes: notes,
          history,
        },
      },
    });

    this.sosGateway.sendResolution(updated.id, updated.obNumber, isMisuse ? 'MISUSE' : 'LEGITIMATE', notes);
    return { success: true, incident: updated };
  }

  /**
   * Good Samaritan Captain responds to proximity distress call and earns reward points
   */
  async respondAsGoodSamaritan(incidentId: string, captainUserId: string, captainName: string) {
    const incident = await this.getAlertById(incidentId);

    const details = (incident.locationDetails as any) || {};
    const responders = details.responders || [];
    const rewardPoints = details.goodSamaritanRewardPoints || 500;

    // Check if already responded
    if (responders.some((r: any) => r.captainUserId === captainUserId)) {
      return { success: true, message: 'You have already acknowledged this rescue mission.', pointsAwarded: 0 };
    }

    responders.push({
      captainUserId,
      captainName,
      respondedAt: new Date().toISOString(),
      pointsAwarded: rewardPoints,
    });

    // Credit Loyalty points to Good Samaritan Captain
    try {
      await this.prisma.loyaltyTransaction.create({
        data: {
          userId: captainUserId,
          points: rewardPoints,
          balanceAfter: rewardPoints,
          type: 'ADJUSTMENT',
          description: `Good Samaritan Points awarded for responding to emergency distress call #${incident.obNumber}`,
          metadata: { incidentId: incident.id, obNumber: incident.obNumber },
        },
      });
    } catch (loyaltyErr: any) {
      this.logger.warn(`Could not write loyalty transaction: ${loyaltyErr.message}`);
    }

    const updated = await this.prisma.occurrence.update({
      where: { id: incident.id },
      data: {
        locationDetails: {
          ...details,
          responders,
        },
      },
    });

    this.sosGateway.sendResponderUpdate(updated.id, captainUserId, captainName);

    return {
      success: true,
      incidentId: updated.id,
      pointsAwarded: rewardPoints,
      message: `Thank you Captain ${captainName}! You have been awarded ${rewardPoints} Good Samaritan Points redeemable for fuel credits or Sacco share capital.`,
    };
  }

  /**
   * Distressed driver submits a pardon request for the KES 500 distress fee
   */
  async requestDistressPardon(incidentId: string, driverUserId: string, reason: string) {
    const incident = await this.getAlertById(incidentId);

    if (incident.registeredById !== driverUserId && incident.driver?.userId !== driverUserId) {
      throw new ForbiddenException('Unauthorized: only the distressed captain can request a distress fee pardon');
    }

    const details = (incident.locationDetails as any) || {};
    const history = details.history || [];
    history.push({
      event: 'PARDON_REQUESTED',
      at: new Date().toISOString(),
      by: driverUserId,
      reason,
    });

    const updated = await this.prisma.occurrence.update({
      where: { id: incident.id },
      data: {
        locationDetails: {
          ...details,
          distressFeeStatus: 'PARDON_REQUESTED',
          pardonReason: reason,
          pardonRequestedAt: new Date().toISOString(),
          history,
        },
      },
    });

    this.logger.log(`[SafetyService] Driver ${driverUserId} requested pardon for incident #${incident.obNumber}`);
    return {
      success: true,
      obNumber: updated.obNumber,
      distressFeeStatus: 'PARDON_REQUESTED',
      message: 'Pardon request submitted successfully. Queued for Senior Cabi Distress Official review.',
    };
  }

  /**
   * Senior Cabi Distress Official reviews and grants or declines the pardon
   */
  async pardonDistressFee(
    incidentId: string,
    options: {
      officialId: string;
      officialName: string;
      approved: boolean;
      notes: string;
    }
  ) {
    const incident = await this.getAlertById(incidentId);
    const { officialId, officialName, approved, notes } = options;
    const details = (incident.locationDetails as any) || {};
    const history = details.history || [];

    if (approved) {
      history.push({
        event: 'PARDON_APPROVED',
        at: new Date().toISOString(),
        by: officialId,
        officialName,
        notes,
      });

      // Full Waiver: Credit KES 500 back to Driver in CommissionLedger
      if (incident.driverId) {
        try {
          await this.prisma.commissionLedger.create({
            data: {
              driverId: incident.driverId,
              amount: 500,
              type: 'CREDIT',
              transactionType: 'DISTRESS_FEE_PARDON',
              reason: `Full waiver of KES 500 distress fee granted by Senior Official ${officialName}. Reason: "${notes}". Responder points covered by Sacco Emergency Welfare Buffer.`,
            },
          });
        } catch (ledgerErr: any) {
          this.logger.error(`Error refunding distress fee in ledger: ${ledgerErr.message}`);
        }
      }

      await this.prisma.occurrence.update({
        where: { id: incident.id },
        data: {
          locationDetails: {
            ...details,
            distressFeeStatus: 'PARDONED',
            pardonedAt: new Date().toISOString(),
            pardonedByOfficial: officialName,
            pardonNotes: notes,
            history,
          },
        },
      });

      return {
        success: true,
        incidentId: incident.id,
        distressFeeStatus: 'PARDONED',
        pardonedBy: officialName,
        message: `Pardon approved by ${officialName}. KES 500 fee 100% credited back to Captain. Sacco Emergency Welfare Buffer activated for responder pool.`,
      };
    } else {
      history.push({
        event: 'PARDON_DECLINED',
        at: new Date().toISOString(),
        by: officialId,
        officialName,
        notes,
      });

      await this.prisma.occurrence.update({
        where: { id: incident.id },
        data: {
          locationDetails: {
            ...details,
            distressFeeStatus: 'SETTLED',
            pardonNotes: `Pardon declined by ${officialName}: ${notes}`,
            history,
          },
        },
      });

      return {
        success: false,
        incidentId: incident.id,
        distressFeeStatus: 'SETTLED',
        message: `Pardon declined by ${officialName}. KES 500 distress fee upheld.`,
      };
    }
  }

  /**
   * Retrieves user's emergency contacts persisted in privacySettings
   */
  async getEmergencyContacts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { privacySettings: true },
    });
    const priv = (user?.privacySettings as any) || {};
    return Array.isArray(priv.emergencyContacts) ? priv.emergencyContacts : [];
  }

  /**
   * Saves user's emergency contacts into PostgreSQL database
   */
  async saveEmergencyContacts(userId: string, contacts: Array<{ id?: string; name: string; phone: string }>) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { privacySettings: true },
    });
    const priv = (user?.privacySettings as any) || {};
    priv.emergencyContacts = contacts;

    await this.prisma.user.update({
      where: { id: userId },
      data: { privacySettings: priv },
    });

    return { success: true, count: contacts.length, emergencyContacts: contacts };
  }
}
