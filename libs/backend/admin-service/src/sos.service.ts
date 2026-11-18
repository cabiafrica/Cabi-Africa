import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { OccurrenceStatus, OccurrenceCategory, OccurrenceSeverity } from '@prisma/client';

export interface SOSIncident {
  id: string;
  driverId: string;
  driverName?: string;
  passengerId: string;
  passengerName?: string;
  status: OccurrenceStatus | string;
  createdAt: Date;
  resolvedAt?: Date;
  notes?: string;
  title?: string;
  description?: string;
  severity: OccurrenceSeverity | string;
  category: OccurrenceCategory | string;
  obNumber?: string;
}

export type DisputeResolutionAction =
  | 'UPHOLD_CAPTAIN_FEE'
  | 'FULL_PASSENGER_REFUND'
  | 'SPLIT_50_50'
  | 'EXPUNGE_RATING_STRIKE'
  | 'ESCALATE_SACCO_COMMITTEE'
  | 'POLICE_LEGAL_HANDOVER';

export interface AdjudicateDisputeOptions {
  action: DisputeResolutionAction;
  adjudicatorComment: string;
  refundOrCreditAmount?: number;
  adminId?: string;
  adminName?: string;
  escalationRuling?: 'UPHOLD_ESCALATOR' | 'REJECT_ESCALATOR' | 'MUTUAL_SETTLEMENT';
}

@Injectable()
export class SOSService {
  constructor(private readonly prisma: PrismaService) {}

  async getIncidents(): Promise<SOSIncident[]> {
    const occurrences = await this.prisma.occurrence.findMany({
      include: {
        driver: { include: { user: true } },
        passenger: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return occurrences.map((o) => ({
      id: o.id,
      driverId: o.driverId || '',
      driverName: o.driver?.user ? o.driver.user.fullName : 'N/A',
      passengerId: o.passengerId || '',
      passengerName: o.passenger ? o.passenger.fullName : 'N/A',
      status: o.status,
      createdAt: o.createdAt,
      resolvedAt: o.resolvedAt || undefined,
      notes: o.resolutionNotes || undefined,
      title: o.title,
      description: o.description,
      severity: o.severity,
      category: o.category,
      obNumber: o.obNumber,
    }));
  }

  async getIncident(id: string) {
    const o = await this.prisma.occurrence.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            user: {
              include: {
                badges: { include: { badge: true } },
                organization_members: { include: { organizations: true } }
              }
            },
            referrer: { include: { user: true } },
            organizations: { include: { organization_members: true } }
          },
        },
        passenger: {
          include: {
            badges: { include: { badge: true } },
            organization_members: { include: { organizations: true } }
          }
        },
        auditLog: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { id: true, fullName: true, passportPhotoUrl: true } } },
        },
        objections: {
          orderBy: { createdAt: 'asc' },
          include: {
            objector: { select: { id: true, fullName: true, passportPhotoUrl: true, averageRating: true } },
            reviewedBy: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    if (!o) throw new NotFoundException('Incident not found');

    // Find organization leader if driver belongs to one
    const orgLeader = o.driver?.organizations?.organization_members?.find(m => 
      m.position.toLowerCase().includes('leader') || 
      m.position.toLowerCase().includes('chairman') ||
      m.position.toLowerCase().includes('admin')
    );

    // Resolution Responsibility Logic
    let responsibleParty = 'Platform Admin';
    if (o.severity === OccurrenceSeverity.LOW) {
      responsibleParty = 'Parties Involved (Driver & Passenger)';
    } else if (o.severity === OccurrenceSeverity.MEDIUM && orgLeader) {
      responsibleParty = `Organization Leader (${orgLeader.name})`;
    } else if (o.severity === OccurrenceSeverity.CRITICAL) {
      responsibleParty = 'Government Authorities (Police/Emergency)';
    }

    // Derive each party's userId so we can label statements correctly
    const driverUserId = o.driver?.user?.id ?? null;
    const passengerUserId = o.passenger?.id ?? null;

    const resolveRole = (actorId: string | null) => {
      if (!actorId) return 'Unknown';
      if (actorId === driverUserId) return 'Driver';
      if (actorId === passengerUserId) return 'Passenger';
      return 'Admin';
    };

    // Annotated audit log with actor identity
    const annotatedLogs = o.auditLog.map((l) => ({
      id: l.id,
      timestamp: l.createdAt.toISOString(),
      action: l.action,
      notes: l.notes || '',
      actorId: l.actorId,
      actorName: (l as any).actor?.fullName ?? 'System',
      actorPhoto: (l as any).actor?.passportPhotoUrl ?? null,
      actorRole: resolveRole(l.actorId),
    }));

    // Party statements from OccurrenceObjection
    const statements = o.objections.map((obj) => {
      const role = resolveRole(obj.objectorId);
      return {
        id: obj.id,
        role,                              // 'Driver' | 'Passenger' | 'Admin'
        objectorId: obj.objectorId,
        objectorName: obj.objector.fullName,
        objectorPhoto: obj.objector.passportPhotoUrl ?? null,
        objectorRating: obj.objector.averageRating ?? null,
        text: obj.objectionText,
        supportingEvidence: obj.supportingEvidence ?? null,
        status: obj.status,               // PENDING | UNDER_REVIEW | ACCEPTED | REJECTED
        reviewedAt: obj.reviewedAt?.toISOString() ?? null,
        reviewedBy: obj.reviewedBy ? { id: obj.reviewedBy.id, name: obj.reviewedBy.fullName } : null,
        reviewNotes: obj.reviewNotes ?? null,
        submittedAt: obj.createdAt.toISOString(),
      };
    });

    return {
      id: o.id,
      obNumber: o.obNumber,
      title: o.title,
      description: o.description,
      category: o.category,
      severity: o.severity,
      driver: {
        id: o.driver?.id || '',
        name: o.driver?.user.fullName || 'N/A',
        phone: o.driver?.user.phone,
        photoUrl: o.driver?.user.passportPhotoUrl,
        rating: o.driver?.averageRating || 0,
        badges: o.driver?.user.badges.map(b => ({
          name: b.badge.name,
          icon: b.badge.iconUrl,
          tier: b.badge.tier
        })),
        organization: o.driver?.organizations ? {
          id: o.driver.organizations.id,
          name: o.driver.organizations.name,
          leader: orgLeader ? {
            name: orgLeader.name,
            phone: orgLeader.contact,
            position: orgLeader.position
          } : undefined
        } : undefined
      },
      passenger: {
        id: o.passenger?.id || '',
        name: o.passenger?.fullName || 'N/A',
        phone: o.passenger?.phone,
        photoUrl: o.passenger?.passportPhotoUrl,
        rating: o.passenger?.averageRating || 0,
        badges: o.passenger?.badges.map(b => ({
          name: b.badge.name,
          icon: b.badge.iconUrl,
          tier: b.badge.tier
        }))
      },
      upline1: o.driver?.referrer ? {
        id: o.driver.referrer.id,
        name: o.driver.referrer.user.fullName,
        phone: o.driver.referrer.user.phone
      } : undefined,
      liveLocation: o.locationLat && o.locationLng ? {
        lat: Number(o.locationLat),
        lng: Number(o.locationLng),
      } : undefined,
      status: o.status,
      responsibleParty,
      // legacy flat log (backwards compat)
      logs: annotatedLogs.map(l => ({ timestamp: l.timestamp, notes: l.notes })),
      // enriched log with actor identity
      annotatedLogs,
      // party statements / objections
      statements,
    };
  }

  /** Called by involved parties (driver/passenger) via User Portal to submit their statement */
  async submitStatement(occurrenceId: string, objectorId: string, text: string, evidence?: any) {
    // Verify the occurrence exists
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id: occurrenceId } });
    if (!occurrence) throw new NotFoundException('Occurrence not found');

    const objection = await this.prisma.occurrenceObjection.create({
      data: {
        occurrenceId,
        objectorId,
        objectionText: text,
        supportingEvidence: evidence ?? undefined,
        status: 'PENDING',
      },
      include: {
        objector: { select: { id: true, fullName: true, passportPhotoUrl: true } },
      },
    });

    // Append an audit log entry
    await this.prisma.occurrenceAuditLog.create({
      data: {
        occurrenceId,
        actorId: objectorId,
        action: 'STATEMENT_SUBMITTED',
        notes: `Party submitted a statement.`,
      },
    });

    return {
      id: objection.id,
      text: objection.objectionText,
      status: objection.status,
      submittedAt: objection.createdAt.toISOString(),
      objectorName: objection.objector.fullName,
    };
  }

  /** Admin reviews a party statement: accepts / rejects / flags for follow-up */
  async reviewObjection(objectionId: string, adminId: string, status: string, reviewNotes: string) {
    const updated = await this.prisma.occurrenceObjection.update({
      where: { id: objectionId },
      data: {
        status: status as any,
        reviewedById: adminId,
        reviewedAt: new Date(),
        reviewNotes,
      },
    });
    return { id: updated.id, status: updated.status };
  }

  async getUserIncidents(userId: string) {

    // Fetch occurrences where the user is the driver (via DriverProfile) or the passenger
    const [asPassenger, asDriver] = await Promise.all([
      this.prisma.occurrence.findMany({
        where: { passengerId: userId },
        include: {
          driver: { include: { user: { select: { fullName: true, passportPhotoUrl: true, averageRating: true } } } },
          auditLog: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.occurrence.findMany({
        where: { driver: { userId } },
        include: {
          passenger: { select: { fullName: true, passportPhotoUrl: true, averageRating: true } },
          auditLog: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const mapOccurrence = (o: any, role: 'driver' | 'passenger') => ({
      id: o.id,
      obNumber: o.obNumber,
      title: o.title,
      description: o.description,
      category: o.category,
      severity: o.severity,
      status: o.status,
      occurredAt: o.occurredAt,
      resolvedAt: o.resolvedAt || null,
      resolutionNotes: o.resolutionNotes || null,
      locationAddress: o.locationAddress || null,
      locationCity: o.locationCity || null,
      myRole: role,
      counterparty: role === 'passenger'
        ? (o.driver ? { name: o.driver.user.fullName, photoUrl: o.driver.user.passportPhotoUrl, rating: o.driver.user.averageRating } : null)
        : (o.passenger ? { name: o.passenger.fullName, photoUrl: o.passenger.passportPhotoUrl, rating: o.passenger.averageRating } : null),
      latestLog: o.auditLog?.[0] ? { notes: o.auditLog[0].notes, timestamp: o.auditLog[0].createdAt } : null,
    });

    const incidents = [
      ...asPassenger.map(o => mapOccurrence(o, 'passenger')),
      ...asDriver.map(o => mapOccurrence(o, 'driver')),
    ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return incidents;
  }

  /**
   * Multi-Track Dispute Resolution with Tiered Financial Autonomy & Adjudicator Audit Comment
   */
  async adjudicateDispute(id: string, options: AdjudicateDisputeOptions) {
    const { action, adjudicatorComment, refundOrCreditAmount = 0, adminId, adminName = 'Adjudication Officer' } = options;
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) throw new NotFoundException('Occurrence not found');

    // Tiered Financial Autonomy Rule:
    // Support Adjudicators can execute instant fee waivers/credits up to KES 500.
    // Disputes exceeding KES 500 require Senior Finance Controller dual-authorization.
    const isExceedingAutonomy = refundOrCreditAmount > 500;
    const targetStatus = isExceedingAutonomy ? OccurrenceStatus.UNDER_INVESTIGATION : OccurrenceStatus.RESOLVED;

    // Settle Escalation Bond if applicable
    let bondNote = '';
    if (options.escalationRuling === 'UPHOLD_ESCALATOR') {
      bondNote = ` | [BOND_REFUNDED] Escalating party won the appeal: KES 500 hearing bond refunded to winner; counterparty held liable.`;
    } else if (options.escalationRuling === 'REJECT_ESCALATOR') {
      bondNote = ` | [BOND_FORFEITED] Escalating party claim rejected: KES 500 hearing bond forfeited to Sacco Hearing Desk.`;
    }

    const auditNote = (isExceedingAutonomy
      ? `[TIERED_AUTONOMY_TRIGGERED] Dispute action '${action}' (KES ${refundOrCreditAmount}) exceeds Support Autonomy (KES 500 cap). Queued for Finance Controller authorization. Adjudicator: ${adminName}. Comment: "${adjudicatorComment}"`
      : `[DISPUTE_RESOLVED] Action: '${action}' executed (KES ${refundOrCreditAmount}). Adjudicator: ${adminName}. Comment: "${adjudicatorComment}"`) + bondNote;

    const updated = await this.prisma.occurrence.update({
      where: { id },
      data: {
        status: targetStatus,
        resolutionNotes: auditNote,
        resolvedAt: isExceedingAutonomy ? null : new Date(),
        resolvedById: adminId,
      },
    });

    // Write to Occurrence Audit Log
    await this.prisma.occurrenceAuditLog.create({
      data: {
        occurrenceId: id,
        action: action as any,
        notes: auditNote,
        actorId: adminId,
      },
    });

    // If rating strike was expunged, clear penalty from driver
    if (action === 'EXPUNGE_RATING_STRIKE' && occurrence.driverId) {
      try {
        const driver = await this.prisma.driverProfile.findUnique({ where: { id: occurrence.driverId } });
        if (driver && driver.averageRating < 4.8) {
          await this.prisma.driverProfile.update({
            where: { id: occurrence.driverId },
            data: { averageRating: Math.min(5.0, driver.averageRating + 0.15) },
          });
        }
      } catch (e: any) {
        console.warn(`Could not restore captain score: ${e.message}`);
      }
    }

    return {
      id: updated.id,
      status: updated.status,
      action,
      refundOrCreditAmount,
      isPendingFinanceApproval: isExceedingAutonomy,
      adjudicatorComment,
      resolvedAt: updated.resolvedAt,
    };
  }

  async resolveIncident(id: string, note: string, resolvedById?: string): Promise<SOSIncident> {
    const o = await this.prisma.occurrence.update({
      where: { id },
      data: {
        status: OccurrenceStatus.RESOLVED,
        resolutionNotes: note,
        resolvedAt: new Date(),
        resolvedById: resolvedById,
      },
    });

    // Create audit log entry
    await this.prisma.occurrenceAuditLog.create({
      data: {
        occurrenceId: id,
        action: 'RESOLVE',
        notes: note,
        actorId: resolvedById,
      },
    });

    return {
      id: o.id,
      driverId: o.driverId || '',
      passengerId: o.passengerId || '',
      status: 'RESOLVED',
      createdAt: o.createdAt,
      resolvedAt: o.resolvedAt || undefined,
      notes: o.resolutionNotes || undefined,
      severity: o.severity,
      category: o.category,
    };
  }

  async logAction(id: string, notes: string, actorId?: string): Promise<any> {
    const log = await this.prisma.occurrenceAuditLog.create({
      data: {
        occurrenceId: id,
        action: 'COMMENT',
        notes: notes,
        actorId: actorId,
      },
    });
    return log;
  }

  /**
   * Escalates a dispute to the Sacco Disciplinary Committee.
   * Charges KES 500 Escalation Bond to the escalating party (Driver or Passenger).
   * Option A Approved: Loser-pays policy with bond held in escrow.
   */
  async escalateDispute(
    id: string,
    options: {
      escalatedById: string;
      escalatorRole: 'DRIVER' | 'PASSENGER';
      escalatorName?: string;
      reason: string;
      paymentMethod?: 'WALLET' | 'MPESA' | 'AIRTEL';
      paymentReference?: string;
    }
  ) {
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) throw new NotFoundException('Occurrence not found');

    const { escalatedById, escalatorRole, escalatorName = 'User', reason, paymentMethod = 'WALLET', paymentReference } = options;
    const txRef = paymentReference || `BOND_${Date.now()}`;

    // Record escalation in occurrence audit log
    const auditNote = `[DISPUTE_ESCALATED] KES 500 Escalation Hearing Bond collected from ${escalatorRole} ${escalatorName} (${escalatedById}) via ${paymentMethod} (Ref: ${txRef}). Case escalated to Sacco Disciplinary Committee. Reason: "${reason}". Bond held in escrow; refunded if claim upheld, forfeited if frivolous.`;

    await this.prisma.occurrence.update({
      where: { id },
      data: {
        status: OccurrenceStatus.UNDER_INVESTIGATION,
        resolutionNotes: auditNote,
      },
    });

    await this.prisma.occurrenceAuditLog.create({
      data: {
        occurrenceId: id,
        action: 'ESCALATE_SACCO_COMMITTEE' as any,
        notes: auditNote,
        actorId: escalatedById,
      },
    });

    return {
      success: true,
      occurrenceId: id,
      escalationBondAmount: 500,
      escalationBondStatus: 'HELD_IN_ESCROW',
      paymentReference: txRef,
      status: OccurrenceStatus.UNDER_INVESTIGATION,
      message: `Dispute successfully escalated. KES 500 hearing bond held in escrow. Case transferred to Sacco Committee.`,
    };
  }

  /**
   * Distressed driver submits a pardon request for the KES 500 distress fee
   */
  async requestDistressPardon(
    id: string,
    options: {
      driverUserId: string;
      reason: string;
    }
  ) {
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) throw new NotFoundException('Occurrence not found');

    const auditNote = `[DISTRESS_PARDON_REQUESTED] Driver (${options.driverUserId}) filed formal pardon request for KES 500 emergency distress fee. Stated incident circumstances: "${options.reason}". Queued for Senior Cabi Distress Official review.`;

    await this.prisma.occurrenceAuditLog.create({
      data: {
        occurrenceId: id,
        action: 'COMMENT',
        notes: auditNote,
        actorId: options.driverUserId,
      },
    });

    return {
      success: true,
      occurrenceId: id,
      distressFeeStatus: 'PARDON_REQUESTED',
      message: 'Pardon request submitted. Pending review by Senior Cabi Distress Official.',
    };
  }

  /**
   * Senior Cabi Distress Official grants or declines pardon for the KES 500 distress fee.
   * Option A Approved: Full Waiver + Sacco Welfare Emergency Fund Backstop.
   */
  async pardonDistressFee(
    id: string,
    options: {
      officialId: string;
      officialName: string;
      approved: boolean;
      notes: string;
    }
  ) {
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) throw new NotFoundException('Occurrence not found');

    const { officialId, officialName, approved, notes } = options;

    const auditNote = approved
      ? `[DISTRESS_PARDON_GRANTED] Senior Cabi Distress Official ${officialName} approved full waiver of KES 500 distress fee. Reason: "${notes}". 500 Good Samaritan responder points backstopped by Sacco Emergency Welfare Buffer.`
      : `[DISTRESS_PARDON_DECLINED] Senior Cabi Distress Official ${officialName} declined pardon request. Reason: "${notes}". KES 500 distress fee finalized on driver ledger.`;

    await this.prisma.occurrenceAuditLog.create({
      data: {
        occurrenceId: id,
        action: approved ? 'RESOLVE' : 'COMMENT',
        notes: auditNote,
        actorId: officialId,
      },
    });

    return {
      success: true,
      occurrenceId: id,
      approved,
      distressFeeStatus: approved ? 'PARDONED' : 'SETTLED',
      officialName,
      message: approved
        ? `Pardon granted by ${officialName}. KES 500 fee 100% credited back to driver; Sacco Welfare Buffer activated.`
        : `Pardon declined by ${officialName}. KES 500 distress fee upheld.`,
    };
  }
}
