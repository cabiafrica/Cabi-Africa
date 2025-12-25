export type BadgeRule = {
  badgeId: string;
  criteria: {
    minRating?: number;
    minCompletedTrips?: number;
    minTotalEarnings?: number;
  };
};

/**
 * Mock client for fetching configurations from the Admin Service.
 */
export class AdminServiceClient {
  /**
   * Fetches the definitions and rules for all available badges.
   */
  async getBadgeDefinitions(): Promise<BadgeRule[]> {
    console.log('Fetching badge definitions from Admin Service...');
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
      {
        badgeId: 'EARNING_BADGE',
        criteria: {
          minRating: 4.5,
          minCompletedTrips: 10,
        },
      },
    ];
  }
}