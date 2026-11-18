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
