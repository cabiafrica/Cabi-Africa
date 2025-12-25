import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService, User } from '@cabi/backend/user-service';
import { NotificationService } from '@cabi/backend/notification-service';
import { randomBytes, createHash } from 'crypto';

// Mock database for password reset tokens
const mockResetTokens = new Map<string, { userId: string; expires: Date }>();

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  async forgotPassword(email: string): Promise<{ message: string }> {
    // In a real app, you'd look up the user by email. We'll simulate this.
    console.log(`Password reset requested for email: ${email}`);
    const user: User | undefined = this.userService.findByEmail(email); // Assuming findByEmail exists

    if (!user) {
      // We don't want to reveal if an email exists or not for security reasons.
      // We'll log it but return a generic success message.
      console.log(`Password reset attempted for non-existent email: ${email}`);
      return { message: 'If an account with this email exists, a reset link has been sent.' };
    }

    const token = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour expiry

    mockResetTokens.set(hashedToken, { userId: user.id, expires });

    const resetLink = `http://localhost:4200/reset-password?token=${token}`;
    this.notificationService.sendPasswordResetEmail(email, resetLink);

    return { message: 'If an account with this email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const hashedToken = createHash('sha256').update(token).digest('hex');
    const tokenData = mockResetTokens.get(hashedToken);

    if (!tokenData || tokenData.expires < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    // In a real app, you would hash the new password and update the user's record.
    console.log(`Password for user ${tokenData.userId} has been reset.`);
    mockResetTokens.delete(hashedToken); // Invalidate the token

    return { message: 'Your password has been successfully reset.' };
  }
}