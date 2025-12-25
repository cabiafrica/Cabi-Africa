import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { DriverLeadsService } from './driver-leads.service';
import { RegisterLeadDto } from './driver-leads/dto/register-lead.dto';
import { MlmService } from './mlm.service';

@Controller('driver-leads')
export class DriverLeadsController {
  constructor(
    private readonly driverLeadsService: DriverLeadsService,
    private readonly mlmService: MlmService,
  ) {}

  @Post('register')
  register(@Body() registerLeadDto: RegisterLeadDto) {
    // The endpoint defined in US-001
    return this.driverLeadsService.register(registerLeadDto);
  }

  @Get('referral/validate')
  validateReferralCode(@Query('code') code: string) {
    return this.mlmService.validateReferralCode(code);
  }
}