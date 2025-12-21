================================================================================
                           INFRASTRUCTURE (INFRA) LAYER
================================================================================

CẤU TRÚC CHUẨN:
---------------
src/infra/
├── database/
│   ├── database.ts       - MySQL connection pool
│   ├── explain.ts        - EXPLAIN/ANALYZE utilities
│   ├── migrations/       - SQL schema changes
│   └── seeds/            - Test data generation
├── logger/
│   ├── pino.ts           - Pino logger instance
│   └── http-logger.ts    - HTTP request logging
├── cache/
│   ├── redis.ts          - Redis connection
│   ├── cache.ts          - Cache service
│   └── keys.ts           - Cache key patterns
├── metrics/
│   └── metrics.ts        - Performance metrics
├── queue/
│   ├── queue.ts          - Queue manager
│   └── jobs/             - Job handlers
└── http/
    └── http-client.ts    - External API client

MỤC ĐÍCH:
---------
Layer chứa tất cả code hạ tầng kỹ thuật.
Tách biệt khỏi business logic để dễ thay đổi/scale.

================================================================================
