// Performance middleware - logs total_ms + db_ms per request

import { Request, Response, NextFunction } from 'express';

// Extend Request to track perf data
declare global {
  namespace Express {
    interface Request {
      perf?: {
        startTime: bigint;
        db_ms: number;
      };
    }
  }
}

// Start timer at request begin
export function perfMiddleware(req: Request, res: Response, next: NextFunction) {
  req.perf = {
    startTime: process.hrtime.bigint(),
    db_ms: 0,
  };

  // Override res.json to inject perf data
  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    if (req.perf && typeof body === 'object' && body !== null) {
      const endTime = process.hrtime.bigint();
      const total_ms = Number(endTime - req.perf.startTime) / 1_000_000;

      // Inject perf data into response
      (body as Record<string, unknown>).perf = {
        db_ms: Math.round(req.perf.db_ms * 100) / 100,
        total_ms: Math.round(total_ms * 100) / 100,
      };

      // Log to console (JSON format for parsing)
      console.log(
        JSON.stringify({
          type: 'perf',
          method: req.method,
          path: req.path,
          query: req.query,
          db_ms: req.perf.db_ms,
          total_ms,
          timestamp: new Date().toISOString(),
        })
      );
    }

    return originalJson(body);
  };

  next();
}

// Helper to add db_ms to request
export function addDbTime(req: Request, ms: number) {
  if (req.perf) {
    req.perf.db_ms += ms;
  }
}
