import { Controller, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { ScheduledRideService } from './scheduled_ride.service';

@Controller('scheduled-rides')
export class ScheduledRideController {
  private readonly logger = new Logger(ScheduledRideController.name);
  
  // Mocking constructor injection
  private readonly rideService: ScheduledRideService = new ScheduledRideService();

  @Get('my-rides')
  async findForPassenger(@Req() req: any) { // Assuming user ID is on request
    const passengerId = 'passenger-1'; // Mocking passenger ID
    return this.rideService.findForPassenger(passengerId);
  }

  @Post(':id/cancel')
  async cancelScheduledRide(@Param('id') rideId: string, @Req() req: any) {
    const passengerId = 'passenger-1'; // Mocking passenger ID
    return this.rideService.cancelScheduledRide(rideId, passengerId);
  }
}