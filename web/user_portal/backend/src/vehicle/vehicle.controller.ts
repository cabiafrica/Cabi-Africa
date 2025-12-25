import { Controller, Put, Param, Req, HttpCode } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

interface MockRequest {
  user?: { id: string };
}

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Put(':id/set-active')
  @HttpCode(204)
  setActive(@Param('id') vehicleId: string, @Req() req: MockRequest) {
    const driverId = req.user?.id || 'driver-abc'; // Mocking driver ID from auth
    return this.vehicleService.setActive(driverId, vehicleId);
  }
}