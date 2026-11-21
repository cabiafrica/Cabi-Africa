import { Controller, Get, Post, Patch, Body, Param, Query, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';
import { DispatchService } from './dispatch.service';

export class ToggleDriverStatusDto {
    @IsBoolean()
    @IsNotEmpty()
    isOnline: boolean;
}

export class UpdateDriverLocationDto {
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @IsNumber()
    @IsNotEmpty()
    lng: number;
}

@Controller('dispatch')
export class DispatchController {
    constructor(private readonly dispatchService: DispatchService) { }

    private extractUser(req: any): any {
        if (req?.user) return req.user;
        const internalKey = process.env.INTERNAL_API_KEY;
        const providedKey = req?.headers?.['x-internal-api-key'];
        if (internalKey && providedKey && typeof providedKey === 'string') {
            try {
                const a = Buffer.from(internalKey);
                const b = Buffer.from(providedKey);
                if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
                    return { role: 'SUPER_ADMIN', permissions: ['SUPER_ADMIN'] };
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
        return user;
    }

    private assertAdmin(req: any): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }
        const role = (user.role || '').toUpperCase();
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role) ||
            (Array.isArray(user.permissions) && (user.permissions.includes('ADMIN') || user.permissions.includes('SUPER_ADMIN') || user.permissions.includes('DISPATCHER')));
        if (!isAdmin) {
            throw new ForbiddenException('Administrative privilege required');
        }
    }

    private async assertSelfOrAdmin(req: any, targetUserId?: string): Promise<void> {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }
        const role = (user.role || '').toUpperCase();
        const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role) ||
            (Array.isArray(user.permissions) && (user.permissions.includes('ADMIN') || user.permissions.includes('SUPER_ADMIN') || user.permissions.includes('DISPATCHER')));
        if (isAdmin) return;

        const callerId = user.id || user.userId || user.sub;
        if (targetUserId && callerId !== targetUserId) {
            const callerProfileId = user.driverProfileId || user.driverProfile?.id;
            if (callerProfileId && callerProfileId === targetUserId) {
                return;
            }
            const isOwner = await this.dispatchService.isDriverProfileOwnedBy(targetUserId, callerId);
            if (!isOwner) {
                throw new ForbiddenException('Access denied: Cannot act on behalf of another user');
            }
        }
    }

    @Get('metrics')
    async getMetrics(@Req() req: any) {
        this.assertAdmin(req);
        return this.dispatchService.getDashboardMetrics();
    }

    @Get('rides')
    async getRides(@Req() req: any) {
        this.assertAdmin(req);
        return this.dispatchService.getActiveRides();
    }

    @Get('drivers')
    async getDrivers(@Req() req: any) {
        this.assertAdmin(req);
        return this.dispatchService.getDispatchDrivers();
    }

    @Post('rides')
    async createRide(@Body() body: any, @Req() req: any) {
        this.assertAdmin(req);
        return this.dispatchService.createRide(body);
    }

    @Post('rides/:id/assign')
    async assignDriver(
        @Param('id') rideId: string,
        @Body('driverId') driverId: string,
        @Req() req: any,
    ) {
        this.assertAdmin(req);
        return this.dispatchService.assignDriver(rideId, driverId);
    }

    @Get('drivers/:driverId/status')
    async getDriverStatus(@Param('driverId') driverId: string, @Req() req: any) {
        await this.assertSelfOrAdmin(req, driverId);
        return this.dispatchService.getDriverStatus(driverId);
    }

    @Post('drivers/:driverId/toggle-status')
    async toggleDriverStatus(
        @Param('driverId') driverId: string,
        @Body() body: ToggleDriverStatusDto,
        @Req() req: any,
    ) {
        await this.assertSelfOrAdmin(req, driverId);
        return this.dispatchService.updateDriverStatus(driverId, body.isOnline);
    }

    @Post('drivers/:driverId/location')
    async updateDriverLocation(
        @Param('driverId') driverId: string,
        @Body() location: UpdateDriverLocationDto,
        @Req() req: any,
    ) {
        await this.assertSelfOrAdmin(req, driverId);
        return this.dispatchService.updateDriverLocation(driverId, location);
    }

    @Get('drivers/:driverId/preferences')
    async getDriverPreferences(
        @Param('driverId') driverId: string,
        @Req() req: any,
    ) {
        await this.assertSelfOrAdmin(req, driverId);
        return this.dispatchService.getDriverPreferences(driverId);
    }

    @Patch('drivers/:driverId/preferences')
    async updateDriverPreferences(
        @Param('driverId') driverId: string,
        @Body() preferences: { allowBackToBack?: boolean; destinationMode?: any },
        @Req() req: any,
    ) {
        await this.assertSelfOrAdmin(req, driverId);
        return this.dispatchService.updateDriverPreferences(driverId, preferences);
    }

    @Get('rides/current')
    async getCurrentRide(
        @Query('userId') userId: string,
        @Query('role') role: 'PASSENGER' | 'DRIVER',
        @Req() req: any,
    ) {
        this.assertSelfOrAdmin(req, userId);
        return this.dispatchService.getCurrentRide(userId, role);
    }

    // ── Vehicle Account ─────────────────────────────────────────────────────

    @Get('vehicles')
    async getVehicles(@Req() req: any) {
        this.assertAdmin(req);
        return this.dispatchService.getVehicles();
    }

    @Get('vehicles/:vehicleId/account')
    async getVehicleAccount(@Param('vehicleId') vehicleId: string, @Req() req: any) {
        this.assertAdmin(req);
        return this.dispatchService.getVehicleAccount(vehicleId);
    }

    @Post('vehicles/:vehicleId/incentives/claim')
    async claimVehicleIncentive(
        @Param('vehicleId') vehicleId: string,
        @Body() body: { benefitId: string; driverProfileId: string; notes?: string; evidenceUrl?: string },
        @Req() req: any,
    ) {
        this.assertSelfOrAdmin(req, body.driverProfileId);
        return this.dispatchService.claimVehicleIncentive(vehicleId, body);
    }
}

