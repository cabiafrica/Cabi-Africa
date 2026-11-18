import { Controller, Post, Body, Get, Query, Param, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { DriverLeadsService } from './driver-leads.service';
import { RegisterLeadDto } from './driver-leads/dto/register-lead.dto';
import { ReferralService } from './referral.service';

@Controller('driver-leads')
export class DriverLeadsController {
  constructor(
    private readonly driverLeadsService: DriverLeadsService,
    private readonly referralService: ReferralService,
  ) { }

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
      throw new UnauthorizedException('Authentication required for administrative driver-lead operations.');
    }
    const perms: string[] = Array.isArray(user.permissions) ? user.permissions : [];
    const isAdmin =
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      perms.some((p: string) => p.startsWith('DRIVER_') || p.startsWith('USER_MANAGEMENT_') || p === 'SUPER_ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('Admin driver privileges required.');
    }
  }

  @Post('register')
  register(@Body() registerLeadDto: RegisterLeadDto) {
    // The endpoint defined in US-001
    return this.driverLeadsService.register(registerLeadDto);
  }

  @Get('referral/validate')
  validateReferralCode(@Query('code') code: string) {
    return this.referralService.validateReferralCode(code);
  }

  @Get('pending')
  getPendingDrivers(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10) {
    this.assertAdmin(req);
    return this.driverLeadsService.getPendingDrivers(Number(page), Number(limit));
  }

  @Post('simulate')
  simulate(@Req() req: any, @Body('count') count = 5) {
    this.assertAdmin(req);
    return this.driverLeadsService.simulateRegistrations(Number(count));
  }

  @Post(':id/approve')
  approve(@Req() req: any, @Param('id') id: string) {
    this.assertAdmin(req);
    return this.driverLeadsService.approveDriver(id);
  }

  @Post(':id/reject')
  reject(@Req() req: any, @Param('id') id: string, @Body('reasons') reasons: string[]) {
    this.assertAdmin(req);
    return this.driverLeadsService.rejectDriver(id, reasons);
  }
}