// Cache Debug Controller - Monitor Redis performance
// Development/Testing only - DO NOT expose in production!

import { Request, Response } from 'express';
import { cacheService, redisClient, CacheKeyBuilder } from '../../infra/cache';

export class CacheDebugController {
    /**
     * GET /api/debug/cache/stats
     * Get cache statistics (hit rate, misses, etc)
     */
    async getStats(req: Request, res: Response) {
        try {
            const stats = cacheService.getStats();
            const info = await redisClient.getInfo();

            // Extract relevant Redis info
            const redisStats = {
                version: info['redis_version'],
                uptime_seconds: parseInt(info['uptime_in_seconds'] || '0'),
                connected_clients: parseInt(info['connected_clients'] || '0'),
                used_memory_human: info['used_memory_human'],
                used_memory_peak_human: info['used_memory_peak_human'],
                total_commands_processed: parseInt(info['total_commands_processed'] || '0'),
                instantaneous_ops_per_sec: parseInt(info['instantaneous_ops_per_sec'] || '0'),
                keyspace_hits: parseInt(info['keyspace_hits'] || '0'),
                keyspace_misses: parseInt(info['keyspace_misses'] || '0'),
            };

            res.json({
                cache: stats,
                redis: redisStats,
                isHealthy: redisClient.isAvailable(),
            });
        } catch (error) {
            console.error('Error fetching cache stats:', error);
            res.status(500).json({ error: 'Failed to fetch cache stats' });
        }
    }

    /**
     * GET /api/debug/cache/keys?pattern=products:*
     * List cache keys matching pattern
     */
    async listKeys(req: Request, res: Response) {
        try {
            const pattern = (req.query.pattern as string) || '*';
            const keys = await cacheService.keys(pattern);

            // Get TTL for each key (limited to 50 keys)
            const keysWithTTL = await Promise.all(
                keys.slice(0, 50).map(async (key) => ({
                    key,
                    ttl: await cacheService.ttl(key),
                }))
            );

            res.json({
                pattern,
                total: keys.length,
                keys: keysWithTTL,
                truncated: keys.length > 50,
            });
        } catch (error) {
            console.error('Error listing keys:', error);
            res.status(500).json({ error: 'Failed to list keys' });
        }
    }

    /**
     * GET /api/debug/cache/patterns
     * List all common cache patterns
     */
    async listPatterns(req: Request, res: Response) {
        try {
            const patterns = {
                all_products: CacheKeyBuilder.productsPattern(),
                product_lists: CacheKeyBuilder.productListsPattern(),
                product_searches: CacheKeyBuilder.productSearchPattern(),
                categories: `${CacheKeyBuilder.categoriesList().split(':').slice(0, 2).join(':')}:*`,
                all: CacheKeyBuilder.allPattern(),
            };

            const counts: Record<string, number> = {};

            for (const [name, pattern] of Object.entries(patterns)) {
                const keys = await cacheService.keys(pattern);
                counts[name] = keys.length;
            }

            res.json({
                patterns,
                counts,
            });
        } catch (error) {
            console.error('Error listing patterns:', error);
            res.status(500).json({ error: 'Failed to list patterns' });
        }
    }

    /**
     * DELETE /api/debug/cache/flush?pattern=products:*
     * Flush cache keys matching pattern
     */
    async flushCache(req: Request, res: Response) {
        try {
            const pattern = req.query.pattern as string;

            if (!pattern) {
                return res.status(400).json({ error: 'Pattern is required' });
            }

            // Safety check - don't allow flushing all keys in production
            if (pattern === '*' && process.env.NODE_ENV === 'production') {
                return res.status(403).json({ error: 'Cannot flush all keys in production' });
            }

            const flushed = await cacheService.flushPattern(pattern);

            res.json({
                pattern,
                flushed,
                message: `Flushed ${flushed} keys`,
            });
        } catch (error) {
            console.error('Error flushing cache:', error);
            res.status(500).json({ error: 'Failed to flush cache' });
        }
    }

    /**
     * DELETE /api/debug/cache/flush-all
     * Flush entire cache (DANGEROUS!)
     */
    async flushAll(req: Request, res: Response) {
        try {
            // Require confirmation in production
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({ error: 'Cannot flush all in production without confirmation' });
            }

            await cacheService.flushAll();
            cacheService.resetStats();

            res.json({
                message: 'All cache cleared and stats reset',
            });
        } catch (error) {
            console.error('Error flushing all cache:', error);
            res.status(500).json({ error: 'Failed to flush all cache' });
        }
    }

    /**
     * GET /api/debug/cache/health
     * Check Redis health
     */
    async checkHealth(req: Request, res: Response) {
        try {
            const isHealthy = await redisClient.ping();

            res.json({
                healthy: isHealthy,
                available: redisClient.isAvailable(),
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            res.status(503).json({
                healthy: false,
                available: false,
                error: (error as Error).message,
            });
        }
    }

    /**
     * POST /api/debug/cache/reset-stats
     * Reset cache hit/miss statistics
     */
    async resetStats(req: Request, res: Response) {
        try {
            cacheService.resetStats();

            res.json({
                message: 'Cache statistics reset',
                stats: cacheService.getStats(),
            });
        } catch (error) {
            console.error('Error resetting stats:', error);
            res.status(500).json({ error: 'Failed to reset stats' });
        }
    }
}

export const cacheDebugController = new CacheDebugController();
