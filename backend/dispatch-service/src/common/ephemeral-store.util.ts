import { Logger } from '@nestjs/common';

interface LocalTtlEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Production-ready ephemeral key-value store with TTL expiration.
 * Uses Redis (via REDIS_URL + ioredis) when configured, with automatic
 * non-blocking fallback to an auto-expiring in-memory TTL cache for local/test runs.
 */
export class EphemeralStore<T> {
  private readonly logger: Logger;
  private readonly namespace: string;
  private readonly defaultTtlSeconds: number;
  private readonly localCache = new Map<string, LocalTtlEntry<T>>();
  private redisClient: any = null;
  private redisInitAttempted = false;

  constructor(namespace: string, defaultTtlSeconds = 300) {
    this.namespace = namespace;
    this.defaultTtlSeconds = defaultTtlSeconds;
    this.logger = new Logger(`EphemeralStore:${namespace}`);
  }

  private getKey(key: string): string {
    return `cabi:${this.namespace}:${key}`;
  }

  private async getRedis(): Promise<any | null> {
    if (this.redisInitAttempted) return this.redisClient;
    this.redisInitAttempted = true;

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return null;

    try {
      const ioredis = await import('ioredis');
      const RedisCtor = (ioredis as any).default || ioredis;
      const client = new RedisCtor(redisUrl, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        lazyConnect: true,
      });
      client.on('error', (err: Error) => {
        this.logger.warn(`Redis error (falling back to local TTL cache): ${err.message}`);
      });
      await client.connect();
      this.redisClient = client;
      this.logger.log(`Connected to Redis TTL store for namespace "${this.namespace}"`);
    } catch (err: any) {
      this.logger.warn(`Redis unavailable, using local TTL fallback: ${err?.message || err}`);
      this.redisClient = null;
    }

    return this.redisClient;
  }

  async set(key: string, value: T, ttlSeconds = this.defaultTtlSeconds): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.localCache.set(key, { value, expiresAt });

    const redis = await this.getRedis();
    if (redis) {
      try {
        await redis.setex(this.getKey(key), ttlSeconds, JSON.stringify(value));
      } catch (err: any) {
        this.logger.warn(`Redis SETEX failed for ${key}: ${err?.message}`);
      }
    }
  }

  async get(key: string): Promise<T | undefined> {
    const redis = await this.getRedis();
    if (redis) {
      try {
        const raw = await redis.get(this.getKey(key));
        if (raw) {
          return JSON.parse(raw) as T;
        }
      } catch (err: any) {
        this.logger.warn(`Redis GET failed for ${key}: ${err?.message}`);
      }
    }

    const entry = this.localCache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.localCache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async delete(key: string): Promise<void> {
    this.localCache.delete(key);
    const redis = await this.getRedis();
    if (redis) {
      try {
        await redis.del(this.getKey(key));
      } catch (err: any) {
        this.logger.warn(`Redis DEL failed for ${key}: ${err?.message}`);
      }
    }
  }

  /**
   * Synchronous read from local cache (for hot paths & non-async callers)
   */
  getSync(key: string): T | undefined {
    const entry = this.localCache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.localCache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Prunes expired entries from local fallback map
   */
  pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [k, entry] of this.localCache.entries()) {
      if (now > entry.expiresAt) {
        this.localCache.delete(k);
        pruned++;
      }
    }
    return pruned;
  }
}
