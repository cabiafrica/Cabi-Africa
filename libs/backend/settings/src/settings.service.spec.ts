import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '@cabi/backend/database';

describe('SettingsService', () => {
    let service: SettingsService;
    let prisma: PrismaService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        ridePreference: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
        setting: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
            findMany: jest.fn(),
        },
        driverSavingsPreference: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SettingsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<SettingsService>(SettingsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUserSettings', () => {
        it('should return user if found', async () => {
            const mockUser = { id: '1', fullName: 'Test User' };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.getUserSettings('1');
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.getUserSettings('1')).rejects.toThrow();
        });
    });

    describe('getSystemSetting', () => {
        it('should return setting value if found', async () => {
            mockPrismaService.setting.findUnique.mockResolvedValue({ key: 'test', value: 'val' });
            const result = await service.getSystemSetting('test');
            expect(result).toBe('val');
        });

        it('should return null if setting not found', async () => {
            mockPrismaService.setting.findUnique.mockResolvedValue(null);
            const result = await service.getSystemSetting('test');
            expect(result).toBeNull();
        });
    });
});
