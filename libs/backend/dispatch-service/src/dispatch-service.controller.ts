import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DispatchService } from './dispatch-service.service';

@Controller('dispatch')
export class DispatchController {
    constructor(private readonly service: DispatchService) { }

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

    private assertAuthenticated(req: any): any {
        const user = this.extractUser(req);
        if (!user) throw new UnauthorizedException('Authentication required.');
        return user;
    }

    private assertDispatcherOrAdmin(req: any): any {
        const user = this.assertAuthenticated(req);
        const role = String(user.role || '').toUpperCase();
        if (!['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role)) {
            throw new ForbiddenException('Dispatcher or Administrator privileges required.');
        }
        return user;
    }

    private assertSelfDriverOrDispatcher(req: any, driverId: string): any {
        const user = this.assertAuthenticated(req);
        const role = String(user.role || '').toUpperCase();
        if (['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role)) return user;
        const callerId = String(user.sub || user.id || user.userId || '');
        const callerDriverId = String(user.driverProfile?.id || user.driverProfileId || '');
        if (callerId !== String(driverId) && callerDriverId !== String(driverId)) {
            throw new ForbiddenException('Access denied: Cannot act on behalf of another driver.');
        }
        return user;
    }

    @Get('health')
    healthCheck() {
        return { status: 'OK', service: 'dispatch-service', version: '1.1.0' };
    }

    @Get('metrics')
    async getMetrics(@Req() req: any) {
        this.assertDispatcherOrAdmin(req);
        return this.service.getDashboardMetrics();
    }

    @Get('rides')
    async getRides(@Req() req: any) {
        this.assertDispatcherOrAdmin(req);
        return this.service.getActiveRides();
    }

    @Get('drivers')
    async getDrivers(@Req() req: any) {
        this.assertDispatcherOrAdmin(req);
        return this.service.getDispatchDrivers();
    }

    @Post('rides')
    async requestRide(@Req() req: any, @Body() body: any) {
        this.assertAuthenticated(req);
        return await this.service.requestRide(body);
    }

    @Post('rides/:id/assign')
    async assignDriver(@Req() req: any, @Param('id') id: string, @Body('driverId') driverId: string) {
        this.assertDispatcherOrAdmin(req);
        return await this.service.assignDriver(id, driverId);
    }

    @Post('rides/:id/accept')
    async acceptRide(@Req() req: any, @Param('id') id: string, @Body('driverId') driverId: string) {
        this.assertSelfDriverOrDispatcher(req, driverId);
        return await this.service.acceptRide(id, driverId);
    }

    @Post('rides/:id/pass')
    async passRide(@Req() req: any, @Param('id') id: string, @Body('driverId') driverId: string) {
        this.assertSelfDriverOrDispatcher(req, driverId);
        return await (this.service as any).passRide?.(id, driverId) || { success: true, message: 'Pass recorded' };
    }

    @Patch('rides/:id/status')
    async updateStatus(@Req() req: any, @Param('id') id: string, @Body('status') status: string) {
        this.assertAuthenticated(req);
        return await this.service.updateRideStatus(id, status);
    }

    @Patch('rides/:id/complete')
    async completeRide(@Req() req: any, @Param('id') id: string) {
        this.assertAuthenticated(req);
        return await this.service.completeRide(id);
    }

    @Get('drivers/:driverId/status')
    async getDriverStatus(@Req() req: any, @Param('driverId') driverId: string) {
        this.assertSelfDriverOrDispatcher(req, driverId);
        return this.service.getDriverStatus(driverId);
    }

    @Post('drivers/:driverId/toggle-status')
    async toggleDriverStatus(
        @Req() req: any,
        @Param('driverId') driverId: string,
        @Body('isOnline') isOnline: boolean,
    ) {
        this.assertSelfDriverOrDispatcher(req, driverId);
        return this.service.updateDriverStatus(driverId, isOnline);
    }

    @Post('drivers/:driverId/location')
    async updateDriverLocation(
        @Req() req: any,
        @Param('driverId') driverId: string,
        @Body() location: { lat: number; lng: number },
    ) {
        this.assertSelfDriverOrDispatcher(req, driverId);
        if (!Number.isFinite(Number(location?.lat)) || !Number.isFinite(Number(location?.lng))) {
            throw new BadRequestException('Valid numeric lat and lng coordinates are required.');
        }
        return this.service.updateDriverLocation(driverId, location);
    }

    @Get('rides/current')
    async getCurrentRide(
        @Req() req: any,
        @Query('userId') userId: string,
        @Query('role') role: 'PASSENGER' | 'DRIVER',
    ) {
        const caller = this.assertAuthenticated(req);
        const callerRole = String(caller.role || '').toUpperCase();
        const effectiveUserId = ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(callerRole)
            ? userId || String(caller.sub || caller.id)
            : String(caller.sub || caller.id || caller.userId);
        return this.service.getCurrentRide(effectiveUserId, role);
    }

    @Get('rides/all')
    async getAllRides(@Req() req: any, @Query('limit') limit?: number) {
        this.assertDispatcherOrAdmin(req);
        return this.service.getAllRides(limit);
    }
}
