import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import { NotificationService } from '../notification.service';
import { AuthTokenService } from '../auth-token.service';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as geoip from 'geoip-lite';

@Injectable()
export class UserManagementService {
    private readonly logger = new Logger(UserManagementService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
        private readonly authTokenService: AuthTokenService,
    ) { }

    async login(email: string, password: string, details: { ipAddress: string; userAgent: string }) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (user.isTwoFactorEnabled) {
            return { twoFactorRequired: true };
        }

        await this.updateLastActive(user.id);
        await this.logLoginAttempt(user.id, details);

        const accessToken = await this.authTokenService.generateAccessToken(user);
        return { twoFactorRequired: false, accessToken };
    }

    async loginWithTwoFactor(email: string, code: string, details: { ipAddress: string; userAgent: string }) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
            throw new UnauthorizedException('2FA not enabled for this user');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
        });

        if (!verified) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        await this.updateLastActive(user.id);
        await this.logLoginAttempt(user.id, details);

        const accessToken = await this.authTokenService.generateAccessToken(user);
        return { accessToken };
    }

    async loginWithRecoveryCode(email: string, recoveryCode: string, details: { ipAddress: string; userAgent: string }) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user || !user.isTwoFactorEnabled || !user.recoveryCodes.length) {
            throw new UnauthorizedException('Invalid recovery code or 2FA not enabled.');
        }

        let matchedCodeIndex = -1;
        for (let i = 0; i < user.recoveryCodes.length; i++) {
            if (await bcrypt.compare(recoveryCode, user.recoveryCodes[i])) {
                matchedCodeIndex = i;
                break;
            }
        }

        if (matchedCodeIndex === -1) {
            throw new UnauthorizedException('Invalid recovery code.');
        }

        // Remove the used recovery code
        const newRecoveryCodes = [...user.recoveryCodes];
        newRecoveryCodes.splice(matchedCodeIndex, 1);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { recoveryCodes: newRecoveryCodes },
        });

        await this.updateLastActive(user.id);
        await this.logLoginAttempt(user.id, details);

        // US-010: Send notification
        await this.notificationService.sendRecoveryCodeLoginAlert(user.email);

        const accessToken = await this.authTokenService.generateAccessToken(user);
        return { accessToken };
    }

    async initiateForgotEmail(phone: string) {
        const driver = await this.prisma.driverProfile.findFirst({
            where: { user: { phone } },
            include: { user: true },
        });

        if (!driver) {
            this.logger.warn(`Forgot email initiated for non-existent phone: ${phone}`);
            return; // Do nothing to prevent enumeration
        }

        // Cryptographically secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        await this.prisma.user.update({
            where: { id: driver.userId },
            data: {
                forgotEmailOtp: otp,
                forgotEmailOtpExpires: new Date(Date.now() + 600000), // 10 mins
            },
        });

        await this.notificationService.sendForgotEmailOtp(phone, otp);
    }

    async verifyForgotEmail(phone: string, otp: string) {
        const driver = await this.prisma.driverProfile.findFirst({
            where: { user: { phone } },
            include: { user: true },
        });

        const userObj = driver?.user as any;
        const storedOtp = userObj?.forgotEmailOtp;
        const expiresAt = userObj?.forgotEmailOtpExpires;

        if (!driver || !storedOtp || typeof storedOtp !== 'string' || !otp || typeof otp !== 'string') {
            throw new BadRequestException('Invalid or expired OTP.');
        }

        if (expiresAt && new Date(expiresAt) < new Date()) {
            throw new BadRequestException('Invalid or expired OTP.');
        }

        const bufA = Buffer.from(storedOtp);
        const bufB = Buffer.from(otp);
        if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
            throw new BadRequestException('Invalid or expired OTP.');
        }

        // Invalidate OTP immediately to prevent replay attacks
        await this.prisma.user.update({
            where: { id: driver.userId },
            data: {
                forgotEmailOtp: null,
                forgotEmailOtpExpires: null,
            },
        });

        const email = userObj.email;
        const [name, domain] = email.split('@');
        const maskedEmail = `${name[0]}***${name[name.length - 1]}@${domain}`;

        return { maskedEmail };
    }

    async reportSuspiciousLogin(userId: string, loginId: string) {
        const loginEntry = await this.prisma.loginHistory.findUnique({
            where: { id: loginId },
            include: { user: true }
        });

        if (!loginEntry || loginEntry.userId !== userId) {
            throw new BadRequestException('Login activity not found or access denied.');
        }

        if (loginEntry.reportedAt) {
            return;
        }

        const updated = await this.prisma.loginHistory.update({
            where: { id: loginId },
            data: { reportedAt: new Date() },
        });

        await this.notificationService.sendSuspiciousLoginReportedAlert((loginEntry as any).user.email, updated);
    }

    async getReportedLogins(filters: any) {
        const where: any = {
            reportedAt: { not: null },
            reviewedAt: null,
        };

        if (filters.userEmail) {
            where.user = { email: { contains: filters.userEmail, mode: 'insensitive' } };
        }
        if (filters.ipAddress) {
            where.ipAddress = { equals: filters.ipAddress };
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        const [data, total] = await Promise.all([
            this.prisma.loginHistory.findMany({
                where,
                include: { user: { select: { email: true } } },
                orderBy: { reportedAt: 'desc' },
                skip: filters.skip || 0,
                take: filters.take || 10,
            }),
            this.prisma.loginHistory.count({ where }),
        ]);

        return {
            data: data.map((d: any) => ({ ...d, userEmail: d.user.email })),
            total,
        };
    }

    async dismissReportedLogin(loginId: string) {
        const entry = await this.prisma.loginHistory.findUnique({ where: { id: loginId } });
        if (!entry) {
            throw new BadRequestException('Reported login not found.');
        }

        await this.prisma.loginHistory.update({
            where: { id: loginId },
            data: { reviewedAt: new Date() },
        });
    }

    async forcePasswordResetForReportedLogin(loginId: string) {
        const entry = await this.prisma.loginHistory.findUnique({
            where: { id: loginId },
            include: { user: true }
        });

        if (!entry || !(entry as any).user) {
            throw new BadRequestException('Reported login or associated user not found.');
        }

        await this.generatePasswordResetToken((entry as any).user.email);
    }

    async generatePasswordResetToken(email: string) {
        this.logger.log(`Generating password reset token for ${email}`);
        // Implementation omitted for brevity
    }

    async impersonateUser(adminId: string, userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User to impersonate not found.');
        }

        const accessToken = await this.authTokenService.generateImpersonationToken(user, adminId);
        return { accessToken };
    }

    private async updateLastActive(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: new Date() },
        });
    }

    private async logLoginAttempt(userId: string, details: { ipAddress: string; userAgent: string }) {
        const lookup = geoip.lookup(details.ipAddress);
        const location = lookup ? `${lookup.city}, ${lookup.country}` : 'Unknown';

        await this.prisma.loginHistory.create({
            data: {
                userId,
                ipAddress: details.ipAddress,
                userAgent: details.userAgent,
                location,
            },
        });
    }
}
