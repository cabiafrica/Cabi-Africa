import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { SocialService } from './social.service';

interface CreateStoryDto {
  contentUrl: string;
  contentType: 'image' | 'video';
}

interface ReportStoryDto {
  reason: string;
}

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Post('stories')
  createStory(@Body() dto: CreateStoryDto) {
    const driverId = 'driver-123'; // From authenticated user
    return this.socialService.createStory(driverId, dto.contentUrl, dto.contentType);
  }

  @Get('stories/feed')
  getStoryFeed() {
    return this.socialService.getStoryFeed();
  }

  @Post('stories/:id/report')
  reportStory(@Param('id') storyId: string, @Body() dto: ReportStoryDto) {
    const reportingDriverId = 'driver-456'; // From authenticated user
    return this.socialService.reportStory(storyId, reportingDriverId, dto.reason);
  }
}