import { Test, TestingModule } from '@nestjs/testing';
import { TokenCleanupJob } from './token-cleanup.job';
import { PrismaService } from '../prisma.service';
import { Logger } from '@nestjs/common';
import { subDays } from 'date-fns';

// Mock Prisma
const mockPrismaService = {
  user: {
    updateMany: jest.fn(),
  },
};

// Suppress logs
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { /* no-op */ });

describe('TokenCleanupJob', () => {
  let job: TokenCleanupJob;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCleanupJob,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    job = module.get<TokenCleanupJob>(TokenCleanupJob);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should call updateMany with correct parameters to clear stale tokens', async () => {
    const ninetyDaysAgo = subDays(new Date(), 90);
    (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

    await job.handleCron();

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: {
        lastActiveAt: {
          lt: expect.any(Date),
        },
        deviceTokens: { isEmpty: false },
      },
      data: {
        deviceTokens: [],
      },
    });
  });
});