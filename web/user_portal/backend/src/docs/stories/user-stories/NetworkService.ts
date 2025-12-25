export interface NetworkStats {
  tier1Count: number;
  tier2Count: number;
  totalEarnings: number;
  recentTransactions: TransactionSummary[];
}

interface TransactionSummary {
  id: string;
  amount: number;
  type: string;
  date: Date;
}

export class NetworkService {
  // In a real application, these would be injected dependencies
  // private userService: UserService;
  // private transactionRepo: TransactionRepository;

  async getNetworkStats(userId: string): Promise<NetworkStats> {
    console.log(`[NetworkService] Fetching network stats for user ${userId}`);

    // 1. Count Referrals (Mock)
    // In reality: await this.userService.countReferrals(userId, tier);
    const tier1Count = await this.mockCountReferrals(userId, 1);
    const tier2Count = await this.mockCountReferrals(userId, 2);

    // 2. Aggregate Earnings (Mock)
    // In reality: await this.transactionRepo.sumEarnings(userId);
    const totalEarnings = await this.mockSumEarnings(userId);

    // 3. Fetch Recent Transactions (Mock)
    // In reality: await this.transactionRepo.getRecent(userId, 10);
    const recentTransactions = await this.mockGetRecentTransactions(userId);

    return {
      tier1Count,
      tier2Count,
      totalEarnings,
      recentTransactions,
    };
  }

  // --- Mock Helpers for Simulation ---
  private async mockCountReferrals(userId: string, tier: number): Promise<number> {
    // Simulate different counts based on tier
    return tier === 1 ? 12 : 45;
  }

  private async mockSumEarnings(userId: string): Promise<number> {
    return 15400.50; // KES
  }

  private async mockGetRecentTransactions(userId: string): Promise<TransactionSummary[]> {
    return [
      { id: 'tx_1', amount: 150.00, type: 'COMMISSION_TIER_1', date: new Date() },
      { id: 'tx_2', amount: 45.50, type: 'COMMISSION_TIER_2', date: new Date() },
      { id: 'tx_3', amount: 200.00, type: 'COMMISSION_TIER_1', date: new Date() },
      { id: 'tx_4', amount: 500.00, type: 'DRIVER_EARNING', date: new Date() },
      { id: 'tx_5', amount: -50.00, type: 'SACCO_SAVING', date: new Date() },
    ];
  }
}