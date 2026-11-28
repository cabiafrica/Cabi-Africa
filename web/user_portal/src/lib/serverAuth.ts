import type { NextApiRequest, NextApiResponse } from 'next';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedCaller {
    sub: string;
    id?: string;
    email?: string;
    role?: string;
    phone?: string;
}

export function getJwtSecret(): string {
    return (
        process.env.JWT_SECRET ||
        process.env.SUPABASE_JWT_SECRET ||
        (process.env.NODE_ENV !== 'production' ? 'dev-only-jwt-secret-do-not-use-in-prod-cabi' : '')
    );
}

export function signUserToken(payload: Partial<AuthenticatedCaller> & { sub: string }, expiresIn: string | number = '7d'): string {
    const secret = getJwtSecret();
    if (!secret) {
        throw new Error('JWT_SECRET is not configured.');
    }
    return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
}

export function verifyUserToken(token: string): AuthenticatedCaller | null {
    if (!token) return null;
    const secret = getJwtSecret();
    if (!secret) return null;

    try {
        const decoded = jwt.verify(token, secret) as any;
        if (!decoded || (!decoded.sub && !decoded.id)) return null;
        return {
            sub: String(decoded.sub || decoded.id),
            id: String(decoded.id || decoded.sub),
            email: decoded.email ? String(decoded.email) : undefined,
            role: decoded.role ? String(decoded.role) : undefined,
            phone: decoded.phone ? String(decoded.phone) : undefined,
        };
    } catch {
        return null;
    }
}

export function extractCallerUser(req: NextApiRequest): AuthenticatedCaller | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7).trim();
    return verifyUserToken(token);
}

export function requireAuth(req: NextApiRequest, res: NextApiResponse): AuthenticatedCaller | null {
    const caller = extractCallerUser(req);
    if (!caller) {
        res.status(401).json({ success: false, message: 'Authentication required. Please sign in to continue.' });
        return null;
    }
    return caller;
}

const DEFAULT_ALLOWED_ORIGINS = [
    'https://cabi.africa',
    'https://www.cabi.africa',
    'https://app.cabi.africa',
    'https://admin.cabi.africa',
    'https://dispatch.cabi.africa',
];

export function getAllowedOrigins(): string[] {
    const configured = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    const origins = configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
    if (process.env.NODE_ENV !== 'production') {
        return [
            ...origins,
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:5173',
        ];
    }
    return origins;
}

export function applyCorsHeaders(
    req: NextApiRequest,
    res: NextApiResponse,
    methods: string
): boolean {
    const origin = req.headers.origin;
    const allowed = getAllowedOrigins();
    res.setHeader('Vary', 'Origin');
    if (origin && allowed.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}

export function requireAdmin(req: NextApiRequest, res: NextApiResponse): AuthenticatedCaller | null {
    const caller = requireAuth(req, res);
    if (!caller) {
        return null;
    }
    const role = (caller.role || '').toUpperCase();
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        res.status(403).json({ success: false, message: 'Administrator privileges required.' });
        return null;
    }
    return caller;
}
