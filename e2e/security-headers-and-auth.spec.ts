import { test, expect } from '@playwright/test';

const PORTAL_URL = process.env.E2E_PORTAL_URL || 'http://localhost:3000';

test.describe('Phase 2 Security Headers & API AuthZ E2E', () => {
  test('home page returns hardened security headers', async ({ request }) => {
    const res = await request.get(PORTAL_URL);
    expect(res.status()).toBeLessThan(400);

    const headers = res.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toMatch(/^(SAMEORIGIN|DENY)$/i);
    expect(headers['referrer-policy']).toBeTruthy();
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['permissions-policy']).toBeTruthy();
  });

  test('unauthenticated callers are blocked from admin vehicle claims endpoints', async ({ request }) => {
    const listRes = await request.get(`${PORTAL_URL}/api/admin/vehicles/claims`);
    expect(listRes.status()).toBe(401);

    const reviewRes = await request.post(`${PORTAL_URL}/api/admin/vehicles/claims/fake-id/review`, {
      data: { status: 'APPROVED', adminId: 'spoofed' },
    });
    expect(reviewRes.status()).toBe(401);
  });

  test('unauthenticated callers are blocked from corporate financial endpoints', async ({ request }) => {
    for (const path of ['account', 'wallet', 'members', 'policy', 'overview', 'rides']) {
      const res = await request.get(`${PORTAL_URL}/api/corporate/${path}`);
      expect(res.status(), `/api/corporate/${path} must require auth`).toBe(401);
    }
  });

  test('auth APIs do not reflect untrusted CORS origins', async ({ request }) => {
    const res = await request.get(`${PORTAL_URL}/api/auth/me`, {
      headers: { Origin: 'https://evil-attacker.example' },
    });
    expect(res.status()).toBe(401);
    const acao = res.headers()['access-control-allow-origin'];
    expect(acao).not.toBe('*');
    expect(acao).not.toBe('https://evil-attacker.example');
  });
});
