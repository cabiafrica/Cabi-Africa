import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '@cabi/backend/user-service'; // Mocking import

interface Rating {
  tripId: string;
  driverId: string;
  passengerId: string;
  stars: number;
  review?: string;
}

@Injectable()
export class RatingService {
  private readonly logger = new Logger(RatingService.name);
  private readonly userService = new UserService(); // Mocking injection

  // Mock data store
  private ratings: Rating[] = [];

  async create(ratingData: Omit<Rating, 'passengerId'>, passengerId: string): Promise<Rating> {
    const newRating: Rating = { ...ratingData, passengerId };
    this.ratings.push(newRating);
    this.logger.log(`New rating submitted for driver ${newRating.driverId}: ${newRating.stars} stars.`);

    // In a real app, this would be a more complex calculation
    await this.updateDriverAverageRating(newRating.driverId);

    return newRating;
  }

  private async updateDriverAverageRating(driverId: string) {
    const driverRatings = this.ratings.filter(r => r.driverId === driverId);
    const totalStars = driverRatings.reduce((sum, r) => sum + r.stars, 0);
    const averageRating = totalStars / driverRatings.length;

    this.logger.log(`Updating average rating for driver ${driverId} to ${averageRating.toFixed(2)}.`);
    // In a real app, this would call a method on the UserService, like:
    // await this.userService.updateAverageRating(driverId, averageRating);
  }
}