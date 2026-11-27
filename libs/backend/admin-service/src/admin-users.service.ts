import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@cabi/backend/database';
import { NotificationService } from '@cabi/backend/notification-service';
import { DualApprovalService } from './dual-approval.service';
import { globalAuditTelemetry } from '@cabi/backend/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { AdminUser, Permission } from './admin.types'; // We'll define these types
import { Permission as PrismaPermission } from '@prisma/client';

@Injectable()
export class AdminUsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => DualApprovalService))
        private readonly dualApprovalService?: DualApprovalService,
    ) { }

    async findAll(): Promise<AdminUser[]> {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { role: 'ADMIN' },
                    { userRoles: { some: {} } }
                ]
            },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                },
                userPermissions: true
            }
        });

        return users.map(user => ({
            id: user.id,
            email: user.email,
            roles: user.userRoles.map(ur => ur.role.name), // Returning role NAMES as IDs for frontend
            directGrants: user.userPermissions.filter(p => p.isGranted).map(p => p.permission),
            directRevokes: user.userPermissions.filter(p => !p.isGranted).map(p => p.permission),
            suspensionReason: null, // Placeholder or implement if exists
            suspensionDate: null
        }));
    }

    async findOne(id: string): Promise<AdminUser> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                userRoles: { include: { role: true } },
                userPermissions: true
            }
        });

        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        return {
            id: user.id,
            email: user.email,
            roles: user.userRoles.map(ur => ur.role.name),
            directGrants: user.userPermissions.filter(p => p.isGranted).map(p => p.permission),
            directRevokes: user.userPermissions.filter(p => !p.isGranted).map(p => p.permission),
        };
    }

    // Create Admin User with Dual-Channel (Email + SMS) Dispatch & Temporary Credentials
    async create(email: string, roleNames: string[], phone?: string): Promise<AdminUser & { tempPassword?: string; verificationPin?: string }> {
        const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
        const randomDigits = crypto.randomInt(10, 99);
        const tempPassword = `Cabi#${randomHex}!${randomDigits}`;
        const verificationPin = `${crypto.randomInt(100000, 999999)}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        // High-security 2-hour activation window for temporary administrative credentials
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    fullName: email.split('@')[0],
                    phone: phone || `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
                    role: 'ADMIN',
                    isIdentityVerified: false,
                    isEmailVerified: false,
                    isPhoneVerified: false,
                    forgotEmailOtp: verificationPin,
                    forgotEmailOtpExpires: expiresAt,
                    phoneOtpCode: verificationPin,
                    phoneOtpExpires: expiresAt,
                    privacySettings: {
                        isTemporaryPassword: true,
                        tempPasswordExpiresAt: expiresAt.toISOString(),
                        onboardingCompleted: false,
                        securityQuestions: [],
                    },
                }
            });
        } else {
            const currentPrivacy = (user.privacySettings as any) || {};
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    role: 'ADMIN',
                    phone: phone || user.phone,
                    isIdentityVerified: false,
                    isEmailVerified: false,
                    isPhoneVerified: false,
                    forgotEmailOtp: verificationPin,
                    forgotEmailOtpExpires: expiresAt,
                    phoneOtpCode: verificationPin,
                    phoneOtpExpires: expiresAt,
                    privacySettings: {
                        ...currentPrivacy,
                        isTemporaryPassword: true,
                        tempPasswordExpiresAt: expiresAt.toISOString(),
                        onboardingCompleted: false,
                    },
                }
            });
        }

        // Assign specified roles
        await this.updateRoles(user.id, roleNames);

        // 1. Send Email 1: Username & Temporary Password
        const adminPanelUrl = process.env.ADMIN_PANEL_URL || 'http://localhost:5173';
        const email1Html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #f8fafc; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #F59E0B; margin: 0; font-size: 24px; letter-spacing: 2px;">CABI AFRICA</h1>
    <p style="color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Institutional Administrative Access</p>
  </div>
  <div style="background: #18181b; padding: 24px; border-radius: 8px; border: 1px solid #3f3f46; margin-bottom: 24px;">
    <h2 style="color: #ffffff; font-size: 16px; margin-top: 0;">Administrative Credentials (Email 1 of 2)</h2>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">You have been provisioned administrative access on the Cabi Africa Platform. Use these initial credentials for your first sign-in:</p>
    <div style="background: #09090b; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 4px 0; color: #94a3b8; font-size: 12px;">USERNAME / EMAIL:</p>
      <p style="margin: 0 0 12px 0; color: #ffffff; font-size: 15px; font-weight: bold;">${email}</p>
      <p style="margin: 4px 0; color: #94a3b8; font-size: 12px;">TEMPORARY PASSWORD:</p>
      <p style="margin: 0; color: #F59E0B; font-size: 18px; font-weight: bold; font-family: monospace;">${tempPassword}</p>
    </div>
    <p style="color: #ef4444; font-size: 12px; font-weight: 600; margin-bottom: 0;">⚠️ Security Notice: This temporary password expires in 2 hours. Rotation and security setup are mandatory upon sign-in.</p>
  </div>
  <p style="color: #64748b; font-size: 12px; text-align: center;">For security verification, your activation PIN has been sent separately in Email 2.</p>
</div>
`;
        await this.notificationService.sendEmail(
            email,
            'Your Cabi Africa Administrator Credentials',
            email1Html
        );

        // 2. Send Email 2: Security Verification PIN & Activation Link
        const activationLink = `${adminPanelUrl}/login?verify=${verificationPin}&email=${encodeURIComponent(email)}`;
        const email2Html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #f8fafc; padding: 40px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #F59E0B; margin: 0; font-size: 24px; letter-spacing: 2px;">CABI AFRICA</h1>
    <p style="color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px;">Identity & Security Verification</p>
  </div>
  <div style="background: #18181b; padding: 24px; border-radius: 8px; border: 1px solid #3f3f46; margin-bottom: 24px;">
    <h2 style="color: #ffffff; font-size: 16px; margin-top: 0;">Security Verification PIN (Email 2 of 2)</h2>
    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">To finalize identity verification and configure your security safeguards, use the 6-digit PIN below:</p>
    <div style="text-align: center; background: #09090b; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px dashed #F59E0B;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #F59E0B; font-family: monospace;">${verificationPin}</span>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${activationLink}" style="background: #F59E0B; color: #000000; padding: 12px 28px; border-radius: 6px; font-weight: bold; text-decoration: none; display: inline-block;">Activate Administrator Account</a>
    </div>
    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">This PIN unlocks the mandatory Security Questions, Authenticator MFA (TOTP), and Biometrics enrollment wizard.</p>
  </div>
</div>
`;
        await this.notificationService.sendEmail(
            email,
            'Security Verification PIN & Account Activation',
            email2Html
        );

        // 3. Send SMS: Security Verification PIN & Temp Password
        if (user.phone) {
            const smsText = `Cabi Africa Admin Account Provisioned. Security PIN: ${verificationPin}. Temp Password: ${tempPassword} (valid 2h). Sign in at: ${adminPanelUrl}/login`;
            await this.notificationService.sendSms(user.phone, smsText);
        }

        console.log(`[AdminUsersService] 🔐 Dual-channel credentials dispatched to ${email} (SMS to ${user.phone ? '[MASKED]' : 'N/A'}): TempPass="[REDACTED]", VerificationPIN="[REDACTED]"`);

        const createdUser = await this.findOne(user.id);
        return {
            ...createdUser,
            tempPassword,
            verificationPin,
        };
    }

    // Re-issue activation credentials for an unactivated or expired administrator
    async resendActivation(email: string): Promise<{ success: boolean; message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { userRoles: { include: { role: true } } }
        });
        if (!user) throw new NotFoundException(`Admin user with email ${email} not found`);
        const roles = user.userRoles.map(ur => ur.role.name);
        await this.create(email, roles, user.phone || undefined);
        return { success: true, message: `Activation credentials re-dispatched to ${email}` };
    }

    async updateRoles(userId: string, roleNames: string[], callerUser?: any) {
        // Prevent Privilege Escalation: Non-SuperAdmins must pass through Dual-Authorization Queue
        const isGrantingSuperAdmin = roleNames.some(r => r.toUpperCase() === 'SUPER_ADMIN');
        if (isGrantingSuperAdmin && callerUser) {
            const isCallerSuperAdmin =
                callerUser.role?.toUpperCase() === 'SUPER_ADMIN' ||
                (Array.isArray(callerUser.userRoles) && callerUser.userRoles.some((ur: any) => ur.role?.name?.toUpperCase() === 'SUPER_ADMIN'));
            if (!isCallerSuperAdmin) {
                if (this.dualApprovalService) {
                    const approvalReq = await this.dualApprovalService.createRequest(
                        callerUser,
                        'ASSIGN_SUPER_ADMIN',
                        userId,
                        { roleNames },
                        `Assign SUPER_ADMIN role to user ${userId}`
                    );
                    const user = await this.findOne(userId);
                    return {
                        ...user,
                        pendingApproval: true,
                        approvalId: approvalReq.id,
                        message: 'SUPER_ADMIN assignment requires dual-authorization. Submitted to approval queue.'
                    } as any;
                }
                throw new ForbiddenException('CRITICAL SECURITY ALERT: Only a verified Super Administrator can assign the SUPER_ADMIN role.');
            }
        }

        // 1. Get role IDs from names
        const roles = await this.prisma.role.findMany({
            where: { name: { in: roleNames } }
        });

        // 2. Sync UserRoles
        // Transactional replace
        await this.prisma.$transaction(async (tx) => {
            // Remove existing
            await tx.userRole.deleteMany({ where: { userId } });

            // Add new
            if (roles.length > 0) {
                await tx.userRole.createMany({
                    data: roles.map(role => ({
                        userId,
                        roleId: role.id,
                        assignedById: null // Changed from 'SYSTEM' to null to avoid FK violation
                    }))
                });
            }
        });

        const updated = await this.findOne(userId);
        globalAuditTelemetry.logRoleChange(
            { userId: callerUser?.id, email: callerUser?.email, role: callerUser?.role },
            userId,
            (updated as any)?.email || userId,
            existingRoles.map(r => r.name),
            roleNames
        ).catch(() => {});

        return updated;
    }

    async updatePermissions(userId: string, grants: string[], revokes: string[], assignedById: string) {
        // Transactional replace
        await this.prisma.$transaction(async (tx) => {
            // Remove existing
            await tx.userPermission.deleteMany({ where: { userId } });

            const permissionsToCreate = [
                ...grants.map(p => ({ permission: p as PrismaPermission, isGranted: true })),
                ...revokes.map(p => ({ permission: p as PrismaPermission, isGranted: false }))
            ];

            if (permissionsToCreate.length > 0) {
                await tx.userPermission.createMany({
                    data: permissionsToCreate.map(p => ({
                        userId,
                        permission: p.permission,
                        isGranted: p.isGranted,
                        assignedById: assignedById // This comes from controller
                    }))
                });
            }
        });

        const updated = await this.findOne(userId);
        globalAuditTelemetry.logRoleChange(
            { userId: callerUser?.id, email: callerUser?.email, role: callerUser?.role },
            userId,
            (updated as any)?.email || userId,
            existingRoles.map(r => r.name),
            roleNames
        ).catch(() => {});

        return updated;
    }
}
