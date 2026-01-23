import { Router } from 'express';
import { performanceDebugController } from './performance.controller';

const router = Router();

// Get indexes for specific table
router.get('/indexes/:table',
    performanceDebugController.getTableIndexes.bind(performanceDebugController)
);

// Get all indexes
router.get('/indexes',
    performanceDebugController.getAllIndexes.bind(performanceDebugController)
);

// Check if index exists
router.get('/indexes/check/:table/:index',
    performanceDebugController.checkIndexExists.bind(performanceDebugController)
);

// Analyze query with EXPLAIN
router.post('/analyze-query',
    performanceDebugController.analyzeQuery.bind(performanceDebugController)
);

// Analyze query with EXPLAIN ANALYZE (executes query)
router.post('/analyze-query-execution',
    performanceDebugController.analyzeQueryExecution.bind(performanceDebugController)
);

export const performanceDebugModule: Router = router;
