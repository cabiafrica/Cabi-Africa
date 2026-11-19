import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { PricingService } from '../pricing/pricing.service';
import { SafetySmsService } from '../safety/safety-sms.service';
import {
  DisputeClaim,
  DisputeAssessmentResult,
  FileDisputeDto,
  DriverAppealDto,
  AdjudicateDisputeDto,
  DisputeStatus,
} from './dispute.types';

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);
  private disputeClaims = new Map<string, DisputeClaim>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
    private readonly safetySmsService: SafetySmsService,
  ) {}

  /**
   * Write-through persistence to PostgreSQL `dispute_claims` table (non-blocking fallback)
   */
  private persistClaim(claim: DisputeClaim): void {
    const repo = (this.prisma as any)?.disputeClaim;
    if (!repo?.upsert) return;

    repo
      .upsert({
        where: { id: claim.id },
        create: {
          id: claim.id,
          tripId: claim.tripId,
          tripCode: claim.tripCode,
          passengerId: claim.passengerId,
          passengerPhone: claim.passengerPhone || null,
          driverId: claim.driverId || null,
          driverPhone: claim.driverPhone || null,
          reason: claim.reason,
          description: claim.description,
          originalFare: claim.originalFare,
          optimalFare: claim.optimalFare,
          detourPercent: claim.detourPercent,
          claimedAmount: claim.claimedAmount,
          awardedVoucherAmount: claim.awardedVoucherAmount,
          voucherCode: claim.voucherCode || null,
          status: claim.status,
          driverAppealWindowExpiresAt: claim.driverAppealWindowExpiresAt,
          driverAppealed: claim.driverAppealed,
          driverAppealNotes: claim.driverAppealNotes || null,
          trafficProofUrl: claim.trafficProofUrl || null,
          driverAppealSubmittedAt: claim.driverAppealSubmittedAt || null,
          adjudicatorNotes: claim.adjudicatorNotes || null,
          createdAt: claim.createdAt,
          resolvedAt: claim.resolvedAt || null,
        },
        update: {
          status: claim.status,
          awardedVoucherAmount: claim.awardedVoucherAmount,
          voucherCode: claim.voucherCode || null,
          driverAppealed: claim.driverAppealed,
          driverAppealNotes: claim.driverAppealNotes || null,
          trafficProofUrl: claim.trafficProofUrl || null,
          driverAppealSubmittedAt: claim.driverAppealSubmittedAt || null,
          adjudicatorNotes: claim.adjudicatorNotes || null,
          resolvedAt: claim.resolvedAt || null,
        },
      })
      .catch((err: Error) =>
        this.logger.warn(`Dispute write-through skipped for ${claim.id}: ${err.message}`),
      );
  }

  /**
   * Great-Circle distance formula
   */
  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Analyzes trip trajectory, compares against optimal routing, and detects detour anomalies
   */
  async assessTripTrajectory(
    tripId: string,
    passengerUserId?: string,
  ): Promise<DisputeAssessmentResult> {
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

    const pickup = ride.pickupLocation as any;
    const dropoff = ride.dropoffLocation as any;

    const pLat = Number(pickup?.latitude ?? pickup?.lat ?? -1.286389);
    const pLng = Number(pickup?.longitude ?? pickup?.lng ?? 36.817223);
    const dLat = Number(dropoff?.latitude ?? dropoff?.lat ?? -1.2683);
    const dLng = Number(dropoff?.longitude ?? dropoff?.lng ?? 36.8111);

    // Optimal straight-line corrected with 1.25 urban grid routing factor
    const rawHaversine = this.calculateDistanceKm(pLat, pLng, dLat, dLng);
    const optimalDistanceKm = Math.max(1.0, Math.round(rawHaversine * 1.25 * 10) / 10);

    const actualDistanceKm = Number(ride.distance || optimalDistanceKm * 1.35);
    const originalFare = Number(ride.fare || 400);

    // Detour percentage calculation
    const detourPercent = Math.max(
      0,
      Math.round(((actualDistanceKm - optimalDistanceKm) / optimalDistanceKm) * 100),
    );

    // Anomaly triggered if detour > 30%
    const isDetourAnomaly = detourPercent > 30;

    // Recalculate fair fare based on optimal distance
    const pricing = await this.pricingService.getCategoryPricing(
      (ride.requestedVehicleType as any) || 'STANDARD',
    );
    const fairRecalculatedFare = Math.max(
      pricing.minimumFare || 200,
      Math.round(pricing.baseFare + optimalDistanceKm * pricing.perKmRate),
    );

    const suggestedCompensation = Math.max(
      0,
      originalFare - fairRecalculatedFare,
    );

    // Anti-Abuse Check: Count passenger's dispute claims in rolling 30 days
    const pId = passengerUserId || ride.passengerId;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentDisputes = Array.from(this.disputeClaims.values()).filter(
      (c) => c.passengerId === pId && c.createdAt.getTime() > thirtyDaysAgo,
    );
    const recentDisputeCount = recentDisputes.length;

    let eligibleForAutoVoucher = true;
    let antiAbuseReason: string | undefined;

    if (recentDisputeCount >= 2) {
      eligibleForAutoVoucher = false;
      antiAbuseReason =
        'Maximum of 2 instant voucher claims per rolling 30-day window reached. Claim requires Senior Adjudicator review.';
    } else if (suggestedCompensation > 500) {
      eligibleForAutoVoucher = false;
      antiAbuseReason =
        'Claim amount exceeds instant voucher ceiling (KES 500). Dual-adjudication required.';
    } else if (!isDetourAnomaly && suggestedCompensation <= 30) {
      eligibleForAutoVoucher = false;
      antiAbuseReason = 'Trajectory within normal traffic route variance (<30%).';
    }

    return {
      tripId: ride.id,
      optimalDistanceKm,
      actualDistanceKm,
      detourPercent,
      isDetourAnomaly,
      originalFare,
      fairRecalculatedFare,
      suggestedCompensation,
      eligibleForAutoVoucher,
      recentDisputeCount,
      antiAbuseReason,
    };
  }

  /**
   * Files a fare dispute and executes automated voucher issuance or escalates to manual review
   */
  async fileDispute(
    passengerUserId: string,
    dto: FileDisputeDto,
  ): Promise<{ claim: DisputeClaim; assessment: DisputeAssessmentResult }> {
    const assessment = await this.assessTripTrajectory(dto.tripId, passengerUserId);

    const ride = await this.prisma.ride.findFirst({
      where: { OR: [{ id: dto.tripId }, { tripCode: dto.tripId }] },
      include: {
        passenger: true,
        driver: { include: { user: true } },
      },
    });

    if (!ride) throw new NotFoundException(`Trip ${dto.tripId} not found`);

    const id = `disp_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const tripCode = ride.tripCode || `TRP-${ride.id.slice(-5)}`;
    const now = new Date();
    const appealExpiry = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48-hour driver appeal SLA

    let status: DisputeStatus = 'PENDING_REVIEW';
    let awardedVoucherAmount = 0;
    let voucherCode: string | undefined;

    if (assessment.eligibleForAutoVoucher) {
      status = 'AUTO_RESOLVED_VOUCHER';
      awardedVoucherAmount = assessment.suggestedCompensation || 150;
      voucherCode = `VOUCHER_ADJ_${tripCode.slice(-4)}_${Math.floor(1000 + Math.random() * 9000)}`;
    } else {
      status = 'ESCALATED_MANUAL_AUDIT';
    }

    const claim: DisputeClaim = {
      id,
      tripId: ride.id,
      tripCode,
      passengerId: ride.passengerId,
      passengerPhone: ride.passenger?.phone || '',
      driverId: ride.driverId || '',
      driverPhone: ride.driver?.user?.phone || '',
      reason: dto.reason,
      description: dto.description,
      originalFare: assessment.originalFare,
      optimalFare: assessment.fairRecalculatedFare,
      detourPercent: assessment.detourPercent,
      claimedAmount: Number(dto.claimedAmount || assessment.suggestedCompensation),
      awardedVoucherAmount,
      voucherCode,
      status,
      driverAppealWindowExpiresAt: appealExpiry,
      driverAppealed: false,
      createdAt: now,
      resolvedAt: status === 'AUTO_RESOLVED_VOUCHER' ? now : undefined,
    };

    this.disputeClaims.set(id, claim);
    this.persistClaim(claim);

    // 1. Notify Passenger
    if (claim.passengerPhone) {
      if (status === 'AUTO_RESOLVED_VOUCHER') {
        const sms =
          `Cabi Africa: Route detour anomaly confirmed on trip ${tripCode}. Fare adjusted!\n` +
          `KES ${awardedVoucherAmount} compensation voucher issued: ${voucherCode}.\n` +
          `Automatically applied to your next trip.`;
        this.safetySmsService.sendSms(claim.passengerPhone, sms).catch(() => {});
      } else {
        const sms =
          `Cabi Africa: Your dispute for trip ${tripCode} has been received.\n` +
          `Under review by Senior Adjudication Desk (Case: ${id}). You will be updated within 24 hours.`;
        this.safetySmsService.sendSms(claim.passengerPhone, sms).catch(() => {});
      }
    }

    // 2. Notify Driver with 48h Appeal Window Notice
    if (claim.driverPhone && status === 'AUTO_RESOLVED_VOUCHER') {
      const driverSms =
        `Cabi Africa Notice: A detour variance was flagged on trip ${tripCode}. Fare adjusted by KES ${awardedVoucherAmount}.\n` +
        `You have 48 hours to file an appeal in the Driver App if the alternate route was due to road closure or traffic.`;
      this.safetySmsService.sendSms(claim.driverPhone, driverSms).catch(() => {});
    }

    this.logger.log(`Dispute filed for trip ${tripCode}: status ${status}, voucher: ${voucherCode || 'N/A'}`);
    return { claim, assessment };
  }

  /**
   * Driver submits appeal with traffic/road closure justification within 48h
   */
  driverSubmitAppeal(
    claimId: string,
    driverUserId: string,
    dto: DriverAppealDto,
  ): DisputeClaim {
    const claim = this.disputeClaims.get(claimId);
    if (!claim) throw new NotFoundException(`Dispute claim ${claimId} not found`);

    if (new Date() > claim.driverAppealWindowExpiresAt) {
      throw new BadRequestException('The 48-hour driver appeal window has expired.');
    }

    claim.driverAppealed = true;
    claim.driverAppealNotes = dto.appealNotes;
    claim.trafficProofUrl = dto.trafficProofUrl;
    claim.driverAppealSubmittedAt = new Date();
    claim.status = 'ESCALATED_MANUAL_AUDIT'; // Queued for Sacco hearing
    this.disputeClaims.set(claimId, claim);
    this.persistClaim(claim);

    this.logger.log(`Driver submitted appeal on dispute ${claimId}: "${dto.appealNotes}"`);
    return claim;
  }

  /**
   * Admin / Senior Adjudicator adjudicates dispute
   */
  adjudicateDispute(
    claimId: string,
    adminUserId: string,
    dto: AdjudicateDisputeDto,
  ): DisputeClaim {
    const claim = this.disputeClaims.get(claimId);
    if (!claim) throw new NotFoundException(`Dispute claim ${claimId} not found`);

    claim.adjudicatorNotes = dto.notes;
    claim.resolvedAt = new Date();

    if (dto.decision === 'UPHOLD_RIDER') {
      claim.status = 'RESOLVED_REFUND';
      if (!claim.voucherCode) {
        claim.awardedVoucherAmount = dto.adjustedAmount || claim.claimedAmount;
        claim.voucherCode = `VOUCHER_ADJ_${claim.tripCode.slice(-4)}_${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else {
      claim.status = 'REJECTED';
    }

    this.disputeClaims.set(claimId, claim);
    this.persistClaim(claim);
    this.logger.log(`Dispute ${claimId} adjudicated: ${claim.status} by admin ${adminUserId}`);
    return claim;
  }

  getClaim(id: string): DisputeClaim {
    const claim = this.disputeClaims.get(id);
    if (!claim) throw new NotFoundException(`Dispute claim ${id} not found`);
    return claim;
  }

  listUserDisputes(userId: string): DisputeClaim[] {
    return Array.from(this.disputeClaims.values()).filter(
      (c) => c.passengerId === userId || c.driverId === userId,
    );
  }

  listAllDisputes(): DisputeClaim[] {
    return Array.from(this.disputeClaims.values());
  }
}
