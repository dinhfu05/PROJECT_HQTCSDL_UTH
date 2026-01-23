import { Router } from 'express';
import { cacheDebugController } from './cache.controller';

const router = Router();

// Cache statistics
router.get('/cache/stats',
    cacheDebugController.getStats.bind(cacheDebugController)
);

// List cache keys
router.get('/cache/keys',
    cacheDebugController.listKeys.bind(cacheDebugController)
);

// List cache patterns
router.get('/cache/patterns',
    cacheDebugController.listPatterns.bind(cacheDebugController)
);

// Flush cache by pattern
router.delete('/cache/flush',
    cacheDebugController.flushCache.bind(cacheDebugController)
);

// Flush all cache
router.delete('/cache/flush-all',
    cacheDebugController.flushAll.bind(cacheDebugController)
);

// Health check
router.get('/cache/health',
    cacheDebugController.checkHealth.bind(cacheDebugController)
);

// Reset statistics
router.post('/cache/reset-stats',
    cacheDebugController.resetStats.bind(cacheDebugController)
);

export const cacheDebugModule: Router = router;
