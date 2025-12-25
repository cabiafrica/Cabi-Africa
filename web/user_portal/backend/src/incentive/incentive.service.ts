import { Injectable, Logger } from '@nestjs/common';
import { UserService } from './user.service'; // Assuming relative path for mock
import { User } from './user.model';

@Injectable()
export class IncentiveService {
  private readonly logger = new Logger(IncentiveService.name);

  // Mocking constructor injection
  private readonly userService: UserService = new UserService();

  /**
   * Checks if a driver is on vacation on a given date.
   * @param driver The driver's user object.
   * @param date The date to check.
   * @returns True if the driver is on vacation, false otherwise.
   */
  private isDriverOnVacation(driver: User, date: Date): boolean {
    if (!driver.vacationStartDate || !driver.vacationEndDate) {
      return false;
    }
    // Normalize dates to ignore time component
    const checkDate = new Date(date.toDateString());
    const startDate = new Date(driver.vacationStartDate.toDateString());
    const endDate = new Date(driver.vacationEndDate.toDateString());

    return checkDate >= startDate && checkDate <= endDate;
  }

  async calculateIncentiveEligibility(driverId: string): Promise<void> {
    const driver = await this.userService.findById(driverId);

    if (driver && this.isDriverOnVacation(driver, new Date())) {
      this.logger.log(`Driver ${driverId} is on vacation. Skipping incentive calculations.`);
      return; // Exit early, do not penalize
    }

    this.logger.log(`Calculating incentive eligibility for driver ${driverId}.`);
    // ... original incentive calculation logic would go here ...
  }
}