import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { VehicleService } from './vehicle.service';

@Controller('vehicles')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) { }

    @Get('driver/:driverId')
    getDriverVehicles(@Param('driverId') driverId: string) {
        return this.vehicleService.getDriverVehicles(driverId);
    }

    @Get('driver/:driverId/active')
    getActiveVehicle(@Param('driverId') driverId: string) {
        return this.vehicleService.getActiveVehicle(driverId);
    }

    @Post()
    addVehicle(@Body() body: any) {
        return this.vehicleService.addVehicle({
            driverId: body.driverId,
            make: body.make,
            model: body.model,
            year: body.year,
            color: body.color,
            licensePlate: body.licensePlate,
            vehicleType: body.vehicleType
        });
    }

    @Put(':vehicleId/activate')
    setActiveVehicle(@Param('vehicleId') vehicleId: string, @Body() body: any) {
        return this.vehicleService.setActiveVehicle(body.driverId, vehicleId);
    }

    @Put(':vehicleId')
    updateVehicle(@Param('vehicleId') vehicleId: string, @Body() body: any) {
        return this.vehicleService.updateVehicle(vehicleId, body);
    }

    @Delete(':vehicleId')
    deleteVehicle(@Param('vehicleId') vehicleId: string, @Body() body: any) {
        return this.vehicleService.deleteVehicle(vehicleId, body.driverId);
    }
}
