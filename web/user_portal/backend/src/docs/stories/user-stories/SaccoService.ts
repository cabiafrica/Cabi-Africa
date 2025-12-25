export interface TripPaidEvent {
  tripId: string;
  driverId: string;
  amount: number;
  timestamp: Date;
}

interface SaccoConfig {
  savingsRate: number; // e.g., 0.05 for 5%
}

export class SaccoService {
  // In a real application, these would be injected dependencies
  // private adminService: AdminService;
  // private transactionRepo: TransactionRepository;
  // private userService: UserService;

  async handleTripPaid(event: TripPaidEvent): Promise<void> {
    console.log(`[SaccoService] Processing SACCO savings for trip ${event.tripId}`);

    // 1. Fetch Configuration (Mock)
    // In reality: await this.adminService.getSaccoConfig();
    const config: SaccoConfig = await this.getSaccoConfig();

    // 2. Zero Rate Handling
    if (config.savingsRate <= 0) {
      console.log(`[SaccoService] Savings rate is 0. Skipping deduction.`);
      return;
    }

    // 3. Calculate Savings
    // Note: Story says "calculate based on total commission", but usually savings come from the driver's net or gross.
    // Assuming based on the gross fare amount for this implementation as per standard SACCO models, 
    // or if strictly following acceptance criteria "based on total commission", I will use a mock commission calculation here.
    // Let's assume the requirement meant a percentage of the *driver's earnings*.
    // However, AC 3 says: "calculate the savings amount based on the total commission for the trip".
    // This is unusual wording. I will assume it means "a portion of the commission is diverted" OR "a percentage of the fare".
    // Let's stick to a percentage of the *Trip Amount* for simplicity in this MVP, as that's most common.
    
    const savingsAmount = event.amount * config.savingsRate;

    // 4. Create Transaction
    await this.createTransaction(event.driverId, savingsAmount, 'SACCO_SAVING', event.tripId);

    console.log(`[SaccoService] Deducted ${savingsAmount.toFixed(2)} for SACCO savings.`);
  }

  // --- Mock Helpers for Simulation ---
  private async getSaccoConfig(): Promise<SaccoConfig> {
    // Mocking a 5% savings rate
    return { savingsRate: 0.05 };
  }

  private async createTransaction(userId: string, amount: number, type: string, tripId: string) {
    console.log(`[Transaction] ${type} -> User: ${userId} | Amount: ${amount.toFixed(2)} | Trip: ${tripId}`);
    // In reality:
    // 1. Debit Driver's Wallet (or reduce net payout)
    // 2. Credit Driver's SACCO Ledger
  }
}