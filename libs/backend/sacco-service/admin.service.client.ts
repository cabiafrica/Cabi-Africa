/**
 * A client for communicating with the Admin Service.
 */
export class AdminServiceClient {
  /**
   * Fetches the current Sacco savings rate.
   */
  async getSaccoConfig(): Promise<{ savingsRate: number }> {
    console.log('Fetching Sacco config from Admin Service...');
    await new Promise(resolve => setTimeout(resolve, 100));
    // Simulate a 5% savings rate on commission
    return { savingsRate: 0.05 };
  }

  /**
   * Fetches the total commission rate for a standard fare.
   * This is needed to calculate the base amount for the savings deduction.
   */
  async getFareCommissionConfig(): Promise<{ totalCommission: number }> {
    console.log('Fetching fare commission config from Admin Service...');
    await new Promise(resolve => setTimeout(resolve, 100));
    return { totalCommission: 0.2 }; // 20%
  }
}