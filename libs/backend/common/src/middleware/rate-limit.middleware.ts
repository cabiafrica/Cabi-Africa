import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    private readonly clients: Map<string, RateLimitRecord> = new Map();
    private readonly MAX_CLIENTS = 10000;
    private lastCleanup = Date.now();

    private cleanupExpired(now: number) {
        if (now - this.lastCleanup < 60000 && this.clients.size < this.MAX_CLIENTS) {
            return;
        }
        this.lastCleanup = now;
        for (const [key, record] of this.clients.entries()) {
            if (now > record.resetTime) {
                this.clients.delete(key);
            }
        }
        // If still exceeds maximum, clear the oldest 20% to prevent OOM
        if (this.clients.size >= this.MAX_CLIENTS) {
            const keysToDelete = Array.from(this.clients.keys()).slice(0, Math.floor(this.MAX_CLIENTS * 0.2));
            for (const k of keysToDelete) {
                this.clients.delete(k);
            }
        }
    }

    use(req: Request, res: Response, next: NextFunction) {
        const now = Date.now();
        this.cleanupExpired(now);

        const forwarded = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
        const ip = forwarded || req.ip || req.socket.remoteAddress || 'unknown';

        // Stricter limits for authentication and sensitive financial/OTP endpoints
        const path = req.originalUrl || req.url || '';
        const isSensitiveRoute =
            path.includes('/auth/login') ||
            path.includes('/auth/register') ||
            path.includes('/auth/verify-otp') ||
            path.includes('/auth/forgot-password') ||
            path.includes('/auth/admin/initiate-login') ||
            path.includes('/forgot-email') ||
            path.includes('/stk-push');

        const limit = isSensitiveRoute ? 20 : 120; // 20 req/min for auth/finance, 120 req/min for standard
        const windowMs = 60000; // 1 minute
        const cacheKey = `${ip}:${isSensitiveRoute ? 'sensitive' : 'standard'}`;

        let client = this.clients.get(cacheKey);

        if (!client || now > client.resetTime) {
            client = { count: 0, resetTime: now + windowMs };
        }

        client.count++;
        this.clients.set(cacheKey, client);

        const remaining = Math.max(0, limit - client.count);
        const resetSeconds = Math.ceil((client.resetTime - now) / 1000);

        res.setHeader('RateLimit-Limit', limit.toString());
        res.setHeader('RateLimit-Remaining', remaining.toString());
        res.setHeader('RateLimit-Reset', resetSeconds.toString());

        if (client.count > limit) {
            res.setHeader('Retry-After', resetSeconds.toString());
            return res.status(429).json({
                statusCode: 429,
                error: 'Too Many Requests',
                message: isSensitiveRoute
                    ? 'Too many authentication attempts. Please wait before retrying.'
                    : 'Rate limit exceeded, please try again later.',
                retryAfterSeconds: resetSeconds,
            });
        }

        next();
    }
}
