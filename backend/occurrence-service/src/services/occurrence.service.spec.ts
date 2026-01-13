import { Test, TestingModule } from '@nestjs/testing';
import { OccurrenceService } from './occurrence.service';
import { PrismaService } from './prisma.service';
import { OccurrenceAuditService } from './occurrence-audit.service';
import { OccurrenceCategory, OccurrenceSeverity } from '../dto/occurrence.dto';

describe('OccurrenceService', () => {
    let service: OccurrenceService;
    let prismaService: PrismaService;
    let auditService: OccurrenceAuditService;

    const mockPrismaService = {
        occurrence: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
    };

    const mockAuditService = {
        log: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OccurrenceService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: OccurrenceAuditService,
                    useValue: mockAuditService,
                },
            ],
        }).compile();

        service = module.get<OccurrenceService>(OccurrenceService);
        prismaService = module.get<PrismaService>(PrismaService);
        auditService = module.get<OccurrenceAuditService>(OccurrenceAuditService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create an occurrence with auto-generated OB number', async () => {
            const createDto = {
                category: OccurrenceCategory.TRAFFIC_OFFENSE,
                severity: OccurrenceSeverity.HIGH,
                title: 'Reckless Driving',
                description: 'Driver was speeding',
                passengerId: 'passenger-123',
                occurrenceDate: '2026-01-13',
                occurrenceTime: '14:30',
                location: {
                    lat: -1.2634,
                    lng: 36.8047,
                    city: 'Nairobi',
                },
                source: 'MANUAL' as any,
                registeredById: 'admin-123',
            };

            const mockOccurrence = {
                id: 'occ-123',
                obNumber: 'OB-2026-000001',
                ...createDto,
                occurredAt: new Date('2026-01-13T14:30:00'),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.occurrence.findFirst.mockResolvedValue(null);
            mockPrismaService.occurrence.create.mockResolvedValue(mockOccurrence);

            const result = await service.create(createDto);

            expect(result.obNumber).toMatch(/^OB-\d{4}-\d{6}$/);
            expect(mockPrismaService.occurrence.create).toHaveBeenCalled();
            expect(mockAuditService.log).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'CREATED',
                    actorId: createDto.registeredById,
                }),
            );
        });

        it('should throw error if no involved party is provided', async () => {
            const createDto = {
                category: OccurrenceCategory.TRAFFIC_OFFENSE,
                severity: OccurrenceSeverity.HIGH,
                title: 'Test',
                description: 'Test description',
                occurrenceDate: '2026-01-13',
                occurrenceTime: '14:30',
                location: {},
                source: 'MANUAL' as any,
                registeredById: 'admin-123',
            };

            await expect(service.create(createDto)).rejects.toThrow(
                'At least one of driverId, passengerId, or vehicleId must be provided',
            );
        });
    });

    describe('findOne', () => {
        it('should return occurrence with all relations', async () => {
            const mockOccurrence = {
                id: 'occ-123',
                obNumber: 'OB-2026-000001',
                title: 'Test Occurrence',
                driver: { user: { fullName: 'John Doe' } },
                passenger: { fullName: 'Jane Smith' },
                media: [],
                objections: [],
                auditLog: [],
            };

            mockPrismaService.occurrence.findUnique.mockResolvedValue(mockOccurrence);

            const result = await service.findOne('occ-123');

            expect(result).toEqual(mockOccurrence);
            expect(mockPrismaService.occurrence.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'occ-123' },
                    include: expect.any(Object),
                }),
            );
        });

        it('should throw NotFoundException if occurrence not found', async () => {
            mockPrismaService.occurrence.findUnique.mockResolvedValue(null);

            await expect(service.findOne('invalid-id')).rejects.toThrow('Occurrence with ID invalid-id not found');
        });
    });

    describe('resolve', () => {
        it('should resolve an occurrence and create audit log', async () => {
            const existingOccurrence = {
                id: 'occ-123',
                status: 'OPEN',
            };

            const resolvedOccurrence = {
                ...existingOccurrence,
                status: 'RESOLVED',
                resolvedAt: new Date(),
                resolutionNotes: 'Issue resolved',
            };

            mockPrismaService.occurrence.findUnique.mockResolvedValue(existingOccurrence);
            mockPrismaService.occurrence.update.mockResolvedValue(resolvedOccurrence);

            const result = await service.resolve('occ-123', {
                resolvedById: 'admin-123',
                resolutionNotes: 'Issue resolved',
            });

            expect(result.status).toBe('RESOLVED');
            expect(mockAuditService.log).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'RESOLVED',
                    actorId: 'admin-123',
                }),
            );
        });

        it('should throw error if occurrence is already resolved', async () => {
            const resolvedOccurrence = {
                id: 'occ-123',
                status: 'RESOLVED',
            };

            mockPrismaService.occurrence.findUnique.mockResolvedValue(resolvedOccurrence);

            await expect(
                service.resolve('occ-123', {
                    resolvedById: 'admin-123',
                    resolutionNotes: 'Test',
                }),
            ).rejects.toThrow('Occurrence is already resolved');
        });
    });

    describe('getStatistics', () => {
        it('should return occurrence statistics', async () => {
            mockPrismaService.occurrence.count
                .mockResolvedValueOnce(100) // total
                .mockResolvedValueOnce(40) // open
                .mockResolvedValueOnce(50) // resolved
                .mockResolvedValueOnce(10); // disputed

            mockPrismaService.occurrence.groupBy
                .mockResolvedValueOnce([
                    { severity: 'CRITICAL', _count: 10 },
                    { severity: 'HIGH', _count: 30 },
                ])
                .mockResolvedValueOnce([
                    { category: 'TRAFFIC_OFFENSE', _count: 50 },
                    { category: 'CRIME', _count: 20 },
                ]);

            const result = await service.getStatistics();

            expect(result.total).toBe(100);
            expect(result.byStatus.open).toBe(40);
            expect(result.byStatus.resolved).toBe(50);
            expect(result.bySeverity).toHaveProperty('CRITICAL', 10);
            expect(result.byCategory).toHaveProperty('TRAFFIC_OFFENSE', 50);
        });
    });
});
