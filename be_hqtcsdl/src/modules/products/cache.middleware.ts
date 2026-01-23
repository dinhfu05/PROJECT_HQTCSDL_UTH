// Cache Middleware - Add cache headers to responses

import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../../infra/cache';

/**
 * Middleware to add cache status headers
 * Attaches cache statistics to response headers
 */
export function cacheHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Get cache stats before request
    const statsBefore = cacheService.getStats();

    // Override json method to add headers
    res.json = function (body: unknown): Response {
        // Get cache stats after request
        const statsAfter = cacheService.getStats();

        // Determine if this request was a cache hit
        const wasHit = statsAfter.hits > statsBefore.hits;

        // Add cache headers
        res.setHeader('X-Cache', wasHit ? 'HIT' : 'MISS');
        res.setHeader('X-Cache-Hit-Rate', `${statsAfter.hitRate}%`);

        // Call original json method
        return originalJson(body);
    };

    next();
}
