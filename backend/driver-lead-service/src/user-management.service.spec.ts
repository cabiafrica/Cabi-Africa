import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from '../../docs/user-management.service';
import { PrismaService } from './prisma.service';
import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { User } from '@prisma/client';
import * as geoip from 'geoip-lite';
import { NotificationService } from './notification.service';
import { AuthTokenService } from '../auth-token.service';

// Mock the external libraries
jest.mock('bcrypt');
jest.mock('speakeasy');
jest.mock('geoip-lite');

// Suppress console logs from the service during tests
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { /* no-op */ });
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { /* no-op */ });

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  driverProfile: {
    findFirst: jest.fn(),
  },
  loginHistory: {
    create: jest.fn().mockResolvedValue({}),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockNotificationService = {
  sendRecoveryCodeLoginAlert: jest.fn(),
  sendForgotEmailOtp: jest.fn(),
  sendSuspiciousLoginReportedAlert: jest.fn(),
};

mockPrismaService['$transaction'] = jest.fn().mockImplementation(async (args) => {
  return Promise.all(args);
});

const mockAuthTokenService = {
  generateAccessToken: jest.fn().mockImplementation((user) => Promise.resolve(`mock-jwt-for-${user.id}`)),
  generateImpersonationToken: jest.fn().mockResolvedValue('impersonation-token'),
};

const mockLoginDetails = {
  ipAddress: '8.8.8.8',
  userAgent: 'Test Browser',
};

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  isTwoFactorEnabled: false,
  twoFactorSecret: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  resetToken: null,
  resetTokenExpires: null,
  forgotEmailOtp: null,
  lastActiveAt: null,
  forgotEmailOtpExpires: null,
  recoveryCodes: [],
};

const mockUserWith2fa: User = {
  ...mockUser,
  id: 'user-2fa',
  isTwoFactorEnabled: true,
  twoFactorSecret: '2FA_SECRET',
  recoveryCodes: ['hashed-code-1', 'hashed-code-2'],
  forgotEmailOtp: '123456',
  forgotEmailOtpExpires: new Date(Date.now() + 600000),
};

const mockUserWithNoRecoveryCodes: User = {
  ...mockUserWith2fa,
  id: 'user-no-recovery',
  recoveryCodes: [],
};

const mockDriverProfile = {
  id: 'driver-1',
  userId: mockUserWith2fa.id,
  phone: '+15551234567',
  user: mockUserWith2fa,
};

const mockDriverProfileWithExpiredOtp = {
  ...mockDriverProfile,
  user: { ...mockUserWith2fa, forgotEmailOtpExpires: new Date(Date.now() - 1000) },
};

const mockLoginHistoryEntry = {
  id: 'login-history-1',
  userId: mockUser.id,
  ipAddress: '1.2.3.4',
  location: 'Test Location',
  createdAt: new Date(),
  reportedAt: null,
};

const mockReportedLoginHistoryEntry = {
  ...mockLoginHistoryEntry,
  id: 'login-history-2',
  reportedAt: new Date(),
};

const mockReportedLoginHistoryWithUser = {
  ...mockReportedLoginHistoryEntry,
  id: 'login-history-3',
  user: { email: mockUser.email },
};

describe('UserManagementService', () => {
  let service: UserManagementService;
  let prisma: PrismaService;
  let notificationService: NotificationService;
  let authTokenService: AuthTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AuthTokenService, useValue: mockAuthTokenService },
      ],
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
    authTokenService = module.get<AuthTokenService>(AuthTokenService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return an access token and log the attempt for a valid user without 2FA', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(mockUser.email, 'password123', mockLoginDetails);

      expect(result).toEqual({
        twoFactorRequired: false,
        accessToken: `mock-jwt-for-${mockUser.id}`,
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastActiveAt: expect.any(Date) },
      });
    });

    it('should return twoFactorRequired for a valid user with 2FA enabled and not log an attempt yet', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWith2fa);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(mockUserWith2fa.email, 'password123', mockLoginDetails);

      expect(result).toEqual({ twoFactorRequired: true });
      expect(prisma.user.update).not.toHaveBeenCalled(); // Should not update lastActiveAt yet
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(mockUser.email, 'wrong-password', mockLoginDetails)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for a non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login('nouser@example.com', 'password123', mockLoginDetails)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('loginWithTwoFactor', () => {
    it('should return an access token and log the attempt for a valid 2FA code', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWith2fa);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
      (geoip.lookup as jest.Mock).mockReturnValue({ city: 'Mountain View', country: 'US' });

      const result = await service.loginWithTwoFactor(mockUserWith2fa.email, '123456', mockLoginDetails);

      expect(speakeasy.totp.verify).toHaveBeenCalledWith(expect.objectContaining({
        secret: mockUserWith2fa.twoFactorSecret,
        encoding: 'base32',
        token: '123456',
      }));
      expect(result).toEqual({ accessToken: `mock-jwt-for-${mockUserWith2fa.id}` });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserWith2fa.id },
        data: { lastActiveAt: expect.any(Date) },
      });
    });

    it('should log the login attempt after a successful 2FA login', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWith2fa);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);
      (geoip.lookup as jest.Mock).mockReturnValue({ city: 'Mountain View', country: 'US' });

      await service.loginWithTwoFactor(mockUserWith2fa.email, '123456', mockLoginDetails);

      // Allow the async log method to be called
      await new Promise(process.nextTick);

      expect(prisma.loginHistory.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserWith2fa.id,
          ipAddress: mockLoginDetails.ipAddress,
          userAgent: mockLoginDetails.userAgent,
          location: 'Mountain View, US',
        },
      });
    });

    it('should throw UnauthorizedException for an invalid 2FA code', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWith2fa);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      await expect(
        service.loginWithTwoFactor(mockUserWith2fa.email, 'wrong-code', mockLoginDetails),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if 2FA is not enabled for the user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.loginWithTwoFactor(mockUser.email, '123456', mockLoginDetails)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.loginWithTwoFactor('nouser@example.com', '123456', mockLoginDetails),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('loginWithRecoveryCode', () => {
    it('should return a token, invalidate the code, and send a notification on successful recovery', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWith2fa);
      // Simulate the first code being a match
      (bcrypt.compare as jest.Mock).mockImplementation((plain, hash) => Promise.resolve(hash === 'hashed-code-1'));

      const result = await service.loginWithRecoveryCode(mockUserWith2fa.email, 'plain-code-1', mockLoginDetails);

      expect(result).toEqual({ accessToken: `mock-jwt-for-${mockUserWith2fa.id}` });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserWith2fa.id },
        data: {
          recoveryCodes: ['hashed-code-2'], // The used code is removed
        },
      });
      expect(notificationService.sendRecoveryCodeLoginAlert).toHaveBeenCalledWith(
        mockUserWith2fa.email,
      );
    });

    it('should throw UnauthorizedException for an invalid recovery code', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWith2fa);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // All comparisons fail

      await expect(
        service.loginWithRecoveryCode(mockUserWith2fa.email, 'wrong-code', mockLoginDetails),
      ).rejects.toThrow('Invalid recovery code.');
    });

    it('should throw UnauthorizedException if user has no recovery codes', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithNoRecoveryCodes);

      await expect(
        service.loginWithRecoveryCode(mockUserWithNoRecoveryCodes.email, 'any-code', mockLoginDetails),
      ).rejects.toThrow('Invalid recovery code or 2FA not enabled.');
    });

    it('should throw UnauthorizedException if 2FA is not enabled', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.loginWithRecoveryCode(mockUser.email, 'any-code', mockLoginDetails),
      ).rejects.toThrow('Invalid recovery code or 2FA not enabled.');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.loginWithRecoveryCode('nouser@example.com', 'any-code', mockLoginDetails),
      ).rejects.toThrow('Invalid recovery code or 2FA not enabled.');
    });
  });

  describe('Forgot Email Flow', () => {
    describe('initiateForgotEmail', () => {
      it('should generate OTP and send SMS if phone number exists', async () => {
        (prisma.driverProfile.findFirst as jest.Mock).mockResolvedValue(mockDriverProfile);
        (speakeasy.totp as jest.Mock).mockReturnValue('mock-otp');

        await service.initiateForgotEmail(mockDriverProfile.phone);

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: mockDriverProfile.userId },
          data: {
            forgotEmailOtp: 'mock-otp',
            forgotEmailOtpExpires: expect.any(Date),
          },
        });
        expect(notificationService.sendForgotEmailOtp).toHaveBeenCalledWith(mockDriverProfile.phone, 'mock-otp');
      });

      it('should do nothing if phone number does not exist to prevent enumeration', async () => {
        (prisma.driverProfile.findFirst as jest.Mock).mockResolvedValue(null);

        await service.initiateForgotEmail('non-existent-phone');

        expect(prisma.user.update).not.toHaveBeenCalled();
        expect(notificationService.sendForgotEmailOtp).not.toHaveBeenCalled();
      });
    });

    describe('verifyForgotEmail', () => {
      it('should return a masked email for a valid OTP', async () => {
        (prisma.driverProfile.findFirst as jest.Mock).mockResolvedValue(mockDriverProfile);

        const result = await service.verifyForgotEmail(mockDriverProfile.phone, '123456');

        expect(result).toEqual({ maskedEmail: 't***e@example.com' });
      });

      it('should throw an error for an invalid OTP', async () => {
        (prisma.driverProfile.findFirst as jest.Mock).mockResolvedValue(mockDriverProfile);

        await expect(service.verifyForgotEmail(mockDriverProfile.phone, 'wrong-otp')).rejects.toThrow(
          new BadRequestException('Invalid or expired OTP.'),
        );
      });

      it('should throw an error for an expired OTP', async () => {
        (prisma.driverProfile.findFirst as jest.Mock).mockResolvedValue(mockDriverProfileWithExpiredOtp);

        await expect(service.verifyForgotEmail(mockDriverProfile.phone, '123456')).rejects.toThrow(
          new BadRequestException('Invalid or expired OTP.'),
        );
      });

      it('should throw an error if the driver profile is not found', async () => {
        (prisma.driverProfile.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(service.verifyForgotEmail('non-existent-phone', '123456')).rejects.toThrow(
          new BadRequestException('Invalid or expired OTP.'),
        );
      });
    });
  });

  describe('reportSuspiciousLogin', () => {
    it('should mark an entry as reported and send a notification', async () => {
      (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(mockLoginHistoryEntry);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const updatedEntry = { ...mockLoginHistoryEntry, reportedAt: new Date() };
      (prisma.loginHistory.update as jest.Mock).mockResolvedValue(updatedEntry);

      await service.reportSuspiciousLogin(mockUser.id, mockLoginHistoryEntry.id);

      expect(prisma.loginHistory.update).toHaveBeenCalledWith({
        where: { id: mockLoginHistoryEntry.id },
        data: { reportedAt: expect.any(Date) },
      });

      expect(notificationService.sendSuspiciousLoginReportedAlert).toHaveBeenCalledWith(
        mockUser.email,
        updatedEntry,
      );
    });

    it('should throw BadRequestException if login entry is not found', async () => {
      (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.reportSuspiciousLogin(mockUser.id, 'not-found-id')).rejects.toThrow(
        new BadRequestException('Login activity not found or access denied.'),
      );
    });

    it('should throw BadRequestException if login entry belongs to another user', async () => {
      (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(mockLoginHistoryEntry);

      await expect(service.reportSuspiciousLogin('another-user-id', mockLoginHistoryEntry.id)).rejects.toThrow(
        new BadRequestException('Login activity not found or access denied.'),
      );
    });

    it('should do nothing if the login entry has already been reported', async () => {
      (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(mockReportedLoginHistoryEntry);

      await service.reportSuspiciousLogin(mockUser.id, mockReportedLoginHistoryEntry.id);

      expect(prisma.loginHistory.update).not.toHaveBeenCalled();
      expect(notificationService.sendSuspiciousLoginReportedAlert).not.toHaveBeenCalled();
    });

    it('should throw if user for notification is not found', async () => {
      (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(mockLoginHistoryEntry);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // Simulate user being deleted mid-process
      await expect(service.reportSuspiciousLogin(mockUser.id, mockLoginHistoryEntry.id)).rejects.toThrow();
    });
  });

  describe('Admin-Specific Methods', () => {
    describe('getReportedLogins', () => {
      it('should fetch reported logins with default parameters', async () => {
        (prisma.loginHistory.findMany as jest.Mock).mockResolvedValue([mockReportedLoginHistoryWithUser]);
        (prisma.loginHistory.count as jest.Mock).mockResolvedValue(1);

        const result = await service.getReportedLogins({});

        expect(prisma.loginHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { reportedAt: { not: null }, reviewedAt: null },
          orderBy: { reportedAt: 'desc' },
          skip: 0,
          take: 10,
        }));
        expect(result.data[0].userEmail).toBe(mockUser.email);
        expect(result.total).toBe(1);
      });

      it('should apply all filters correctly', async () => {
        (prisma.loginHistory.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.loginHistory.count as jest.Mock).mockResolvedValue(0);

        const filters = {
          userEmail: 'test@example.com',
          ipAddress: '1.2.3.4',
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: '2023-01-31T23:59:59.999Z',
        };
        await service.getReportedLogins(filters);

        expect(prisma.loginHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: {
            reportedAt: { not: null },
            reviewedAt: null,
            user: { email: { contains: filters.userEmail, mode: 'insensitive' } },
            ipAddress: { equals: filters.ipAddress },
            createdAt: {
              gte: new Date(filters.startDate),
              lte: new Date(filters.endDate),
            },
          },
        }));
      });
    });

    describe('dismissReportedLogin', () => {
      it('should update the login entry with a reviewedAt date', async () => {
        (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(mockReportedLoginHistoryEntry);

        await service.dismissReportedLogin(mockReportedLoginHistoryEntry.id);

        expect(prisma.loginHistory.update).toHaveBeenCalledWith({
          where: { id: mockReportedLoginHistoryEntry.id },
          data: { reviewedAt: expect.any(Date) },
        });
      });

      it('should throw BadRequestException if the entry is not found', async () => {
        (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(service.dismissReportedLogin('not-found-id')).rejects.toThrow(
          new BadRequestException('Reported login not found.'),
        );
      });
    });

    describe('forcePasswordResetForReportedLogin', () => {
      it('should call generatePasswordResetToken for the associated user', async () => {
        (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(mockReportedLoginHistoryWithUser);
        // Spy on the method within the same service instance
        const generateTokenSpy = jest.spyOn(service, 'generatePasswordResetToken').mockResolvedValue(undefined);

        await service.forcePasswordResetForReportedLogin(mockReportedLoginHistoryWithUser.id);

        expect(generateTokenSpy).toHaveBeenCalledWith(mockReportedLoginHistoryWithUser.user.email);
      });

      it('should throw BadRequestException if the entry or user is not found', async () => {
        (prisma.loginHistory.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(service.forcePasswordResetForReportedLogin('not-found-id')).rejects.toThrow(
          new BadRequestException('Reported login or associated user not found.'),
        );
      });
    });
  });

  describe('impersonateUser', () => {
    it('should generate and return an impersonation token for a valid user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const adminId = 'admin-user-id';

      const result = await service.impersonateUser(adminId, mockUser.id);

      expect(authTokenService.generateImpersonationToken).toHaveBeenCalledWith(mockUser, adminId);
      expect(result).toEqual({ accessToken: 'impersonation-token' });
    });

    it('should throw BadRequestException if the user to impersonate is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const adminId = 'admin-user-id';
      const nonExistentUserId = 'not-a-real-user';

      await expect(service.impersonateUser(adminId, nonExistentUserId)).rejects.toThrow(
        new BadRequestException('User to impersonate not found.'),
      );
    });
  });
});
