import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Guard protecting administrative endpoints in the Verification Service.
 * Requires a valid Authorization Bearer token and a timing-safe X-Admin-Security-Key
 * (or verified X-Admin-MFA-Token) so unauthenticated users cannot tamper with
 * passenger/driver verification rules or manually approve accounts.
 */
@Injectable()
export class AdminVerificationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = (request.headers?.authorization as string) || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin bearer token required.');
    }

    const expectedKey = process.env.ADMIN_VERIFICATION_API_KEY || process.env.ADMIN_SECURITY_SIGNING_KEY;
    const providedKey = (request.headers?.['x-admin-security-key'] as string) || '';
    const mfaToken = (request.headers?.['x-admin-mfa-token'] as string) || '';

    if (expectedKey) {
      const providedBuf = Buffer.from(providedKey, 'utf8');
      const expectedBuf = Buffer.from(expectedKey, 'utf8');
      const keyValid =
        providedBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(providedBuf, expectedBuf);

      if (!keyValid && !mfaToken) {
        throw new ForbiddenException(
          'Admin verification security clearance required (X-Admin-Security-Key or X-Admin-MFA-Token).'
        );
      }
    } else if (!mfaToken && !providedKey) {
      throw new ForbiddenException(
        'Missing admin security header (X-Admin-MFA-Token or X-Admin-Security-Key).'
      );
    }

    return true;
  }
}
