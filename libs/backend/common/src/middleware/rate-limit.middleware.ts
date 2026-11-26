import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { globalAuditTelemetry } from '../lib/audit-telemetry.service';

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

        // Stricter limits for authentication, OTP verification, biometric unlocks, and emergency overrides
        const path = req.originalUrl || req.url || '';

        const isCriticalOtpRoute =
            path.includes('/auth/verify-otp') ||
            path.includes('/auth/admin/verify-identity') ||
            path.includes('/auth/webauthn/quick-unlock') ||
            path.includes('/auth/webauthn/verify') ||
            path.includes('/admin/approvals/break-glass');

        const isSensitiveRoute =
            isCriticalOtpRoute ||
            path.includes('/auth/login') ||
            path.includes('/auth/register') ||
            path.includes('/auth/forgot-password') ||
            path.includes('/auth/admin/initiate-login') ||
            path.includes('/auth/admin/resend-otp') ||
            path.includes('/auth/webauthn/challenge') ||
            path.includes('/forgot-email') ||
            path.includes('/stk-push');

        const limit = isCriticalOtpRoute ? 5 : isSensitiveRoute ? 15 : 120;
        const windowMs = 60000; // 1 minute
        const tierName = isCriticalOtpRoute ? 'critical' : isSensitiveRoute ? 'sensitive' : 'standard';
        const cacheKey = `${ip}:${tierName}`;

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

            if (isCriticalOtpRoute || isSensitiveRoute) {
                globalAuditTelemetry.logAuthFailure(
                    ip,
                    `Rate limit exceeded on ${path} (${client.count} attempts in 60s, limit: ${limit})`,
                    ip,
                    req.headers['user-agent'] as string
                ).catch(() => {});
            }

            return res.status(429).json({
                statusCode: 429,
                error: 'Too Many Requests',
                message: isCriticalOtpRoute
                    ? 'Security alert: Too many verification attempts. Please wait 60 seconds before trying again.'
                    : isSensitiveRoute
                    ? 'Too many authentication attempts. Please wait before retrying.'
                    : 'Rate limit exceeded, please try again later.',
                retryAfterSeconds: resetSeconds,
            });
        }

        next();
    }
}
