import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

interface AuditLogData {
    occurrenceId: string;
    action: string;
    actorId?: string;
    notes?: string;
    changes?: any;
}

@Injectable()
export class OccurrenceAuditService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create an audit log entry
     */
    async log(data: AuditLogData) {
        return this.prisma.occurrenceAuditLog.create({
            data: {
                occurrenceId: data.occurrenceId,
                action: data.action,
                actorId: data.actorId,
                notes: data.notes,
                changes: data.changes || {},
            },
        });
    }

    /**
     * Get audit trail for an occurrence
     */
    async getAuditTrail(occurrenceId: string) {
        return this.prisma.occurrenceAuditLog.findMany({
            where: { occurrenceId },
            include: {
                actor: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
