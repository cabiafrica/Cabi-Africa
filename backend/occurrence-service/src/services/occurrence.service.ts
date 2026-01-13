import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
    CreateOccurrenceDto,
    UpdateOccurrenceDto,
    ResolveOccurrenceDto,
    FilterOccurrenceDto,
} from '../dto/occurrence.dto';
import { OccurrenceAuditService } from './occurrence-audit.service';

@Injectable()
export class OccurrenceService {
    constructor(
        private prisma: PrismaService,
        private auditService: OccurrenceAuditService,
    ) { }

    /**
     * Generate OB number in format: OB-YYYY-NNNNNN
     */
    private async generateObNumber(): Promise<string> {
        const year = new Date().getFullYear();

        // Get the latest OB number for this year
        const latestOccurrence = await this.prisma.occurrence.findFirst({
            where: {
                obNumber: {
                    startsWith: `OB-${year}-`,
                },
            },
            orderBy: {
                obNumber: 'desc',
            },
        });

        let nextSequence = 1;
        if (latestOccurrence) {
            const currentSequence = parseInt(latestOccurrence.obNumber.split('-')[2]);
            nextSequence = currentSequence + 1;
        }

        return `OB-${year}-${nextSequence.toString().padStart(6, '0')}`;
    }

    /**
     * Create a new occurrence
     */
    async create(dto: CreateOccurrenceDto) {
        // Validate that at least one party is involved
        if (!dto.driverId && !dto.passengerId && !dto.vehicleId) {
            throw new BadRequestException(
                'At least one of driverId, passengerId, or vehicleId must be provided',
            );
        }

        // Generate OB number
        const obNumber = await this.generateObNumber();

        // Combine date and time into timestamp
        const occurredAt = new Date(`${dto.occurrenceDate}T${dto.occurrenceTime}`);

        // Create occurrence
        const occurrence = await this.prisma.occurrence.create({
            data: {
                obNumber,
                category: dto.category,
                severity: dto.severity,
                title: dto.title,
                description: dto.description,
                driverId: dto.driverId,
                passengerId: dto.passengerId,
                vehicleId: dto.vehicleId,
                rideId: dto.rideId,
                occurrenceDate: new Date(dto.occurrenceDate),
                occurrenceTime: new Date(`1970-01-01T${dto.occurrenceTime}`),
                occurredAt,
                locationLat: dto.location.lat,
                locationLng: dto.location.lng,
                locationAddress: dto.location.address,
                locationPlaceName: dto.location.placeName,
                locationCity: dto.location.city,
                locationCountry: dto.location.country || 'Kenya',
                locationDetails: dto.location as any,
                source: dto.source,
                sourceReferenceId: dto.sourceReferenceId,
                registeredById: dto.registeredById,
                tags: dto.tags || [],
            },
            include: {
                driver: {
                    include: {
                        user: true,
                    },
                },
                passenger: true,
                vehicle: true,
                ride: true,
                registeredBy: true,
            },
        });

        // Create audit log
        await this.auditService.log({
            occurrenceId: occurrence.id,
            action: 'CREATED',
            actorId: dto.registeredById,
            notes: `Occurrence ${obNumber} created`,
            changes: {
                new: occurrence,
            },
        });

        return occurrence;
    }

    /**
     * Get occurrence by ID
     */
    async findOne(id: string) {
        const occurrence = await this.prisma.occurrence.findUnique({
            where: { id },
            include: {
                driver: {
                    include: {
                        user: true,
                        vehicle: true,
                    },
                },
                passenger: true,
                vehicle: true,
                ride: true,
                registeredBy: true,
                resolvedBy: true,
                media: {
                    include: {
                        uploadedBy: true,
                    },
                },
                objections: {
                    include: {
                        objector: true,
                        reviewedBy: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                auditLog: {
                    include: {
                        actor: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!occurrence) {
            throw new NotFoundException(`Occurrence with ID ${id} not found`);
        }

        return occurrence;
    }

    /**
     * Get occurrences with filtering and pagination
     */
    async findAll(filters: FilterOccurrenceDto) {
        const { page = 1, limit = 20, ...where } = filters;
        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause: any = {};

        if (where.category) whereClause.category = where.category;
        if (where.severity) whereClause.severity = where.severity;
        if (where.status) whereClause.status = where.status;
        if (where.driverId) whereClause.driverId = where.driverId;
        if (where.passengerId) whereClause.passengerId = where.passengerId;
        if (where.vehicleId) whereClause.vehicleId = where.vehicleId;
        if (where.city) whereClause.locationCity = where.city;

        if (where.startDate || where.endDate) {
            whereClause.occurrenceDate = {};
            if (where.startDate) {
                whereClause.occurrenceDate.gte = new Date(where.startDate);
            }
            if (where.endDate) {
                whereClause.occurrenceDate.lte = new Date(where.endDate);
            }
        }

        const [occurrences, total] = await Promise.all([
            this.prisma.occurrence.findMany({
                where: whereClause,
                include: {
                    driver: {
                        include: {
                            user: true,
                        },
                    },
                    passenger: true,
                    vehicle: true,
                    registeredBy: true,
                },
                orderBy: {
                    occurredAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.occurrence.count({ where: whereClause }),
        ]);

        return {
            data: occurrences,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get occurrence history for a specific user
     */
    async getUserHistory(userId: string, role: 'passenger' | 'driver') {
        const where = role === 'passenger'
            ? { passengerId: userId }
            : { driver: { userId } };

        return this.prisma.occurrence.findMany({
            where,
            include: {
                driver: {
                    include: {
                        user: true,
                    },
                },
                passenger: true,
                vehicle: true,
                media: true,
                objections: {
                    where: {
                        objectorId: userId,
                    },
                },
            },
            orderBy: {
                occurredAt: 'desc',
            },
        });
    }

    /**
     * Get occurrence history for a vehicle
     */
    async getVehicleHistory(vehicleId: string) {
        return this.prisma.occurrence.findMany({
            where: { vehicleId },
            include: {
                driver: {
                    include: {
                        user: true,
                    },
                },
                passenger: true,
                registeredBy: true,
            },
            orderBy: {
                occurredAt: 'desc',
            },
        });
    }

    /**
     * Update occurrence (limited fields)
     */
    async update(id: string, dto: UpdateOccurrenceDto, actorId: string) {
        const existing = await this.findOne(id);

        const updated = await this.prisma.occurrence.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                severity: dto.severity,
                tags: dto.tags,
            },
            include: {
                driver: {
                    include: {
                        user: true,
                    },
                },
                passenger: true,
                vehicle: true,
            },
        });

        // Create audit log
        await this.auditService.log({
            occurrenceId: id,
            action: 'UPDATED',
            actorId,
            notes: 'Occurrence details updated',
            changes: {
                old: existing,
                new: updated,
            },
        });

        return updated;
    }

    /**
     * Resolve an occurrence (admin only)
     */
    async resolve(id: string, dto: ResolveOccurrenceDto) {
        const existing = await this.findOne(id);

        if (existing.status === 'RESOLVED') {
            throw new BadRequestException('Occurrence is already resolved');
        }

        const resolved = await this.prisma.occurrence.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
                resolvedById: dto.resolvedById,
                resolutionNotes: dto.resolutionNotes,
            },
            include: {
                driver: {
                    include: {
                        user: true,
                    },
                },
                passenger: true,
                vehicle: true,
                resolvedBy: true,
            },
        });

        // Create audit log
        await this.auditService.log({
            occurrenceId: id,
            action: 'RESOLVED',
            actorId: dto.resolvedById,
            notes: dto.resolutionNotes,
            changes: {
                old: { status: existing.status },
                new: { status: 'RESOLVED', resolvedAt: resolved.resolvedAt },
            },
        });

        return resolved;
    }

    /**
     * Flag an occurrence for review
     */
    async flag(id: string, reason: string, actorId: string) {
        const occurrence = await this.prisma.occurrence.update({
            where: { id },
            data: {
                isFlagged: true,
                flagReason: reason,
            },
        });

        await this.auditService.log({
            occurrenceId: id,
            action: 'FLAGGED',
            actorId,
            notes: `Flagged for review: ${reason}`,
        });

        return occurrence;
    }

    /**
     * Get statistics
     */
    async getStatistics() {
        const [
            total,
            open,
            resolved,
            disputed,
            bySeverity,
            byCategory,
        ] = await Promise.all([
            this.prisma.occurrence.count(),
            this.prisma.occurrence.count({ where: { status: 'OPEN' } }),
            this.prisma.occurrence.count({ where: { status: 'RESOLVED' } }),
            this.prisma.occurrence.count({ where: { status: 'DISPUTED' } }),
            this.prisma.occurrence.groupBy({
                by: ['severity'],
                _count: true,
            }),
            this.prisma.occurrence.groupBy({
                by: ['category'],
                _count: true,
            }),
        ]);

        return {
            total,
            byStatus: {
                open,
                resolved,
                disputed,
                underInvestigation: total - open - resolved - disputed,
            },
            bySeverity: bySeverity.reduce((acc, item) => {
                acc[item.severity] = item._count;
                return acc;
            }, {}),
            byCategory: byCategory.reduce((acc, item) => {
                acc[item.category] = item._count;
                return acc;
            }, {}),
        };
    }
}
