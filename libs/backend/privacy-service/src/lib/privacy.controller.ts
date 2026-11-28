import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrivacyService } from './privacy.service';

@Controller('privacy')
export class PrivacyController {
    constructor(private readonly privacyService: PrivacyService) { }

    private extractUser(req: any): any {
        if (req?.user) return req.user;
        const authHeader = req?.headers?.authorization;
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            const secret =
                process.env.JWT_SECRET ||
                process.env.SUPABASE_JWT_SECRET ||
                (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
            if (secret) {
                try {
                    return jwt.verify(token, secret) as any;
                } catch {
                    return null;
                }
            }
        }
        return null;
    }

    private assertSelfOrAdmin(req: any, targetUserId: string): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        const role = String(user.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            return;
        }
        const callerId = String(user.sub || user.id || user.userId || '');
        if (!callerId || callerId !== String(targetUserId)) {
            throw new ForbiddenException('Access denied: Cannot access another user\'s privacy records.');
        }
    }

    // Privacy Settings
    @Get('settings/:userId')
    getPrivacySettings(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.privacyService.getPrivacySettings(userId);
    }

    @Put('settings/:userId')
    updatePrivacySettings(@Req() req: any, @Param('userId') userId: string, @Body() updates: any) {
        this.assertSelfOrAdmin(req, userId);
        return this.privacyService.updatePrivacySettings(userId, updates);
    }

    // Data Export
    @Post('export/:userId')
    requestDataExport(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.privacyService.requestDataExport(userId);
    }

    @Get('export/:userId/status')
    getDataExportStatus(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.privacyService.getDataExportStatus(userId);
    }

    // Account Deletion
    @Post('delete-account/:userId')
    requestAccountDeletion(@Req() req: any, @Param('userId') userId: string, @Body() body: any) {
        this.assertSelfOrAdmin(req, userId);
        return this.privacyService.requestAccountDeletion(userId, body.password);
    }

    @Delete('delete-account/:userId/cancel')
    cancelAccountDeletion(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.privacyService.cancelAccountDeletion(userId);
    }

    // Marketing Preferences Check
    @Get('marketing/:userId/can-email')
    canSendMarketingEmail(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.privacyService.canSendMarketingEmail(userId);
    }

    @Get('marketing/:userId/can-push')
    canSendMarketingPush(@Req() req: any, @Param('userId') userId: string) {
        this.assertSelfOrAdmin(req, userId);
        return this.privacyService.canSendMarketingPush(userId);
    }
}
