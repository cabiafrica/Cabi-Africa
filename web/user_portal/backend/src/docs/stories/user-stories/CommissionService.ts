export interface TripPaidEvent {
  tripId: string;
  driverId: string;
  amount: number;
  timestamp: Date;
}

interface CommissionConfig {
  systemSplit: number;
  upline1Split: number;
  upline2Split: number;
}

interface UserProfile {
  userId: string;
  upline1Id?: string;
  upline2Id?: string;
  badges: string[];
}

export class CommissionService {
  // In a real application, these would be injected dependencies
  // private userService: UserService;
  // private adminService: AdminService;
  // private transactionRepo: TransactionRepository;

  async handleTripPaid(event: TripPaidEvent): Promise<void> {
    console.log(`[CommissionService] Processing commission for trip ${event.tripId}`);

    // 1. Fetch Configuration (Mock)
    // In reality: await this.adminService.getCommissionConfig();
    const config: CommissionConfig = await this.getCommissionConfig();

    // 2. Fetch Driver's Upline & Badges (Mock)
    // In reality: await this.userService.getUserProfile(event.driverId);
    const driverProfile = await this.getUserProfile(event.driverId);
    const upline1 = driverProfile.upline1Id ? await this.getUserProfile(driverProfile.upline1Id) : null;
    const upline2 = driverProfile.upline2Id ? await this.getUserProfile(driverProfile.upline2Id) : null;

    // 3. Calculate Amounts
    // Assuming a fixed 20% platform commission for this example
    const totalCommission = event.amount * 0.20; 
    const netDriverEarnings = event.amount - totalCommission;

    let systemShare = totalCommission * config.systemSplit;
    let upline1Share = totalCommission * config.upline1Split;
    let upline2Share = totalCommission * config.upline2Split;

    // 4. Conditional Distribution Logic
    // Upline 1 Check
    if (upline1 && this.hasEarningBadge(upline1)) {
      await this.createTransaction(upline1.userId, upline1Share, 'COMMISSION_TIER_1', event.tripId);
    } else {
      console.log(`[CommissionService] Upline 1 (${upline1?.userId}) disqualified or missing. Reverting share to System.`);
      systemShare += upline1Share;
    }

    // Upline 2 Check
    if (upline2 && this.hasEarningBadge(upline2)) {
      await this.createTransaction(upline2.userId, upline2Share, 'COMMISSION_TIER_2', event.tripId);
    } else {
      console.log(`[CommissionService] Upline 2 (${upline2?.userId}) disqualified or missing. Reverting share to System.`);
      systemShare += upline2Share;
    }

    // 5. Log Remaining Transactions
    await this.createTransaction('SYSTEM_ACCOUNT', systemShare, 'COMMISSION_SYSTEM', event.tripId);
    await this.createTransaction(event.driverId, netDriverEarnings, 'DRIVER_EARNING', event.tripId);

    console.log(`[CommissionService] Distribution complete for trip ${event.tripId}`);
  }

  private hasEarningBadge(user: UserProfile): boolean {
    return user.badges.includes('EARNING_QUALIFIED');
  }

  // --- Mock Helpers for Simulation ---
  private async getCommissionConfig(): Promise<CommissionConfig> {
    return { systemSplit: 0.4, upline1Split: 0.3, upline2Split: 0.3 };
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    return { userId, upline1Id: 'upline_1', upline2Id: 'upline_2', badges: ['EARNING_QUALIFIED'] };
  }

  private async createTransaction(userId: string, amount: number, type: string, tripId: string) {
    console.log(`[Transaction] ${type} -> User: ${userId} | Amount: ${amount.toFixed(2)} | Trip: ${tripId}`);
  }
}