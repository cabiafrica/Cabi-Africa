import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { SOSService } from './sos.service';

@Controller('sos')
export class SOSController {
    constructor(private readonly sosService: SOSService) { }

    @Post('alert')
    triggerAlert(@Body() body: any) {
        return this.sosService.createAlert(body.userId, body.userType, body.location, body.tripId);
    }

    @Get('alerts')
    getAlerts() {
        return this.sosService.getAlerts();
    }

    @Put('alerts/:id/acknowledge')
    acknowledge(@Param('id') id: string, @Body() body: any) {
        return this.sosService.acknowledgeAlert(id, body.adminId);
    }
}
