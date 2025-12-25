import { middleware } from './middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  // TextEncoder is a global in modern Node/Jest environments, but we mock it for consistency
  TextEncoder: jest.fn().mockImplementation(() => ({
    encode: jest.fn().mockReturnValue(new Uint8Array()),
  })),
}));

// Helper to create a mock request
function createMockRequest(
  pathname: string,
  method: string = 'GET',
  token?: string,
): NextRequest {
  const url = `http://localhost${pathname}`;
  const request = new NextRequest(url, { method });
  if (token) {
    request.cookies.set('auth_token', token);
  }
  return request;
}

describe('Admin Portal Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET_KEY = 'test-secret';
  });

  it('should redirect to /login if no token is provided for a protected route', async () => {
    const request = createMockRequest('/settings/users');
    const response = await middleware(request);
    expect(response.status).toBe(307); // Default redirect status for NextResponse.redirect
    expect(response.headers.get('location')).toContain('/login');
  });

  it('should redirect to /login if token is invalid', async () => {
    (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));
    const request = createMockRequest('/settings/users', 'GET', 'invalid-token');
    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });

  it('should allow an ADMIN user to access a write-access UI page', async () => {
    (jwtVerify as jest.Mock).mockResolvedValue({ payload: { role: 'ADMIN' } });
    const request = createMockRequest('/settings/users', 'GET', 'admin-token');
    const response = await middleware(request);
    // NextResponse.next() returns a response with headers but no explicit status
    expect(response.status).toBe(200);
  });

  it('should redirect a READ_ONLY user from a write-access UI page', async () => {
    (jwtVerify as jest.Mock).mockResolvedValue({ payload: { role: 'READ_ONLY' } });
    const request = createMockRequest('/settings/users', 'GET', 'readonly-token');
    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/unauthorized');
  });

  it('should return 403 for a READ_ONLY user making a POST request to a protected API', async () => {
    (jwtVerify as jest.Mock).mockResolvedValue({ payload: { role: 'READ_ONLY' } });
    const request = createMockRequest('/api/users/some-id/role', 'POST', 'readonly-token');
    const response = await middleware(request);
    const body = await response.json();
    expect(response.status).toBe(403);
    expect(body.message).toBe('Permission Denied: Read-only access.');
  });

  it('should allow a READ_ONLY user to access a non-restricted API route (e.g., GET)', async () => {
    (jwtVerify as jest.Mock).mockResolvedValue({ payload: { role: 'READ_ONLY' } });
    // Assuming /api/drivers/search is not in writeAccessPaths
    const request = createMockRequest('/api/drivers/search?q=test', 'GET', 'readonly-token');
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });
});