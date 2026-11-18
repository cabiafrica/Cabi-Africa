import { Controller, Get, Put, Body, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { SosConfigService } from './sos-config.service';
import { UpdateSosConfigDto } from './dto/update-sos-config.dto';

@Controller('safety/sos-config')
export class SosConfigController {
    constructor(private readonly sosConfigService: SosConfigService) { }

    private assertAdmin(req: any): void {
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
            throw new UnauthorizedException('Authentication required for administrative SOS config operations.');
        }
        const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
        const isAdmin =
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            perms.some((p: string) => p.startsWith('SYSTEM_SETTINGS_') || p.startsWith('SAFETY_') || p === 'SUPER_ADMIN');
        if (!isAdmin) {
            throw new ForbiddenException('Admin safety privileges required.');
        }
    }

    @Get()
    async getConfig() {
        return this.sosConfigService.getConfig();
    }

    @Put()
    async updateConfig(@Req() req: any, @Body() dto: UpdateSosConfigDto) {
        this.assertAdmin(req);
        return this.sosConfigService.updateConfig(dto);
    }
}
