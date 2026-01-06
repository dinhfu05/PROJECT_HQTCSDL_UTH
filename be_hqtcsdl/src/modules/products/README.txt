================================================================================
                            PRODUCTS MODULE
================================================================================

MỤC ĐÍCH:
---------
Module quản lý sản phẩm với 2 chức năng chính:
1. LISTING: Filter/Sort/Pagination cho benchmark performance (1M records)
2. DETAIL: CRUD operations cho từng product

================================================================================
                            CẤU TRÚC THƯ MỤC
================================================================================

src/modules/products/
├─ products.module.ts         # Entry point, combine routes
├─ products.controller.ts     # /products/:id (detail, CRUD)
├─ products.service.ts        # Business logic for detail
├─ products.types.ts          # TypeScript interfaces
├─ repositories/
│  └─ products.repo.ts        # Raw SQL for CRUD
├─ listing/
│  ├─ listing.controller.ts   # GET /products (filter/sort)
│  ├─ listing.service.ts      # Business logic + perf tracking
│  ├─ listing.repo.ts         # Raw SQL optimized for index
│  ├─ listing.query.ts        # Parse sort/filter/cursor
│  └─ listing.types.ts        # Listing interfaces
└─ README.txt                 # Documentation (file này)

================================================================================
                            API ENDPOINTS
================================================================================

LISTING (Benchmark):
--------------------
GET /products
  Query params: cursor, limit, categoryId, minPrice, maxPrice, search, sortBy, sortOrder
  → Response: { data, nextCursor, hasMore, perf: { db_ms, total_ms } }

GET /products/with-count
  → Same + total count (slower)

GET /products/explain
  → Debug query plan (EXPLAIN)

GET /products/explain-analyze
  → Detailed performance (EXPLAIN ANALYZE)

DETAIL (CRUD):
--------------
GET    /products/:id     → Get product detail
POST   /products         → Create new product
PATCH  /products/:id     → Update product
DELETE /products/:id     → Delete product

================================================================================
                          BENCHMARK WORKFLOW
================================================================================

1. Seed 10k records  → Query → Ghi nhận db_ms
2. Seed 100k records → Query → Ghi nhận db_ms
3. Seed 1M records   → Query → Ghi nhận db_ms (CHẬM!)
4. Thêm indexes      → Query → Ghi nhận db_ms (NHANH!)
5. So sánh kết quả

================================================================================
                          LAYER ARCHITECTURE
================================================================================

┌─────────────────────────────────────────────────────────────────┐
│  Controller                                                     │
│  - Nhận HTTP request                                            │
│  - Validate input                                               │
│  - Trả JSON response                                            │
├─────────────────────────────────────────────────────────────────┤
│  Service                                                        │
│  - Business logic                                               │
│  - Performance tracking                                         │
│  - Cursor encoding/decoding                                     │
├─────────────────────────────────────────────────────────────────┤
│  Repository                                                     │
│  - Raw SQL queries                                              │
│  - Database connection                                          │
│  - Optimized for index usage                                    │
└─────────────────────────────────────────────────────────────────┘

================================================================================
