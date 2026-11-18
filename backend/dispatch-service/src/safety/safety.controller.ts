import { Controller, Post, Body, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { SafetyService } from './safety.service';

class SosSignalDto {
  tripId: string;
  location: { lat: number; lon: number };
}

@Controller('safety')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) { }

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

  @Post('sos')
  triggerSos(@Body() sosSignalDto: SosSignalDto, @Req() req: any) {
    const user = this.extractUser(req);
    if (!user || (!user.id && !user.userId && !user.sub)) {
      throw new UnauthorizedException('Authentication required to trigger emergency SOS');
    }
    const callerId = user.id || user.userId || user.sub;
    const callerRole = user.role || 'PASSENGER';
    return this.safetyService.handleSosSignal(callerId, callerRole, sosSignalDto);
  }

  @Post('resolve-sos')
  resolveSos(@Body() body: { userId: string; isMisuse: boolean }, @Req() req: any) {
    this.assertAdmin(req);
    return this.safetyService.resolveSosIncident(body.userId, body.isMisuse);
  }
}
