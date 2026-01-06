================================================================================
                              SCRIPTS FOLDER
================================================================================

MỤC ĐÍCH:
---------
SQL scripts cho testing query performance.

CẤU TRÚC:
---------
scripts/
├── init.sql              - Khởi tạo database (Docker)
├── create-tables.sql     - Tạo tất cả bảng ecommerce
├── create-indexes.sql    - Thêm indexes
├── drop-indexes.sql      - Xóa indexes (để test không có index)
└── sample-queries.sql    - Các query mẫu để học

================================================================================
                        FOCUS: QUERY PERFORMANCE
================================================================================

FILE ĐỀ XUẤT:
-------------

1. create-tables.sql
   - Products (1 triệu records)
   - Categories
   - Orders + Order_items
   - Inventory
   - KHÔNG có indexes ban đầu (để so sánh)

2. create-indexes.sql
   - Tạo từng index một
   - Có comments giải thích mỗi index

3. drop-indexes.sql
   - Xóa tất cả indexes
   - Để quay lại trạng thái ban đầu

4. sample-queries.sql
   - Query 1: Simple SELECT (baseline)
   - Query 2: WHERE with different conditions
   - Query 3: JOIN queries
   - Query 4: Aggregation
   - Query 5: Subqueries
   - Mỗi query có EXPLAIN ANALYZE

WORKFLOW HỌC TẬP:
-----------------
1. Chạy create-tables.sql
2. Seed 1 triệu products
3. Chạy sample-queries.sql → Ghi nhận thời gian (CHẬM)
4. Chạy create-indexes.sql
5. Chạy lại sample-queries.sql → So sánh (NHANH hơn!)
6. Xóa indexes để test lại: drop-indexes.sql

================================================================================
