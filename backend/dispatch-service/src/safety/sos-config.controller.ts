import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common'; // Trigger re-compile
import { SosConfigService } from './sos-config.service';
import { UpdateSosConfigDto } from './dto/update-sos-config.dto';

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
