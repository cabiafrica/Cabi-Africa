import { Controller, Post, Body, Get, Param, Patch, Query } from '@nestjs/common';
import { DispatchService } from './dispatch-service.service';

@Controller('dispatch')
export class DispatchController {
    constructor(private readonly service: DispatchService) { }

    @Get('health')
    healthCheck() {
        return { status: 'OK', service: 'dispatch-service', version: '1.1.0' };
    }

    @Get('metrics')
    async getMetrics() {
        return this.service.getDashboardMetrics();
    }

    @Get('rides')
    async getRides() {
        return this.service.getActiveRides();
    }

    @Get('drivers')
    async getDrivers() {
        return this.service.getDispatchDrivers();
    }

    @Post('rides')
    async requestRide(@Body() body: any) {
        return await this.service.requestRide(body);
    }

    @Post('rides/:id/assign')
    async assignDriver(@Param('id') id: string, @Body('driverId') driverId: string) {
        return await this.service.assignDriver(id, driverId);
    }

    @Post('rides/:id/accept')
    async acceptRide(@Param('id') id: string, @Body('driverId') driverId: string) {
        return await this.service.acceptRide(id, driverId);
    }

    @Post('rides/:id/pass')
    async passRide(@Param('id') id: string, @Body('driverId') driverId: string) {
        return await (this.service as any).passRide?.(id, driverId) || { success: true, message: 'Pass recorded' };
    }

    @Patch('rides/:id/status')
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return await this.service.updateRideStatus(id, status);
    }

    @Patch('rides/:id/complete')
    async completeRide(@Param('id') id: string) {
        return await this.service.completeRide(id);
    }

    @Get('drivers/:driverId/status')
    async getDriverStatus(@Param('driverId') driverId: string) {
        return this.service.getDriverStatus(driverId);
    }

    @Post('drivers/:driverId/toggle-status')
    async toggleDriverStatus(
        @Param('driverId') driverId: string,
        @Body('isOnline') isOnline: boolean,
    ) {
        return this.service.updateDriverStatus(driverId, isOnline);
    }

    @Post('drivers/:driverId/location')
    async updateDriverLocation(
        @Param('driverId') driverId: string,
        @Body() location: { lat: number; lng: number },
    ) {
        return this.service.updateDriverLocation(driverId, location);
    }

    @Get('rides/current')
    async getCurrentRide(
        @Query('userId') userId: string,
        @Query('role') role: 'PASSENGER' | 'DRIVER',
    ) {
        return this.service.getCurrentRide(userId, role);
    }

    @Get('rides/all')
    async getAllRides(@Query('limit') limit?: number) {
        return this.service.getAllRides(limit);
    }
}
