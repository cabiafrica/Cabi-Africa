import { SmsProvider, PaymentProvider, StorageProvider } from './interfaces';

export class MockSmsProvider implements SmsProvider {
  async sendSms(to: string, message: string) {
    console.log(`[Mock SMS] Sending to ${to}: ${message}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  async sendOtp(to: string, otp: string) {
    return this.sendSms(to, `Your Cabi verification code is: ${otp}`);
  }
}

export class MockPaymentProvider implements PaymentProvider {
  async processPayment(userId: string, amount: number, currency: string) {
    console.log(`[Mock Payment] Processing ${amount} ${currency} for user ${userId}`);
    return { success: true, transactionId: `tx_${Date.now()}` };
  }

  async getPaymentStatus(transactionId: string) {
    return { status: 'COMPLETED' as const, amount: 500 };
  }
}

export class MockStorageProvider implements StorageProvider {
  async uploadFile(file: any, path: string) {
    const mockUrl = `/uploads/mock_${Date.now()}_${file.name || 'document.pdf'}`;
    console.log(`[Mock Storage] Uploaded file to ${mockUrl}`);
    return { url: mockUrl };
  }

  async deleteFile(url: string) {
    console.log(`[Mock Storage] Deleted file at ${url}`);
  }
}
