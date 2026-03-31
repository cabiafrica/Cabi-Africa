import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { OccurrenceStatus, OccurrenceCategory, OccurrenceSeverity } from '@prisma/client';

export interface SOSIncident {
  id: string;
  driverId: string;
  passengerId: string;
  status: 'PENDING' | 'RESOLVED' | string;
  createdAt: Date;
  resolvedAt?: Date;
  notes?: string;
  title?: string;
  description?: string;
  severity?: string;
  category?: string;
  obNumber?: string;
}

@Injectable()
export class SOSService {
  constructor(private readonly prisma: PrismaService) {}

  async getIncidents(): Promise<SOSIncident[]> {
    const occurrences = await this.prisma.occurrence.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return occurrences.map((o) => ({
      id: o.id,
      driverId: o.driverId || '',
      passengerId: o.passengerId || '',
      status: o.status === OccurrenceStatus.RESOLVED ? 'RESOLVED' : 'PENDING',
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

  async getIncident(id: string): Promise<SOSIncident> {
    const o = await this.prisma.occurrence.findUnique({
      where: { id },
    });

    if (!o) throw new NotFoundException('Occurrence not found');

    return {
      id: o.id,
      driverId: o.driverId || '',
      passengerId: o.passengerId || '',
      status: o.status === OccurrenceStatus.RESOLVED ? 'RESOLVED' : 'PENDING',
      createdAt: o.createdAt,
      resolvedAt: o.resolvedAt || undefined,
      notes: o.resolutionNotes || undefined,
      title: o.title,
      description: o.description,
      severity: o.severity,
      category: o.category,
      obNumber: o.obNumber,
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
    };
  }
}
