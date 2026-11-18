import { Controller, Post, Body, Get, Logger, Query, HttpException, Param, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { DriverOrganizationService, CreateDriverOrgDto } from './driver-organization.service';

@Controller('driver-org')
export class DriverOrganizationController {
    private readonly logger = new Logger(DriverOrganizationController.name);

    constructor(private readonly service: DriverOrganizationService) { }

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
            throw new UnauthorizedException('Authentication required for driver organization management.');
        }
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('ORGANIZATION_') || p.startsWith('Sacco_') || p === 'SUPER_ADMIN');
        if (!isAdmin) {
            throw new ForbiddenException('Admin organization privileges required.');
        }
    }

    private assertSelfOrAdmin(req: any, targetDriverId: string): void {
        const user = this.extractUser(req);
        if (!user) {
            throw new UnauthorizedException('Authentication required.');
        }
        const callerId = user.id || user.sub || user.userId || user.driverProfileId;
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('ORGANIZATION_') || p.startsWith('Sacco_') || p === 'SUPER_ADMIN');
        if (callerId !== targetDriverId && !isAdmin) {
            throw new ForbiddenException('You are not authorized to manage another driver organization membership.');
        }
    }

    @Post('create')
    async create(@Req() req: any, @Body() dto: CreateDriverOrgDto) {
        this.assertAdmin(req);
        try {
            return await this.service.createOrganization(dto);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Post('join')
    async join(@Req() req: any, @Body() body: { driverId: string; orgId: string }) {
        this.assertSelfOrAdmin(req, body.driverId);
        try {
            return await this.service.joinOrganization(body.driverId, body.orgId);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Post('leave')
    async leave(@Req() req: any, @Body() body: { driverId: string }) {
        this.assertSelfOrAdmin(req, body.driverId);
        try {
            return await this.service.leaveOrganization(body.driverId);
        } catch (error) {
            throw new HttpException(error.message, 400);
        }
    }

    @Get('list')
    async list(@Query('search') search?: string) {
        return this.service.getOrganizations(search);
    }

    @Get('details/:id')
    async getDetails(@Param('id') id: string) {
        const details = await this.service.getDetails(id);
        if (!details) {
            throw new HttpException('Organization not found', 404);
        }
        return details;
    }
}
