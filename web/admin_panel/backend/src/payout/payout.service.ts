import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PayoutDto, PayoutStatus } from '@cabi/shared/interfaces';

// Mock in-memory database for payouts
export const mockPayouts: PayoutDto[] = [
  { id: 'payout-1', driverId: 'driver-123', driverName: 'John Doe', amount: 150.75, currency: 'KES', status: 'Pending', requestedAt: '2024-08-20T10:00:00Z', paymentMethod: 'M-Pesa' },
  { id: 'payout-2', driverId: 'driver-456', driverName: 'Jane Smith', amount: 230.00, currency: 'KES', status: 'Pending', requestedAt: '2024-08-20T11:30:00Z', paymentMethod: 'Bank Transfer' },
  { id: 'payout-3', driverId: 'driver-123', driverName: 'John Doe', amount: 100.00, currency: 'KES', status: 'Paid', requestedAt: '2024-08-15T09:00:00Z', processedAt: '2024-08-15T10:00:00Z', paymentMethod: 'M-Pesa' },
  { id: 'payout-4', driverId: 'driver-789', driverName: 'Peter Jones', amount: 50.20, currency: 'KES', status: 'Pending', requestedAt: '2024-08-21T08:00:00Z', paymentMethod: 'M-Pesa' },
];

// Mock available balance. In a real app, this would come from an EarningsService.
export const mockAvailableBalances = {
  'driver-123': 250.0,
  'driver-456': 50.0,
};

@Injectable()
export class PayoutService {
  async findAll(
    status?: PayoutStatus,
    search?: string,
    sortBy: 'driverName' | 'amount' | 'requestedAt' = 'requestedAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page = 1,
    limit = 10,
  ): Promise<{ data: PayoutDto[]; total: number }> {
    let results = [...mockPayouts]; // Create a copy to avoid mutation

    // 1. Filter by status
    if (status) {
      results = results.filter(p => p.status === status);
    }

    // 2. Filter by search term
    if (search) {
      const lowercasedSearch = search.toLowerCase();
      results = results.filter(p =>
        p.driverName.toLowerCase().includes(lowercasedSearch) ||
        p.driverId.toLowerCase().includes(lowercasedSearch)
      );
    }

    // 3. Sort
    results.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      const order = sortOrder === 'asc' ? 1 : -1;

      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });

    // 4. Paginate
    const total = results.length;
    const paginatedResults = results.slice((page - 1) * limit, page * limit);

    return { data: paginatedResults, total };
  }

  async markAsPaid(payoutId: string, adminId: string): Promise<PayoutDto> {
    const payout = mockPayouts.find(p => p.id === payoutId);

    if (!payout) {
      throw new NotFoundException(`Payout with ID ${payoutId} not found.`);
    }

    if (payout.status === 'Paid') {
      return payout; // Already paid, no action needed
    }

    payout.status = 'Paid';
    payout.processedAt = new Date().toISOString();
    console.log(`Admin ${adminId} marked payout ${payoutId} as Paid.`);
    return payout;
  }

  async requestPayout(driverId: string, amount: number, paymentMethod: string): Promise<PayoutDto> {
    // In a real app, you would:
    // 1. Verify the driver's available balance from the earnings ledger.
    // 2. Lock the balance to prevent double-spending.
    // 3. Create the payout record in a database transaction.

    const availableBalance = mockAvailableBalances[driverId] || 0;
    if (amount <= 0 || amount > availableBalance) {
      throw new BadRequestException('Invalid payout amount or insufficient funds.');
    }

    const driverName = `Driver ${driverId}`; // Mock name lookup

    const newPayout: PayoutDto = {
      id: `payout-${mockPayouts.length + 1}`,
      driverId,
      driverName,
      amount,
      currency: 'KES',
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      paymentMethod,
    };

    mockPayouts.push(newPayout);
    // In a real app, you'd debit the balance in the EarningsService.
    mockAvailableBalances[driverId] -= amount;

    console.log(`Driver ${driverId} requested a payout of ${amount}.`);
    return newPayout;
  }
}