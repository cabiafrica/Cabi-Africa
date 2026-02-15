import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referral-service')
export class ReferralController {
  constructor(private readonly service: ReferralService) { }

  @Get('health')
  healthCheck() {
    return { status: 'OK', service: 'referral-service' };
  }

  @Get('admin/referral/formula')
  getFormula() {
    // Return hardcoded formula for now
    return {
      rules: [
        { recipient: 'sponsor', value: 200, type: 'fixed' },
        { recipient: 'upline', value: 100, type: 'fixed' },
        { recipient: 'company', value: 200, type: 'fixed' }
      ]
    };
  }

  @Post('admin/referral/formula')
  updateFormula(@Body() body: any) {
    console.log('Updating Referral formula:', body);
    return { message: 'Formula updated successfully', formula: body };
  }
}
