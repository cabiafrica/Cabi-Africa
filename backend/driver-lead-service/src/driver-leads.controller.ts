import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { DriverLeadsService } from './driver-leads.service';
import { RegisterLeadDto } from './register-lead.dto';
import { MlmService } from './mlm.service';

@Controller('driver-leads')
export class DriverLeadsController {
  constructor(
    private readonly driverLeadsService: DriverLeadsService,
    private readonly mlmService: MlmService,
  ) { }

  @Post('register')
  register(@Body() registerLeadDto: RegisterLeadDto) {
    // The endpoint defined in US-001
    return this.driverLeadsService.register(registerLeadDto);
  }

  @Get('referral/validate')
  validateReferralCode(@Query('code') code: string) {
    return this.mlmService.validateReferralCode(code);
  }

  @Get('pending')
  getPendingDrivers(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.driverLeadsService.getPendingDrivers(Number(page), Number(limit));
  }

  @Post('simulate')
  simulate(@Body('count') count = 5) {
    return this.driverLeadsService.simulateRegistrations(Number(count));
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.driverLeadsService.approveDriver(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body('reasons') reasons: string[]) {
    return this.driverLeadsService.rejectDriver(id, reasons);
  }
}