import { Injectable, Logger, NotFoundException } from '@nestjs/common';

interface Story {
  id: string;
  driverId: string;
  contentUrl: string;
  contentType: 'image' | 'video';
  createdAt: Date;
}

interface StoryReport {
  reportId: string;
  storyId: string;
  reportingDriverId: string;
  reason: string;
  reportedAt: Date;
}

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);
  private stories: Story[] = [];
  private reports: StoryReport[] = [];

  async createStory(driverId: string, contentUrl: string, contentType: 'image' | 'video'): Promise<Story> {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      driverId,
      contentUrl,
      contentType,
      createdAt: new Date(),
    };
    this.stories.push(newStory);
    this.logger.log(`New story created for driver ${driverId}.`);
    return newStory;
  }

  async getStoryFeed(): Promise<Story[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // Return stories from the last 24 hours
    return this.stories.filter(story => story.createdAt > twentyFourHoursAgo);
  }

  async reportStory(storyId: string, reportingDriverId: string, reason: string): Promise<void> {
    if (!this.stories.find(s => s.id === storyId)) {
      throw new NotFoundException(`Story with ID ${storyId} not found.`);
    }
    const newReport: StoryReport = {
      reportId: `report-${Date.now()}`,
      storyId,
      reportingDriverId,
      reason,
      reportedAt: new Date(),
    };
    this.reports.push(newReport);
    this.logger.warn(`Story ${storyId} reported by driver ${reportingDriverId} for reason: ${reason}`);
  }
}