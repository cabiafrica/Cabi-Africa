import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  sendPasswordResetEmail(email: string, resetLink: string): void {
    // In a real application, this would use an email provider (e.g., SendGrid, SES)
    console.log('--- Sending Password Reset Email ---');
    console.log(`To: ${email}`);
    console.log('Subject: Reset Your CABI Password');
    console.log(`Body: Please click the following link to reset your password: ${resetLink}`);
    console.log('------------------------------------');
  }
}