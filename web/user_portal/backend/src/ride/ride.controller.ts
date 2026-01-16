import { Controller, Get, Logger, Query, Req, UseGuards } from '@nestjs/common';
import { RideService } from './ride.service';
// import { AuthGuard } from '@nestjs/passport'; // In a real app, you'd use a guard

@Controller('rides')
export class RideController {
  private readonly logger = new Logger(RideController.name);

  constructor(private readonly rideService: RideService) {}

  @Get('my-history')
  // @UseGuards(AuthGuard('jwt')) // Protect this route
  async getMyHistory(
    @Req() req: any, // In a real app, req.user would be populated by the AuthGuard
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    // Mocking an authenticated user ID. In a real app, this would come from the JWT.
    const driverId = 'driver-abc'; // req.user.id;
    this.logger.log(`Fetching trip history for driver ${driverId}`);
    return this.rideService.findForUser(driverId, { page, limit });
  }
}