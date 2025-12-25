import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DriverLeadService } from './driver-lead-service.service';

@Controller('driver-lead-service')
export class DriverLeadController {
  constructor(private readonly service: DriverLeadService) { }

  @Get('health')
  healthCheck() {
    return { status: 'OK', service: 'driver-lead-service' };
  }

  @Post('register')
  async register(@Body() body: any) {
    try {
      return await this.service.registerDriver(body);
    } catch (error) {
      return { error: (error as any).message };
    }
  }
}
