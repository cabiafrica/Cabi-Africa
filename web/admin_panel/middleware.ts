import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Assuming 'jose' for JWT verification

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

// Define paths that are restricted for read-only users.
// This includes all API routes that perform mutations and specific UI pages.
const writeAccessPaths = [
  '/api/settings',
  '/api/finance/adjustments',
  '/settings',
  '/settings/users',
  '/finance/adjustments',
];

interface UserPayload {
  role: 'ADMIN' | 'READ_ONLY';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Allow public assets and auth pages to be accessed
  if (pathname.startsWith('/_next') || pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY) as { payload: UserPayload };
    const userRole = payload.role;

    const isWriteRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method);
    const isRestrictedPath = writeAccessPaths.some(path => pathname.startsWith(path));

    if (userRole === 'READ_ONLY' && (isWriteRequest || isRestrictedPath)) {
      // For API requests, return a JSON error. For page requests, redirect.
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Permission Denied: Read-only access.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  } catch (err) {
    console.error('Middleware auth error:', err);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}