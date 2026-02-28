import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    // Simple in-memory rate limiting (use Redis for production with multiple instances)
    private clients: Map<string, { count: number, resetTime: number }> = new Map();

    use(req: Request, res: Response, next: NextFunction) {
        const ip = req.ip || 'unknown';
        const now = Date.now();
        const limit = 100; // 100 requests
        const windowMs = 60000; // 1 minute

        let client = this.clients.get(ip);

        if (!client || now > client.resetTime) {
            client = { count: 0, resetTime: now + windowMs };
        }

        client.count++;
        this.clients.set(ip, client);

        if (client.count > limit) {
            return res.status(429).json({
                statusCode: 429,
                message: 'Too many requests, please try again later.',
            });
        }

        next();
    }
}
