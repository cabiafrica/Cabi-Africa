import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN', 'VERIFICATION_ADMIN', 'OPS_ADMIN']);

/**
 * Guard protecting administrative endpoints in the Verification Service.
 * Cryptographically verifies the Authorization Bearer JWT (HS256 + exp + admin role)
 * and enforces a timing-safe X-Admin-Security-Key check when configured (fail-closed in prod/staging).
 */
@Injectable()
export class AdminVerificationGuard implements CanActivate {
  private verifyJwt(token: string, secret: string): Record<string, unknown> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Malformed bearer token.');
    }

    const [headerB64, payloadB64, sigB64] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    const providedBuf = Buffer.from(sigB64, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
      throw new UnauthorizedException('Invalid bearer token signature.');
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Invalid bearer token payload.');
    }

    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Bearer token expired.');
    }

    return payload;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = (request.headers?.authorization as string) || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin bearer token required.');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new ForbiddenException('Server authentication secret is not configured.');
    }

    const token = authHeader.slice(7).trim();
    const payload = this.verifyJwt(token, jwtSecret);
    const role = String(payload.role || '').toUpperCase();
    if (!ADMIN_ROLES.has(role)) {
      throw new ForbiddenException('Admin role required for verification endpoints.');
    }

    const expectedKey = process.env.ADMIN_VERIFICATION_API_KEY || process.env.ADMIN_SECURITY_SIGNING_KEY;
    const providedKey = (request.headers?.['x-admin-security-key'] as string) || '';
    const env = (process.env.NODE_ENV || '').toLowerCase();

    if (expectedKey) {
      const providedBuf = Buffer.from(providedKey, 'utf8');
      const expectedBuf = Buffer.from(expectedKey, 'utf8');
      const keyValid =
        providedBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(providedBuf, expectedBuf);

      if (!keyValid) {
        throw new ForbiddenException('Valid X-Admin-Security-Key clearance required.');
      }
    } else if (env === 'production' || env === 'staging') {
      throw new ForbiddenException('ADMIN_VERIFICATION_API_KEY must be configured in production/staging.');
    }

    request.user = payload;
    return true;
  }
}
