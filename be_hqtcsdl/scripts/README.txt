================================================================================
                              SCRIPTS FOLDER
================================================================================

CẤU TRÚC THƯ MỤC:
-----------------
scripts/
├── init.sql              # Database initialization (runs on Docker startup)
├── create-tables.sql     # Create all ecommerce tables
├── create-indexes.sql    # Create indexes for products (PRIMARY)
├── seed-data.sql         # Small sample dataset
├── setup-db.ts           # TypeScript setup utility
├── README.txt            # This file
│
├── indexes/              # Index management scripts
│   ├── orders.sql        # Create indexes for orders/order_items
│   ├── drop-products.sql # Drop product indexes (testing)
│   └── drop-orders.sql   # Drop order indexes (testing)
│
├── seeds/                # Large test datasets
│   └── products-100k.sql # Generate 100,000 products for testing
│
└── tests/                # Performance testing queries
    └── products-performance.sql # 8 benchmark queries with EXPLAIN ANALYZE

================================================================================
                           QUICK START WORKFLOW
================================================================================

1️⃣  SETUP DATABASE (First Time)
   docker-compose up -d
   # Tables and indexes created automatically from init.sql

2️⃣  SEED LARGE DATASET (For Testing)
   docker exec -it hqtcsdl-mysql mysql -u root -p
   USE hqtcsdl;
   SOURCE /docker-entrypoint-initdb.d/seeds/products-100k.sql;
   # Creates 100k products (~60 seconds)

3️⃣  TEST PERFORMANCE (Baseline WITHOUT Indexes)
   SOURCE /docker-entrypoint-initdb.d/indexes/drop-products.sql;
   SOURCE /docker-entrypoint-initdb.d/tests/products-performance.sql;
   # Record slow query times

4️⃣  CREATE INDEXES
   SOURCE /docker-entrypoint-initdb.d/create-indexes.sql;
   ANALYZE TABLE products;

5️⃣  TEST AGAIN (WITH Indexes)
   SOURCE /docker-entrypoint-initdb.d/tests/products-performance.sql;
   # Compare: Should be 50-200x faster!

================================================================================
                              FILE PURPOSES
================================================================================

PRIMARY FILES (Run in order):
├── init.sql              → Creates users table + sample data
├── create-tables.sql     → Creates products, categories, orders
├── create-indexes.sql    → Creates 10 indexes for products ⭐
└── seed-data.sql         → Small test data

INDEXES FOLDER:
├── orders.sql            → 10 indexes for orders module (future)
├── drop-products.sql     → Remove product indexes (testing only)
└── drop-orders.sql       → Remove order indexes (testing only)

SEEDS FOLDER:
└── products-100k.sql     → Stored procedure for 100k realistic products
                           (Use for performance testing)

TESTS FOLDER:
└── products-performance.sql → 8 test cases:
                              1. Category filter + sort
                              2. Price range
                              3. Category + price + sort
                              4. Cursor pagination
                              5. Full-text search
                              6. Category + price sort
                              7. Price pagination
                              8. Count with filter

================================================================================
                         DOCKER VOLUME PATHS
================================================================================

Inside container, scripts are at:
/docker-entrypoint-initdb.d/

Examples:
SOURCE /docker-entrypoint-initdb.d/create-indexes.sql;
SOURCE /docker-entrypoint-initdb.d/seeds/products-100k.sql;
SOURCE /docker-entrypoint-initdb.d/tests/products-performance.sql;

================================================================================
                        PERFORMANCE EXPECTATIONS
================================================================================

With 100k+ products, indexes provide dramatic improvements:

Query Type                | Without Index | With Index | Improvement
--------------------------|---------------|------------|-------------
Category + sort           | 500ms         | 8ms        | 62x faster ⚡
Price range               | 300ms         | 15ms       | 20x faster ⚡
Category + price + sort   | 800ms         | 20ms       | 40x faster ⚡
Cursor pagination         | 600ms         | 3ms        | 200x faster ⚡
Full-text search          | 1000ms        | 30ms       | 33x faster ⚡
Count with filter         | 2000ms        | 100ms      | 20x faster ⚡

Average: ~60x performance improvement 🚀

================================================================================
                           DEBUG API ENDPOINTS
================================================================================

Available in development mode at http://localhost:3000/api/debug:

GET  /api/debug/indexes/:table
     → View all indexes for a table
     Example: curl http://localhost:3000/api/debug/indexes/products

GET  /api/debug/indexes
     → View all indexes across all tables

POST /api/debug/analyze-query
     → Analyze query performance with EXPLAIN
     Body: { "sql": "SELECT * FROM products WHERE category_id = 1" }

See walkthrough.md artifact for complete API documentation.

================================================================================
                           LEARNING RESOURCES
================================================================================

📚 Read artifacts in .gemini/antigravity/brain/[conversation-id]/:

- index-explained.md      → Complete guide on database indexes
- walkthrough.md          → Step-by-step testing guide
- implementation_plan.md  → Technical design decisions

================================================================================
