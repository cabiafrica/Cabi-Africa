import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationService } from '@cabi/backend/notification-service';
import { IncentiveService } from '../incentive/incentive.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // In a real app, this would be properly injected via NestJS DI
  private readonly notificationService = new NotificationService();
  // In a real app, this would be properly injected via NestJS DI.
  // For simulation, we'll instantiate it.
  private readonly incentiveService = new IncentiveService();

  // Mock data store for payment methods. In a real app, this would be a database table.
  private paymentMethods = [
    { id: 'pm_1', userId: 'user-passenger-123', brand: 'Visa', last4: '4242', isDefault: true },
    { id: 'pm_2', userId: 'user-passenger-123', brand: 'Mastercard', last4: '5555', isDefault: false },
    { id: 'pm_3', userId: 'user-passenger-456', brand: 'Visa', last4: '1111', isDefault: true },
  ];

  getHello(): string {
    return 'Hello World!';
  }

  async createCharge(userId: string, amount: number): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Attempting to charge user ${userId} for base amount ${amount}`);

    let finalAmount = amount;
    let discountApplied = 0;

    // Check for and apply any active promo codes for this user
    const appliedPromo = this.incentiveService.getAppliedDiscount(userId);
    if (appliedPromo) {
      if (appliedPromo.discountType === 'percentage') {
        discountApplied = (amount * appliedPromo.value) / 100;
      } else { // 'fixed'
        discountApplied = appliedPromo.value;
      }
      finalAmount = Math.max(0, amount - discountApplied); // Ensure fare doesn't go below zero
      this.logger.log(`Applied promo code ${appliedPromo.code}. Discount: ${discountApplied.toFixed(2)}. Final amount: ${finalAmount.toFixed(2)}`);
    }

    // In a real app, this would:
    // 1. Fetch the user's payment gateway customer ID from the database.
    // 2. Use the payment gateway's API (e.g., Stripe) to create a charge against the customer's default payment method.

    // Simulate a successful payment for now.
    const paymentSucceeded = true;

    if (paymentSucceeded) {
      this.logger.log(`Successfully charged user ${userId} for ${finalAmount.toFixed(2)}.`);
      return { success: true, message: 'Payment successful' };
    } else {
      this.logger.error(`Payment failed for user ${userId} for amount ${finalAmount.toFixed(2)}.`);
      return { success: false, message: 'Payment failed. Please update your payment method.' };
    }
  }

  deletePaymentMethod(userId: string, methodId: string) {
    this.logger.log(`Attempting to delete payment method ${methodId} for user ${userId}`);
    const methodIndex = this.paymentMethods.findIndex(m => m.id === methodId && m.userId === userId);

    if (methodIndex === -1) {
      throw new NotFoundException(`Payment method ${methodId} not found for user ${userId}.`);
    }

    if (this.paymentMethods[methodIndex].isDefault) {
      throw new ForbiddenException('Cannot delete the default payment method. Please set another card as default first.');
    }

    this.paymentMethods.splice(methodIndex, 1);
    this.logger.log(`Successfully deleted payment method ${methodId}.`);
    return { success: true };
  }

  setDefaultPaymentMethod(userId: string, methodId: string) {
    this.logger.log(`Setting payment method ${methodId} as default for user ${userId}`);
    const userMethods = this.paymentMethods.filter(m => m.userId === userId);
    const targetMethod = userMethods.find(m => m.id === methodId);

    if (!targetMethod) {
      throw new NotFoundException(`Payment method ${methodId} not found for user ${userId}.`);
    }

    // Set all of this user's methods to not be default
    userMethods.forEach(m => m.isDefault = false);

    // Set the target one as default
    targetMethod.isDefault = true;

    this.logger.log(`Successfully set ${methodId} as default.`);
    return this.paymentMethods.filter(m => m.userId === userId);
  }

  async addTip(userId: string, rideId: string, tipAmount: number) {
    this.logger.log(`Attempting to add tip of ${tipAmount} to ride ${rideId} for user ${userId}`);

    if (tipAmount <= 0) {
      this.logger.log('Tip amount is zero or less, no transaction needed.');
      return { success: true, message: 'No tip added.' };
    }

    // In a real app, you would find the original ride to get the driverId.
    const mockDriverId = 'driver-abc';

    // Create a separate charge for the tip.
    const chargeResult = await this.createCharge(userId, tipAmount);

    if (chargeResult.success) {
      this.logger.log(`Successfully processed tip for ride ${rideId}.`);
      this.notificationService.sendNotification({
        userId: mockDriverId,
        title: 'You received a tip!',
        body: `A passenger added a tip of $${tipAmount.toFixed(2)} for a recent ride.`,
      });
    }

    return chargeResult;
  }
}