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
}
