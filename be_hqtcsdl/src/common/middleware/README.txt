================================================================================
                            MIDDLEWARE FOLDER
================================================================================

MỤC ĐÍCH:
---------
Express middleware cho request processing và performance tracking.

FILES:
------
error.middleware.ts      - Error handling
logger.middleware.ts     - Request logging
perf.middleware.ts       - Performance tracking (db_ms + total_ms)
request-id.middleware.ts - Unique ID per request

================================================================================
                         PERF MIDDLEWARE (QUAN TRỌNG)
================================================================================

Mục đích: Đo và log performance mỗi request.

Hoạt động:
1. Bắt đầu timer khi request vào
2. Tích lũy db_ms từ database queries
3. Tính total_ms khi response
4. Inject perf data vào response JSON
5. Log ra console (JSON format)

Output mẫu:
{
  "type": "perf",
  "method": "GET",
  "path": "/products",
  "db_ms": 45.23,
  "total_ms": 52.10,
  "timestamp": "2024-12-21T06:30:00.000Z"
}

================================================================================
                         REQUEST-ID MIDDLEWARE
================================================================================

Mục đích: Gắn unique ID cho mỗi request để tracking/debugging.

Headers:
- X-Request-ID: uuid

================================================================================
