================================================================================
                              METRICS MODULE
================================================================================

MỤC ĐÍCH:
---------
Đo lường và so sánh QUERY PERFORMANCE.
QUAN TRỌNG cho việc học tối ưu với 1 triệu records!

CẤU TRÚC:
---------
metrics/
├── metrics.ts      - Query timing utilities
└── index.ts        - Export module

METRICS CẦN ĐO:
---------------

1. Query Timing:
   - Thời gian thực thi query (ms)
   - So sánh trước/sau khi thêm index

2. Query Plan Analysis:
   - Số rows scanned
   - Index được sử dụng hay không
   - Table scan vs Index scan

3. Comparison Metrics:
   - Query A vs Query B (cùng kết quả, khác cách viết)
   - Có index vs Không index

VÍ DỤ SỬ DỤNG:
--------------
import { measureQuery } from '@/infra/metrics';

// Đo thời gian query
const { result, duration, rowsExamined } = await measureQuery(
    'SELECT * FROM products WHERE category_id = ?',
    [5]
);

console.log(`Query took: ${duration}ms`);
console.log(`Rows examined: ${rowsExamined}`);

// So sánh 2 queries
const comparison = await compareQueries(
    { sql: 'SELECT * FROM products WHERE name LIKE "%phone%"', params: [] },
    { sql: 'SELECT * FROM products WHERE MATCH(name) AGAINST("phone")', params: [] }
);

console.log('Query 1 duration:', comparison.query1.duration);
console.log('Query 2 duration:', comparison.query2.duration);
console.log('Faster:', comparison.faster);

================================================================================
