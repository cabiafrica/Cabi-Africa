import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DispatchService } from './dispatch-service.service';

@Controller('dispatch-service')
export class DispatchController {
  constructor(private readonly service: DispatchService) { }

  @Get('health')
  healthCheck() {
    return { status: 'OK', service: 'dispatch-service' };
  }

  @Post('rides')
  async requestRide(@Body() body: any) {
    try {
      return await this.service.requestRide(body);
    } catch (error) {
      return { error: (error as any).message };
    }
  }

  @Post('rides/:id/assign')
  async assignDriver(@Param('id') id: string, @Body() body: { driverId: string }) {
    try {
      return await this.service.assignDriver(id, body.driverId);
    } catch (error) {
      return { error: (error as any).message };
    }
  }

  @Get('rides/:id')
  async getRideStatus(@Param('id') id: string) {
    try {
      return await this.service.getRideStatus(id);
    } catch (error) {
      return { error: (error as any).message };
    }
  }
}
