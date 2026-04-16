import { Controller, Post, Body } from '@nestjs/common';
import { RatingService } from './rating.service';

interface CreateRatingDto {
  tripId: string;
  driverId: string;
  stars: number;
  review?: string;
}

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  create(@Body() createRatingDto: CreateRatingDto) {
    // In a real app, passengerId would come from the authenticated user (e.g., @Req() req)
    const passengerId = 'passenger-123';
    return this.ratingService.create(createRatingDto, passengerId);
  }
}