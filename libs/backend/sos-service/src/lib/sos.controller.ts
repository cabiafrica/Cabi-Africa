import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { SOSService } from './sos.service';

@Controller('safety')
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

    @Post('resolve-sos')
    resolve(@Body() body: { userId: string, isMisuse: boolean, notes?: string }) {
        // The frontend passes userId and isMisuse. 
        // Our service has resolveAlert which takes alertId.
        // For now, let's find the active alert for the user.
        return this.sosService.getAlerts().then(alerts => {
            const activeAlert = alerts.find(a => a.userId === body.userId && a.status !== 'RESOLVED');
            if (!activeAlert) throw new Error("No active SOS alert found for user");
            return this.sosService.resolveAlert(activeAlert.id, body.notes || 'Resolved via Safety API', body.isMisuse);
        });
    }

    @Get('sos-config')
    getConfig() {
        return this.sosService.getPenaltyConfig();
    }

    @Put('sos-config')
    updateConfig(@Body() body: any) {
        return this.sosService.updatePenaltyConfig(body);
    }
}
