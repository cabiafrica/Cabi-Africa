import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  async getDriverPerformanceForAdmin(driverId: string): Promise<any> {
    this.logger.log(`Fetching performance data for driver ${driverId} for admin view.`);

    // In a real app, this data would be aggregated from various sources.
    // For this story, we return mock data.
    return {
      averageRating: 4.8,
      acceptanceRate: 92, // percentage
      cancellationRate: 3, // percentage
      ratingTrend: [4.7, 4.75, 4.8, 4.82], // last 4 weeks
      automatedFeedback: [
        { date: '2024-08-10', message: 'Great work this week! Your 5-star rating percentage was 95%.' },
        { date: '2024-08-03', message: 'A reminder to confirm trips quickly to improve your acceptance rate.' },
      ],
    };
  }
}