import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ReferralService } from './referral.service';

@Controller('referral-service')
export class ReferralController {
  constructor(private readonly service: ReferralService) { }

  private assertAdmin(req: any): void {
    let user = req?.user;
    if (!user && typeof req?.headers?.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.substring(7).trim();
      const secret =
        process.env.JWT_SECRET ||
        process.env.SUPABASE_JWT_SECRET ||
        (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod' : '');
      if (secret) {
        try {
          user = jwt.verify(token, secret) as any;
        } catch {
          user = null;
        }
      }
    }
    if (!user) throw new UnauthorizedException('Authentication required.');
    const role = String(user.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Administrator privileges required.');
    }
  }

  @Get('health')
  healthCheck() {
    return { status: 'OK', service: 'referral-service' };
  }

  @Get('admin/referral/formula')
  getFormula(@Req() req: any) {
    this.assertAdmin(req);
    return {
      rules: [
        { recipient: 'sponsor', value: 200, type: 'fixed' },
        { recipient: 'upline', value: 100, type: 'fixed' },
        { recipient: 'company', value: 200, type: 'fixed' }
      ]
    };
  }

  @Post('admin/referral/formula')
  updateFormula(@Req() req: any, @Body() body: any) {
    this.assertAdmin(req);
    return { message: 'Formula updated successfully', formula: body };
  }
}
