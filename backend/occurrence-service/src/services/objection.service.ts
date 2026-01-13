import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateObjectionDto, ReviewObjectionDto } from '../dto/objection.dto';
import { OccurrenceAuditService } from './occurrence-audit.service';

@Injectable()
export class ObjectionService {
    constructor(
        private prisma: PrismaService,
        private auditService: OccurrenceAuditService,
    ) { }

    /**
     * Create a new objection
     */
    async create(dto: CreateObjectionDto) {
        // Verify occurrence exists
        const occurrence = await this.prisma.occurrence.findUnique({
            where: { id: dto.occurrenceId },
        });

        if (!occurrence) {
            throw new NotFoundException('Occurrence not found');
        }

        // Create objection
        const objection = await this.prisma.occurrenceObjection.create({
            data: {
                occurrenceId: dto.occurrenceId,
                objectorId: dto.objectorId,
                objectionText: dto.objectionText,
                supportingEvidence: dto.supportingEvidence || {},
            },
            include: {
                objector: true,
                occurrence: true,
            },
        });

        // Update occurrence status to DISPUTED
        await this.prisma.occurrence.update({
            where: { id: dto.occurrenceId },
            data: { status: 'DISPUTED' },
        });

        // Create audit log
        await this.auditService.log({
            occurrenceId: dto.occurrenceId,
            action: 'OBJECTION_FILED',
            actorId: dto.objectorId,
            notes: 'User filed an objection',
            changes: {
                new: objection,
            },
        });

        return objection;
    }

    /**
     * Get objection by ID
     */
    async findOne(id: string) {
        const objection = await this.prisma.occurrenceObjection.findUnique({
            where: { id },
            include: {
                occurrence: true,
                objector: true,
                reviewedBy: true,
            },
        });

        if (!objection) {
            throw new NotFoundException('Objection not found');
        }

        return objection;
    }

    /**
     * Get all objections for an occurrence
     */
    async findByOccurrence(occurrenceId: string) {
        return this.prisma.occurrenceObjection.findMany({
            where: { occurrenceId },
            include: {
                objector: true,
                reviewedBy: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Get all objections by a user
     */
    async findByUser(userId: string) {
        return this.prisma.occurrenceObjection.findMany({
            where: { objectorId: userId },
            include: {
                occurrence: true,
                reviewedBy: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Review an objection (admin only)
     */
    async review(id: string, dto: ReviewObjectionDto) {
        const existing = await this.findOne(id);

        const reviewed = await this.prisma.occurrenceObjection.update({
            where: { id },
            data: {
                status: dto.status,
                reviewedById: dto.reviewedById,
                reviewedAt: new Date(),
                reviewNotes: dto.reviewNotes,
                outcome: dto.outcome,
            },
            include: {
                occurrence: true,
                objector: true,
                reviewedBy: true,
            },
        });

        // If objection is accepted, update occurrence
        if (dto.status === 'ACCEPTED') {
            await this.prisma.occurrence.update({
                where: { id: existing.occurrenceId },
                data: {
                    status: 'RESOLVED',
                    resolutionNotes: `Objection accepted: ${dto.reviewNotes}`,
                    resolvedById: dto.reviewedById,
                    resolvedAt: new Date(),
                },
            });
        } else if (dto.status === 'REJECTED') {
            // If rejected, change occurrence back to OPEN
            await this.prisma.occurrence.update({
                where: { id: existing.occurrenceId },
                data: { status: 'OPEN' },
            });
        }

        // Create audit log
        await this.auditService.log({
            occurrenceId: existing.occurrenceId,
            action: 'OBJECTION_REVIEWED',
            actorId: dto.reviewedById,
            notes: `Objection ${dto.status.toLowerCase()}: ${dto.reviewNotes}`,
            changes: {
                old: existing,
                new: reviewed,
            },
        });

        return reviewed;
    }

    /**
     * Get pending objections (admin view)
     */
    async getPending() {
        return this.prisma.occurrenceObjection.findMany({
            where: { status: 'PENDING' },
            include: {
                occurrence: true,
                objector: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
}
