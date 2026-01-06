================================================================================
                              COMMON FOLDER
================================================================================

MỤC ĐÍCH:
---------
Chứa code dùng chung cho toàn bộ dự án.

CẤU TRÚC:
---------
common/
├── interfaces/         - TypeScript interfaces
├── middleware/         - Express middleware
├── exceptions/         - Error handling
└── utils/              - Helper functions

================================================================================
                        FOCUS: QUERY PERFORMANCE
================================================================================

UTILS QUAN TRỌNG CHO PERFORMANCE:
---------------------------------

1. PAGINATION UTILS
   - Offset-based pagination (đơn giản, nhưng chậm với offset lớn)
   - Cursor-based pagination (nhanh, recommended cho data lớn)

2. QUERY TIMER
   - Đo thời gian thực thi query
   - Format output dễ đọc
   
   const timer = startTimer();
   const result = await database.query(sql);
   const duration = timer.end();
   console.log(`Query took ${duration}ms`);

3. QUERY RESULT FORMATTER
   - Format EXPLAIN output dễ đọc
   - Highlight slow sections

VÍ DỤ PAGINATION:
-----------------
// Offset-based (chậm với page lớn)
function getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
}

// Cursor-based (nhanh hơn)
function getCursorCondition(lastId: number): string {
    return `WHERE id > ${lastId} ORDER BY id LIMIT 20`;
}

SO SÁNH:
--------
Page 1: Offset=0     → Nhanh
Page 1000: Offset=20000 → Rất chậm!
Cursor: WHERE id > 20000 → Vẫn nhanh!

================================================================================
