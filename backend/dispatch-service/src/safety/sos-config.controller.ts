import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SosConfigService, UpdateSosConfigDto } from './sos-config.service';

@Controller('safety/sos-config')
export class SosConfigController {
    constructor(private readonly sosConfigService: SosConfigService) { }

    @Get()
    async getConfig() {
        return this.sosConfigService.getConfig();
    }

    @Put()
    async updateConfig(@Body() dto: UpdateSosConfigDto) {
        return this.sosConfigService.updateConfig(dto);
    }
}
