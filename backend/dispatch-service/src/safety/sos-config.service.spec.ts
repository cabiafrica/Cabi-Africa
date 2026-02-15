import { Test, TestingModule } from '@nestjs/testing';
import { SosConfigService } from './sos-config.service';
import { PrismaService } from '@cabi/backend/database';

describe('SosConfigService', () => {
    let service: SosConfigService;
    let prisma: PrismaService;

    const mockPrismaService = {
        sosConfig: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SosConfigService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<SosConfigService>(SosConfigService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getConfig', () => {
        it('should return existing config if found', async () => {
            const mockConfig = { id: '1', type: 'FEE', feeAmount: 500, isActive: true };
            mockPrismaService.sosConfig.findFirst.mockResolvedValue(mockConfig);

            const result = await service.getConfig();

            expect(result).toEqual(mockConfig);
            expect(prisma.sosConfig.findFirst).toHaveBeenCalled();
        });

        it('should create and return default config if none found', async () => {
            mockPrismaService.sosConfig.findFirst.mockResolvedValue(null);
            const mockDefault = { id: 'default', type: 'FEE', feeAmount: 500, isActive: true };
            mockPrismaService.sosConfig.create.mockResolvedValue(mockDefault);

            const result = await service.getConfig();

            expect(result).toEqual(mockDefault);
            expect(prisma.sosConfig.create).toHaveBeenCalled();
        });
    });

    describe('updateConfig', () => {
        it('should update existing active config', async () => {
            const activeConfig = { id: '1', type: 'FEE', feeAmount: 500 };
            const dto = { type: 'REVOKE_BADGE' as any, badgeId: 'badge-1' };

            mockPrismaService.sosConfig.findFirst.mockResolvedValue(activeConfig);
            mockPrismaService.sosConfig.update.mockResolvedValue({ ...activeConfig, ...dto });

            const result = await service.updateConfig(dto);

            expect(result.type).toBe('REVOKE_BADGE');
            expect(prisma.sosConfig.update).toHaveBeenCalled();
        });
    });
});
