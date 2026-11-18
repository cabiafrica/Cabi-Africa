import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  HttpCode,
  Post,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { ScheduledRideService } from './scheduled_ride.service';

@Controller('scheduled-rides')
export class ScheduledRideController {
  constructor(private readonly scheduledRideService: ScheduledRideService) {}

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

  private assertAuthenticated(req: any): any {
    const user = this.extractUser(req);
    if (!user || (!user.id && !user.userId && !user.sub)) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  @Get('my-rides')
  getAssignedRides(@Req() req: any) {
    const user = this.assertAuthenticated(req);
    const driverId = user.id || user.userId || user.sub;
    return this.scheduledRideService.getAssignedRides(driverId);
  }

  @Delete(':id')
  @HttpCode(204)
  async cancelScheduledRide(@Param('id') rideId: string, @Req() req: any) {
    const user = this.assertAuthenticated(req);
    const passengerId = user.id || user.userId || user.sub;
    await this.scheduledRideService.cancelScheduledRide(rideId, passengerId);
  }

  @Post(':id/cancel-by-driver')
  @HttpCode(204)
  async cancelByDriver(@Param('id') rideId: string, @Req() req: any) {
    const user = this.assertAuthenticated(req);
    const driverId = user.id || user.userId || user.sub;
    await this.scheduledRideService.cancelByDriver(rideId, driverId);
  }
}
