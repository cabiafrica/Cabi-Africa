import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { RatingService } from './rating.service';

@Controller('ratings')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

    @Post()
    submitRating(@Body() body: any) {
        return this.ratingService.submitRating({
            rideId: body.rideId,
            raterId: body.raterId,
            rateeId: body.rateeId,
            stars: body.stars,
            comment: body.comment,
            type: body.type
        });
    }

    // Admin Endpoints
    @Get('admin/all')
    getAll(@Query('stars') stars: number, @Query('rateeId') rateeId: string) {
        return this.ratingService.getAllRatings(stars ? Number(stars) : undefined, rateeId);
    }

    @Put('admin/:id/hide')
    hideRating(@Param('id') id: string) {
        return this.ratingService.hideRating(id);
    }
}
