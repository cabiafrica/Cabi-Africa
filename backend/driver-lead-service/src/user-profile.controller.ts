import { Body, Controller, Get, Param, Post, Put, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { DriverLeadsService } from './driver-leads.service';

@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('api/users')
export class UserProfileController {
    constructor(private readonly driverLeadsService: DriverLeadsService) { }

    private assertSelfOrAdmin(req: any, targetUserId: string): void {
        const internalKey = process.env.INTERNAL_API_KEY;
        const providedKey = req?.headers?.['x-internal-api-key'];
        if (internalKey && providedKey && typeof providedKey === 'string') {
            try {
                const a = Buffer.from(internalKey);
                const b = Buffer.from(providedKey);
                if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
                    return;
                }
            } catch {
                // continue
            }
        }
        let user = req?.user;
        if (!user && req?.headers?.authorization?.startsWith('Bearer ')) {
            const token = req.headers.authorization.substring(7);
            const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
            if (secret) {
                try {
                    user = jwt.verify(token, secret) as any;
                } catch {
                    user = null;
                }
            }
        }
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        const callerId = user.id || user.sub || user.userId;
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || perms.some((p: string) => p.startsWith('USER_MANAGEMENT_') || p === 'SUPER_ADMIN');
        if (callerId !== targetUserId && !isAdmin) {
            throw new ForbiddenException('You are not authorized to access or modify another user profile.');
        }
    }

    @Get(':userId/profile')
    @ApiOperation({ summary: 'Get user profile' })
    async getProfile(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.driverLeadsService.updateUserProfile(userId, {});
    }

    @Put(':userId/profile')
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(@Req() req: any, @Param('userId') userId: string, @Body() data: any) {
        this.assertSelfOrAdmin(req, userId);
        return this.driverLeadsService.updateUserProfile(userId, data);
    }

    @Put(':userId/privacy')
    @ApiOperation({ summary: 'Update privacy settings' })
    async updatePrivacy(@Req() req: any, @Param('userId') userId: string, @Body() settings: any) {
        this.assertSelfOrAdmin(req, userId);
        return this.driverLeadsService.updatePrivacySettings(userId, settings);
    }

    @Post(':userId/2fa/enable')
    @ApiOperation({ summary: 'Enable 2FA' })
    async enable2FA(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.driverLeadsService.enable2FA(userId);
    }

    @Post(':userId/2fa/disable')
    @ApiOperation({ summary: 'Disable 2FA' })
    async disable2FA(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.driverLeadsService.disable2FA(userId);
    }
}
