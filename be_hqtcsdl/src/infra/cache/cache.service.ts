import { redisClient } from './redis.client';
import { config } from '../../config';

/**
 * Cache Service
 * High-level caching operations with graceful degradation
 */
class CacheService {
    private hits: number = 0;
    private misses: number = 0;

    /**
     * Get value from cache
     * Returns null if key doesn't exist or Redis unavailable
     */
    async get<T>(key: string): Promise<T | null> {
        const client = redisClient.getClient();
        if (!client) {
            this.misses++;
            return null;
        }

        try {
            const value = await client.get(key);

            if (value === null) {
                this.misses++;
                return null;
            }

            this.hits++;
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`Cache GET error for key "${key}":`, (error as Error).message);
            this.misses++;
            return null;
        }
    }

    /**
     * Set value in cache with optional TTL
     * @param key Cache key
     * @param value Value to cache (will be JSON stringified)
     * @param ttl TTL in seconds (default from config)
     */
    async set(key: string, value: any, ttl?: number): Promise<void> {
        const client = redisClient.getClient();
        if (!client) return;

        try {
            const serialized = JSON.stringify(value);
            const expiry = ttl || config.redis.ttl.default;

            await client.setex(key, expiry, serialized);
        } catch (error) {
            console.error(`Cache SET error for key "${key}":`, (error as Error).message);
        }
    }

    /**
     * Delete one or more keys
     */
    async del(keys: string | string[]): Promise<void> {
        const client = redisClient.getClient();
        if (!client) return;

        try {
            const keyArray = Array.isArray(keys) ? keys : [keys];
            if (keyArray.length > 0) {
                await client.del(...keyArray);
            }
        } catch (error) {
            console.error(`Cache DEL error:`, (error as Error).message);
        }
    }

    /**
     * Get keys matching pattern
     */
    async keys(pattern: string): Promise<string[]> {
        const client = redisClient.getClient();
        if (!client) return [];

        try {
            return await client.keys(pattern);
        } catch (error) {
            console.error(`Cache KEYS error:`, (error as Error).message);
            return [];
        }
    }

    /**
     * Delete all keys matching pattern
     */
    async flushPattern(pattern: string): Promise<number> {
        const client = redisClient.getClient();
        if (!client) return 0;

        try {
            const keys = await this.keys(pattern);

            if (keys.length === 0) return 0;

            await this.del(keys);
            return keys.length;
        } catch (error) {
            console.error(`Cache FLUSH error:`, (error as Error).message);
            return 0;
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        const client = redisClient.getClient();
        if (!client) return false;

        try {
            const result = await client.exists(key);
            return result === 1;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get TTL of key (in seconds)
     * Returns -1 if key has no expiry, -2 if key doesn't exist
     */
    async ttl(key: string): Promise<number> {
        const client = redisClient.getClient();
        if (!client) return -2;

        try {
            return await client.ttl(key);
        } catch (error) {
            return -2;
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

        return {
            hits: this.hits,
            misses: this.misses,
            total,
            hitRate: parseFloat(hitRate.toFixed(2)),
            isAvailable: redisClient.isAvailable(),
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.hits = 0;
        this.misses = 0;
    }

    /**
     * Flush all cache
     */
    async flushAll(): Promise<void> {
        const client = redisClient.getClient();
        if (!client) return;

        try {
            await client.flushdb();
            console.log('🗑️  Cache flushed');
        } catch (error) {
            console.error('Cache FLUSHALL error:', (error as Error).message);
        }
    }
}

// Singleton instance
export const cacheService = new CacheService();
