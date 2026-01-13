import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ObjectionService } from '../services/objection.service';
import { CreateObjectionDto, ReviewObjectionDto } from '../dto/objection.dto';

@Controller('objections')
export class ObjectionController {
    constructor(private readonly objectionService: ObjectionService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateObjectionDto) {
        return this.objectionService.create(createDto);
    }

    @Get('pending')
    async getPending() {
        return this.objectionService.getPending();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.objectionService.findOne(id);
    }

    @Get('occurrence/:occurrenceId')
    async findByOccurrence(@Param('occurrenceId') occurrenceId: string) {
        return this.objectionService.findByOccurrence(occurrenceId);
    }

    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        return this.objectionService.findByUser(userId);
    }

    @Post(':id/review')
    @HttpCode(HttpStatus.OK)
    async review(
        @Param('id') id: string,
        @Body() reviewDto: ReviewObjectionDto,
    ) {
        return this.objectionService.review(id, reviewDto);
    }
}
