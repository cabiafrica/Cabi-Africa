/**
 * Mock client for fetching data from the Ride Service.
 */
export class RideServiceClient {
  /**
   * Fetches the total number of completed trips for a specific user.
   */
  async getCompletedTripsForUser(userId: string): Promise<number> {
    console.log(`Fetching completed trips for user ${userId} from Ride Service...`);
    await new Promise(resolve => setTimeout(resolve, 50));
    // Mocked data
    return userId === 'user-1' ? 25 : 5;
  }
}