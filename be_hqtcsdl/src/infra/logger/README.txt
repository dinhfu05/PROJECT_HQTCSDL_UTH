================================================================================
                               LOGGER MODULE
================================================================================

MỤC ĐÍCH:
---------
Logging để debug và phân tích SQL queries.

CẤU TRÚC:
---------
logger/
├── pino.ts         - Pino logger instance
├── http-logger.ts  - Log HTTP requests (optional)
└── index.ts        - Export module

FOCUS: QUERY LOGGING
--------------------
Log các thông tin quan trọng của mỗi query:
- SQL statement
- Parameters
- Execution time
- Rows affected/returned

VÍ DỤ OUTPUT:
-------------
[2024-12-21 11:30:00] INFO: Query executed
    sql: "SELECT * FROM products WHERE category_id = ?"
    params: [5]
    duration: 45ms
    rows: 1250

[2024-12-21 11:30:01] WARN: Slow query detected!
    sql: "SELECT * FROM products WHERE name LIKE '%phone%'"
    duration: 2500ms  ← Quá chậm!
    suggestion: "Consider using FULLTEXT index"

SLOW QUERY THRESHOLD:
---------------------
- < 100ms: OK (màu xanh)
- 100-500ms: Warning (màu vàng)
- > 500ms: Slow (màu đỏ)

================================================================================
