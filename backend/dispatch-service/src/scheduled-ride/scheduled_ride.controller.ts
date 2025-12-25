import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  UseGuards,
  HttpCode,
  Post,
  ForbiddenException,
} from '@nestjs/common';
import { ScheduledRideService } from './scheduled_ride.service';

// In a real app, an AuthGuard would populate `req.user`.
// We'll simulate this for now.
interface MockRequest {
  user?: {
    id: string;
    role?: string;
  };
}

@Controller('scheduled-rides')
export class ScheduledRideController {
  constructor(private readonly scheduledRideService: ScheduledRideService) {}

  @Get('my-rides')
  getAssignedRides(@Req() req: MockRequest) {
    // In a real app, the user's ID and role would come from a validated JWT.
    const driverId = req.user?.id || 'driver-abc';
    return this.scheduledRideService.getAssignedRides(driverId);
  }

  // @UseGuards(AuthGuard('jwt')) // This is how you'd protect the endpoint in a real app.
  @Delete(':id')
  @HttpCode(204) // Return 204 No Content on success
  async cancelScheduledRide(@Param('id') rideId: string, @Req() req: MockRequest) {
    // The passenger ID would come from the authenticated user's token.
    const passengerId = req.user?.id || 'user-passenger-123'; // Mocking for now
    // The service method will throw an error if the ride doesn't exist or the user is not authorized.
    // NestJS will automatically map these errors to 404/403 HTTP responses.
    await this.scheduledRideService.cancelScheduledRide(rideId, passengerId);
  }

  @Post(':id/cancel-by-driver')
  @HttpCode(204)
  async cancelByDriver(@Param('id') rideId: string, @Req() req: MockRequest) {
    const driverId = req.user?.id || 'driver-abc'; // Mocking for now

    // The service method will handle authorization and business logic.
    // It will throw an error if the driver is not authorized or if the cancellation window has passed.
    await this.scheduledRideService.cancelByDriver(rideId, driverId);
  }
}