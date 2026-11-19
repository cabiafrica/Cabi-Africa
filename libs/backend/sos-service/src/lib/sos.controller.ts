import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  Req,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { SOSService } from './sos.service';

@Controller('safety')
export class SOSController {
  constructor(private readonly sosService: SOSService) { }

  private extractUser(req: any): any {
    if (req?.user) return req.user;
    const internalKey = process.env.INTERNAL_API_KEY;
    const providedKey = req?.headers?.['x-internal-api-key'];
    if (internalKey && providedKey && typeof providedKey === 'string') {
      try {
        const a = Buffer.from(internalKey);
        const b = Buffer.from(providedKey);
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
          return { id: 'system-internal', role: 'SUPER_ADMIN', permissions: ['SUPER_ADMIN'] };
        }
      } catch {
        // continue
      }
    }
    let user = req?.user;
    if (!user && req?.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7);
      const secret =
        process.env.JWT_SECRET ||
        (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
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

  private assertAdmin(req: any): any {
    const user = this.extractUser(req);
    if (!user) throw new UnauthorizedException('Authentication required');
    const role = (user.role || '').toUpperCase();
    const isAdmin =
      ['ADMIN', 'SUPER_ADMIN', 'DISPATCHER'].includes(role) ||
      (Array.isArray(user.permissions) &&
        (user.permissions.includes('ADMIN') ||
          user.permissions.includes('SUPER_ADMIN') ||
          user.permissions.includes('DISPATCHER')));
    if (!isAdmin) throw new ForbiddenException('Administrative privilege required');
    return user;
  }

  private assertAuthenticated(req: any): any {
    const user = this.extractUser(req);
    if (!user || (!user.id && !user.userId && !user.sub)) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  @Post('alert')
  triggerAlert(@Body() body: any, @Req() req: any) {
    const user = this.assertAuthenticated(req);
    const callerId = user.id || user.userId || user.sub;
    const userType = (user.role || '').toUpperCase() === 'DRIVER' ? 'DRIVER' : 'PASSENGER';
    return this.sosService.createAlert(callerId, userType, body.location, body.tripId);
  }

  @Get('alerts')
  getAlerts(@Req() req: any) {
    this.assertAdmin(req);
    return this.sosService.getAlerts();
  }

  @Put('alerts/:id/acknowledge')
  acknowledge(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const admin = this.assertAdmin(req);
    const adminId = admin.id || admin.userId || admin.sub || body.adminId;
    return this.sosService.acknowledgeAlert(id, adminId);
  }

  @Post('resolve-sos')
  resolve(@Body() body: { userId: string; isMisuse: boolean; notes?: string }, @Req() req: any) {
    this.assertAdmin(req);
    return this.sosService.getAlerts().then((alerts) => {
      const activeAlert = alerts.find((a) => a.userId === body.userId && a.status !== 'RESOLVED');
      if (!activeAlert) throw new Error('No active SOS alert found for user');
      return this.sosService.resolveAlert(activeAlert.id, body.notes || 'Resolved via Safety API', body.isMisuse);
    });
  }

  @Get('sos-config')
  getConfig(@Req() req: any) {
    this.assertAuthenticated(req);
    return this.sosService.getPenaltyConfig();
  }

  @Put('sos-config')
  updateConfig(@Body() body: any, @Req() req: any) {
    this.assertAdmin(req);
    return this.sosService.updatePenaltyConfig(body);
  }
}
