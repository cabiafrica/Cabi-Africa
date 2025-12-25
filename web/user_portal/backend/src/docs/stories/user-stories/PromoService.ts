export interface TripPaidEvent {
  tripId: string;
  driverId: string;
  passengerId: string; // Added for Story 2.6
  amount: number;
  timestamp: Date;
}

interface PromoConfig {
  isActive: boolean;
  upline1Split: number;
  upline2Split: number;
  requiredBadge: string;
}

interface UserProfile {
  userId: string;
  upline1Id?: string;
  upline2Id?: string;
  badges: string[];
}

export class PromoService {
  // In a real application, these would be injected dependencies
  // private adminService: AdminService;
  // private userService: UserService;
  // private transactionRepo: TransactionRepository;

  async handleTripPaid(event: TripPaidEvent): Promise<void> {
    console.log(`[PromoService] Processing promotional split for trip ${event.tripId}`);

    // 1. Check Promotion Status & Config (Mock)
    // In reality: await this.adminService.getPromoConfig();
    const config: PromoConfig = await this.getPromoConfig();

    if (!config.isActive) {
      console.log(`[PromoService] Promotion is not active. Skipping.`);
      return;
    }

    // 2. Fetch Passenger's Upline & Badges (Mock)
    // In reality: await this.userService.getUserProfile(event.passengerId);
    // Note: We are looking at the PASSENGER'S upline here, not the driver's.
    const passengerProfile = await this.getUserProfile(event.passengerId);
    const upline1 = passengerProfile.upline1Id ? await this.getUserProfile(passengerProfile.upline1Id) : null;
    const upline2 = passengerProfile.upline2Id ? await this.getUserProfile(passengerProfile.upline2Id) : null;

    // 3. Calculate Amounts
    // Assuming the promo split is a percentage of the total fare
    const upline1Share = event.amount * config.upline1Split;
    const upline2Share = event.amount * config.upline2Split;

    // 4. Conditional Distribution Logic
    // Upline 1 Check
    if (upline1 && this.hasRequiredBadge(upline1, config.requiredBadge)) {
      await this.createTransaction(upline1.userId, upline1Share, 'COMMISSION_PROMO_PASSENGER', event.tripId);
    } else {
      console.log(`[PromoService] Upline 1 (${upline1?.userId}) disqualified or missing. Reverting share to System.`);
      await this.createTransaction('SYSTEM_ACCOUNT', upline1Share, 'COMMISSION_PROMO_REVERT', event.tripId);
    }

    // Upline 2 Check
    if (upline2 && this.hasRequiredBadge(upline2, config.requiredBadge)) {
      await this.createTransaction(upline2.userId, upline2Share, 'COMMISSION_PROMO_PASSENGER', event.tripId);
    } else {
      console.log(`[PromoService] Upline 2 (${upline2?.userId}) disqualified or missing. Reverting share to System.`);
      await this.createTransaction('SYSTEM_ACCOUNT', upline2Share, 'COMMISSION_PROMO_REVERT', event.tripId);
    }

    console.log(`[PromoService] Promo distribution complete for trip ${event.tripId}`);
  }

  private hasRequiredBadge(user: UserProfile, requiredBadge: string): boolean {
    return user.badges.includes(requiredBadge);
  }

  // --- Mock Helpers for Simulation ---
  private async getPromoConfig(): Promise<PromoConfig> {
    return { 
      isActive: true, 
      upline1Split: 0.05, // 5% of fare
      upline2Split: 0.02, // 2% of fare
      requiredBadge: 'PROMO_QUALIFIED' 
    };
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    // Mocking a profile. In reality, this would fetch from DB.
    return { userId, upline1Id: 'upline_A', upline2Id: 'upline_B', badges: ['PROMO_QUALIFIED'] };
  }

  private async createTransaction(userId: string, amount: number, type: string, tripId: string) {
    console.log(`[Transaction] ${type} -> User: ${userId} | Amount: ${amount.toFixed(2)} | Trip: ${tripId}`);
  }
}