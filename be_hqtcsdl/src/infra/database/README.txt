================================================================================
                              DATABASE MODULE
================================================================================

MỤC ĐÍCH:
---------
Quản lý tất cả tương tác với MySQL database.

CẤU TRÚC:
---------
database/
├── database.ts     - Connection pool, query methods
├── explain.ts      - EXPLAIN/ANALYZE để phân tích query
├── migrations/     - SQL files thay đổi schema
├── seeds/          - Scripts tạo test data
└── index.ts        - Export module

FILE CHÍNH:
-----------

1. database.ts
   - createPool(): Tạo connection pool
   - query(): SELECT queries
   - execute(): INSERT/UPDATE/DELETE
   - transaction(): Chạy nhiều queries atomic
   - queryPaginated(): Query với pagination

2. explain.ts
   - explain(): Xem query plan
   - explainAnalyze(): Đo actual performance
   - formatExplainResult(): Format kết quả dễ đọc

QUAN TRỌNG VỚI 1 TRIỆU RECORDS:
-------------------------------
- Connection pool size: 50-100 connections
- Query timeout: 30 seconds (tránh long-running queries)
- Prepared statements: Tránh SQL injection + performance
- Batch operations: Insert/Update nhiều records cùng lúc

================================================================================
