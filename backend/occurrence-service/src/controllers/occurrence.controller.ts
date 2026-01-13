import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { OccurrenceService } from '../services/occurrence.service';
import {
    CreateOccurrenceDto,
    UpdateOccurrenceDto,
    ResolveOccurrenceDto,
    FilterOccurrenceDto,
} from '../dto/occurrence.dto';

@Controller('occurrences')
export class OccurrenceController {
    constructor(private readonly occurrenceService: OccurrenceService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateOccurrenceDto) {
        return this.occurrenceService.create(createDto);
    }

    @Get()
    async findAll(@Query() filters: FilterOccurrenceDto) {
        return this.occurrenceService.findAll(filters);
    }

    @Get('statistics')
    async getStatistics() {
        return this.occurrenceService.getStatistics();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.occurrenceService.findOne(id);
    }

    @Get('user/:userId/history')
    async getUserHistory(
        @Param('userId') userId: string,
        @Query('role') role: 'passenger' | 'driver',
    ) {
        return this.occurrenceService.getUserHistory(userId, role);
    }

    @Get('vehicle/:vehicleId/history')
    async getVehicleHistory(@Param('vehicleId') vehicleId: string) {
        return this.occurrenceService.getVehicleHistory(vehicleId);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateOccurrenceDto,
        @Body('actorId') actorId: string,
    ) {
        return this.occurrenceService.update(id, updateDto, actorId);
    }

    @Post(':id/resolve')
    @HttpCode(HttpStatus.OK)
    async resolve(
        @Param('id') id: string,
        @Body() resolveDto: ResolveOccurrenceDto,
    ) {
        return this.occurrenceService.resolve(id, resolveDto);
    }

    @Post(':id/flag')
    @HttpCode(HttpStatus.OK)
    async flag(
        @Param('id') id: string,
        @Body('reason') reason: string,
        @Body('actorId') actorId: string,
    ) {
        return this.occurrenceService.flag(id, reason, actorId);
    }
}
