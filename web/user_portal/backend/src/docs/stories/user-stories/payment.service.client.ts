/**
 * Mock client for fetching data from the Payment Service.
 */
export class PaymentServiceClient {
  /**
   * Fetches the total lifetime earnings for a specific user.
   */
  async getTotalEarningsForUser(userId: string): Promise<number> {
    console.log(`Fetching total earnings for user ${userId} from Payment Service...`);
    await new Promise(resolve => setTimeout(resolve, 50));
    // Mocked data
    return userId === 'user-1' ? 5000 : 500;
  }
}