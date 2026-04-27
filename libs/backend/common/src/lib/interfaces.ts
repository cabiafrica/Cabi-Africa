export interface SmsProvider {
  sendSms(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendOtp(to: string, otp: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface PaymentProvider {
  processPayment(userId: string, amount: number, currency: string, metadata?: any): Promise<{ success: boolean; transactionId?: string; error?: string }>;
  getPaymentStatus(transactionId: string): Promise<{ status: 'PENDING' | 'COMPLETED' | 'FAILED'; amount: number }>;
}

export interface StorageProvider {
  uploadFile(file: any, path: string): Promise<{ url: string }>;
  deleteFile(url: string): Promise<void>;
}

export interface EmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
