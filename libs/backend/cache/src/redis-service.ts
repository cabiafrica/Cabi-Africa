// Redis Cache Service for High-Scale Operations
// Handles caching, rate limiting, and real-time data

import Redis from 'ioredis';
import { createClient } from 'redis';

// Redis Cluster Configuration
const REDIS_CLUSTER_NODES = [
    { host: process.env.REDIS_NODE_1_HOST || 'localhost', port: 6379 },
    { host: process.env.REDIS_NODE_2_HOST || 'localhost', port: 6380 },
    { host: process.env.REDIS_NODE_3_HOST || 'localhost', port: 6381 },
];

// Create Redis Cluster client
export const redisCluster = new Redis.Cluster(REDIS_CLUSTER_NODES, {
    redisOptions: {
        password: process.env.REDIS_PASSWORD,
        tls: process.env.NODE_ENV === 'production' ? {} : undefined,
    },
    clusterRetryStrategy: (times) => {
        const delay = Math.min(100 * times, 2000);
        return delay;
    },
});

// Separate client for pub/sub (doesn't support cluster mode well)
export const redisPubSub = new Redis({
    host: process.env.REDIS_PUBSUB_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PUBSUB_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
});

// Cache key generators
export const CacheKeys = {
    user: (userId: string) => `user:${userId}`,
    userSession: (sessionId: string) => `session:${sessionId}`,
    driverLocation: (driverId: string) => `driver:location:${driverId}`,
    activeTrip: (tripId: string) => `trip:active:${tripId}`,
    nearbyDrivers: (lat: number, lng: number) => `drivers:nearby:${lat.toFixed(2)}:${lng.toFixed(2)}`,
    rideRequest: (requestId: string) => `ride:request:${requestId}`,
};

// Cache TTLs (in seconds)
export const CacheTTL = {
    USER_DATA: 3600,           // 1 hour
    SESSION: 86400,            // 24 hours
    DRIVER_LOCATION: 30,       // 30 seconds
    ACTIVE_TRIP: 0,            // No expiry (deleted when trip ends)
    NEARBY_DRIVERS: 10,        // 10 seconds
    RIDE_REQUEST: 300,         // 5 minutes
};

// Cache Service
export class CacheService {
    // Get cached data
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redisCluster.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    // Set cached data
    async set(key: string, value: any, ttl?: number): Promise<boolean> {
        try {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await redisCluster.setex(key, ttl, serialized);
            } else {
                await redisCluster.set(key, serialized);
            }
            return true;
        } catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }

    // Delete cached data
    async delete(key: string): Promise<boolean> {
        try {
            await redisCluster.del(key);
            return true;
        } catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }

    // Get or set pattern
    async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const fresh = await fetcher();
        await this.set(key, fresh, ttl);
        return fresh;
    }

    // Store driver location (geospatial)
    async setDriverLocation(driverId: string, lat: number, lng: number): Promise<void> {
        const key = 'drivers:locations';
        await redisCluster.geoadd(key, lng, lat, driverId);
        await redisCluster.expire(key, CacheTTL.DRIVER_LOCATION);
    }

    // Find nearby drivers
    async findNearbyDrivers(
        lat: number,
        lng: number,
        radiusKm: number = 5,
        limit: number = 20
    ): Promise<Array<{ driverId: string; distance: number }>> {
        try {
            const key = 'drivers:locations';
            const results = await redisCluster.georadius(
                key,
                lng,
                lat,
                radiusKm,
                'km',
                'WITHDIST',
                'ASC',
                'COUNT',
                limit
            );

            return results.map(([driverId, distance]) => ({
                driverId: driverId as string,
                distance: parseFloat(distance as string),
            }));
        } catch (error) {
            console.error('Error finding nearby drivers:', error);
            return [];
        }
    }

    // Rate limiting
    async checkRateLimit(
        key: string,
        maxRequests: number,
        windowSeconds: number
    ): Promise<{ allowed: boolean; remaining: number }> {
        try {
            const current = await redisCluster.incr(key);

            if (current === 1) {
                await redisCluster.expire(key, windowSeconds);
            }

            const allowed = current <= maxRequests;
            const remaining = Math.max(0, maxRequests - current);

            return { allowed, remaining };
        } catch (error) {
            console.error('Rate limit check error:', error);
            return { allowed: true, remaining: maxRequests };
        }
    }

    // Distributed lock
    async acquireLock(lockKey: string, ttl: number = 10): Promise<boolean> {
        try {
            const result = await redisCluster.set(lockKey, '1', 'EX', ttl, 'NX');
            return result === 'OK';
        } catch (error) {
            console.error('Lock acquisition error:', error);
            return false;
        }
    }

    async releaseLock(lockKey: string): Promise<void> {
        await redisCluster.del(lockKey);
    }
}

export const cacheService = new CacheService();

// Pub/Sub for real-time updates
export class PubSubService {
    async publish(channel: string, message: any): Promise<void> {
        await redisPubSub.publish(channel, JSON.stringify(message));
    }

    subscribe(channel: string, handler: (message: any) => void): void {
        const subscriber = redisPubSub.duplicate();
        subscriber.subscribe(channel);
        subscriber.on('message', (ch, msg) => {
            if (ch === channel) {
                try {
                    handler(JSON.parse(msg));
                } catch (error) {
                    console.error('PubSub message parse error:', error);
                }
            }
        });
    }
}

export const pubSubService = new PubSubService();

// Health check
export async function checkRedisHealth() {
    try {
        await redisCluster.ping();
        return { healthy: true, message: 'Redis cluster healthy' };
    } catch (error) {
        return { healthy: false, message: `Redis health check failed: ${error}` };
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await redisCluster.quit();
    await redisPubSub.quit();
    process.exit(0);
});
