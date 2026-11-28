import { applyCorsHeaders, signUserToken } from '../../lib/serverAuth';
import accountHandler from '../../pages/api/corporate/account';
import walletHandler from '../../pages/api/corporate/wallet';
import membersHandler from '../../pages/api/corporate/members';
import policyHandler from '../../pages/api/corporate/policy';
import overviewHandler from '../../pages/api/corporate/overview';
import ridesHandler from '../../pages/api/corporate/rides';

function createMockRes() {
  const headers: Record<string, string> = {};
  const res: any = {
    headers,
    setHeader: jest.fn((k: string, v: string) => {
      headers[k] = v;
    }),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
}

describe('CORS Allowlist Enforcement (serverAuth)', () => {
  it('reflects allowlisted Cabi Africa origin and sets Vary: Origin', () => {
    const req: any = { method: 'GET', headers: { origin: 'https://admin.cabi.africa' } };
    const res = createMockRes();
    const handled = applyCorsHeaders(req, res, 'GET, OPTIONS');
    expect(handled).toBe(false);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://admin.cabi.africa');
    expect(res.headers['Vary']).toBe('Origin');
  });

  it('does not set Access-Control-Allow-Origin for untrusted origins', () => {
    const req: any = { method: 'GET', headers: { origin: 'https://evil-attacker.example' } };
    const res = createMockRes();
    applyCorsHeaders(req, res, 'GET, OPTIONS');
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(res.headers['Vary']).toBe('Origin');
  });

  it('short-circuits preflight OPTIONS with 200', () => {
    const req: any = { method: 'OPTIONS', headers: { origin: 'https://cabi.africa' } };
    const res = createMockRes();
    const handled = applyCorsHeaders(req, res, 'POST, OPTIONS');
    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('Corporate API Routes Require Authentication', () => {
  const endpoints = [
    ['account', accountHandler, 'GET'],
    ['wallet', walletHandler, 'GET'],
    ['members', membersHandler, 'GET'],
    ['policy', policyHandler, 'GET'],
    ['overview', overviewHandler, 'GET'],
    ['rides', ridesHandler, 'GET'],
  ] as const;

  it.each(endpoints)('rejects unauthenticated %s with 401', async (_name, handler, method) => {
    const req: any = { method, headers: {}, query: {} };
    const res = createMockRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('allows authenticated caller to access overview', async () => {
    const token = signUserToken({ sub: 'corp-user-1', role: 'ADMIN' });
    const req: any = {
      method: 'GET',
      headers: { authorization: `Bearer ${token}` },
      query: { orgId: 'corp-nexus-tech-01' },
    };
    const res = createMockRes();
    await overviewHandler(req, res);
    expect(res.status).not.toHaveBeenCalledWith(401);
  });
});
