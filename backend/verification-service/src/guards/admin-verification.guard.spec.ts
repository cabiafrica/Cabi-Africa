import * as crypto from 'crypto';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminVerificationGuard } from './admin-verification.guard';

function signHs256(payload: Record<string, unknown>, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function makeCtx(headers: Record<string, string>) {
  const req: any = { headers };
  return {
    req,
    ctx: {
      switchToHttp: () => ({ getRequest: () => req }),
    } as any,
  };
}

describe('AdminVerificationGuard (P0 AuthZ Bypass Prevention)', () => {
  const guard = new AdminVerificationGuard();
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      JWT_SECRET: 'unit-test-jwt-secret',
      ADMIN_VERIFICATION_API_KEY: 'unit-test-admin-key',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('rejects forged Bearer token even when X-Admin-MFA-Token is supplied', () => {
    const { ctx } = makeCtx({
      authorization: 'Bearer forged.jwt.token',
      'x-admin-mfa-token': 'arbitrary-bypass',
      'x-admin-security-key': 'unit-test-admin-key',
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects valid non-admin JWT (DRIVER/PASSENGER)', () => {
    const token = signHs256({ sub: 'u1', role: 'DRIVER', exp: Math.floor(Date.now() / 1000) + 300 }, 'unit-test-jwt-secret');
    const { ctx } = makeCtx({
      authorization: `Bearer ${token}`,
      'x-admin-security-key': 'unit-test-admin-key',
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('rejects valid admin JWT when X-Admin-Security-Key is wrong (no MFA header bypass)', () => {
    const token = signHs256({ sub: 'a1', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) + 300 }, 'unit-test-jwt-secret');
    const { ctx } = makeCtx({
      authorization: `Bearer ${token}`,
      'x-admin-mfa-token': 'arbitrary-bypass',
      'x-admin-security-key': 'wrong-key',
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('rejects expired admin JWT', () => {
    const token = signHs256({ sub: 'a1', role: 'SUPER_ADMIN', exp: Math.floor(Date.now() / 1000) - 10 }, 'unit-test-jwt-secret');
    const { ctx } = makeCtx({
      authorization: `Bearer ${token}`,
      'x-admin-security-key': 'unit-test-admin-key',
    });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('allows valid signed ADMIN JWT with matching X-Admin-Security-Key', () => {
    const token = signHs256({ sub: 'a1', role: 'SUPER_ADMIN', exp: Math.floor(Date.now() / 1000) + 300 }, 'unit-test-jwt-secret');
    const { ctx, req } = makeCtx({
      authorization: `Bearer ${token}`,
      'x-admin-security-key': 'unit-test-admin-key',
    });
    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.user.sub).toBe('a1');
  });
});
