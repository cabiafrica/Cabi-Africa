import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates a JWT access token for a given user.
   * @param user The user object (or a subset of it) to create a token for.
   */
  async generateAccessToken(user: Pick<User, 'id' | 'email'>): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }

  /**
   * Generates a special, short-lived JWT for user impersonation.
   * @param userToImpersonate The user being impersonated.
   * @param adminId The ID of the admin performing the impersonation.
   * @returns A JWT string.
   */
  async generateImpersonationToken(userToImpersonate: Pick<User, 'id' | 'email'>, adminId: string): Promise<string> {
    const payload = {
      sub: userToImpersonate.id,
      email: userToImpersonate.email,
      impersonatorId: adminId, // Custom claim to identify the admin
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: '30m', // Impersonation tokens are short-lived
    });
  }
}