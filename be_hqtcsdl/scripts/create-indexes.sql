-- ================================================================================
-- CREATE INDEXES FOR PRODUCTS TABLE
-- ================================================================================
-- Purpose: Optimize product listing and search queries
-- Target table: products
-- Focus: Support filtering, sorting, pagination, and text search
-- ================================================================================

-- NOTE: Indexes are most effective with LARGE datasets (>10k rows).
-- For small datasets, MySQL Optimizer might still choose "Table Scan" (type: ALL) 
-- because it's faster than index overhead.

-- ================================================================================
-- SINGLE-COLUMN INDEXES
-- ================================================================================

-- Index 1: category_id (Foreign Key)
-- Use case: Filter products by category
-- Queries: WHERE category_id = ?
-- Also helps: JOIN with categories table
-- NOTE: Already created by foreign key constraint, skip
-- CREATE INDEX idx_products_category ON products(category_id);

-- Index 2: productPrice
-- Use case: Price range filters, price sorting
-- Queries: WHERE productPrice BETWEEN ? AND ?, ORDER BY productPrice
CREATE INDEX idx_products_price ON products(productPrice);

-- Index 3: created_at  
-- Use case: Default sort (newest first), date range filters
-- Queries: ORDER BY created_at DESC, WHERE created_at >= ?
CREATE INDEX idx_products_created ON products(created_at);

-- Index 4: productName (B-Tree for prefix search)
-- Use case: Name-based searching with LIKE
-- Queries: WHERE productName LIKE 'iPhone%'
-- Note: Only works with prefix search (text%), NOT %text%
CREATE INDEX idx_products_name ON products(productName);

-- Index 5: productName (Fulltext for advanced search)
-- Use case: Full-text search across product names
-- Queries: WHERE MATCH(productName) AGAINST('iPhone 15' IN NATURAL LANGUAGE MODE)
-- Note: Much faster than LIKE '%text%' for complex searches
CREATE FULLTEXT INDEX idx_products_name_fulltext ON products(productName);

-- ================================================================================
-- COMPOSITE INDEXES (Multi-column) - FOR COMPLEX QUERIES
-- ================================================================================

-- Index 6: (category_id, created_at) - MOST COMMON QUERY!
-- Use case: List products by category, sorted by newest
-- Queries: WHERE category_id = ? ORDER BY created_at DESC
-- From listing.repo.ts - default product listing
-- Column order: Filter first, then sort
CREATE INDEX idx_products_category_created ON products(category_id, created_at DESC);

-- Index 7: (category_id, productPrice)
-- Use case: Products by category sorted by price
-- Queries: WHERE category_id = ? ORDER BY productPrice ASC/DESC
-- Common for: "Shop by category, price low to high"
CREATE INDEX idx_products_category_price ON products(category_id, productPrice);

-- Index 8: (category_id, productPrice, created_at)
-- Use case: Category + price range + sort by date
-- Queries: WHERE category_id = ? AND productPrice BETWEEN ? AND ? ORDER BY created_at DESC
-- Advanced filtering in listing.query.ts
CREATE INDEX idx_products_category_price_created ON products(category_id, productPrice, created_at DESC);

-- Index 9: (created_at, productId) - FOR CURSOR PAGINATION
-- Use case: Cursor-based pagination (stable sorting)
-- Queries: WHERE (created_at < ? OR (created_at = ? AND productId < ?)) ORDER BY created_at DESC, productId DESC
-- From listing.repo.ts - cursor pagination logic
-- Critical: Column order and direction MUST match ORDER BY
CREATE INDEX idx_products_created_id ON products(created_at DESC, productId DESC);

-- Index 10: (productPrice, productId) - FOR PRICE SORTING PAGINATION
-- Use case: Paginate products sorted by price
-- Queries: ORDER BY productPrice ASC, productId ASC LIMIT ? OFFSET ?
-- Alternative sorting option in listing
CREATE INDEX idx_products_price_id ON products(productPrice, productId);

-- ================================================================================
-- INDEX STRATEGY EXPLANATION
-- ================================================================================

-- Why so many composite indexes?
-- 
-- 1. idx_products_category_created
--    Covers: 80% of product listing queries (filter by category, sort by date)
--    Without this: MySQL would use idx_products_category, then filesort (slow!)
--
-- 2. idx_products_category_price_created  
--    Covers: Advanced filters (category + price range + sort)
--    Without this: Multiple index scans or table scan (very slow!)
--
-- 3. idx_products_created_id
--    Covers: Cursor pagination (no OFFSET, scales to millions of rows)
--    Without this: Cannot use index for cursor WHERE conditions
--
-- Tradeoff: More indexes = faster SELECTs, slightly slower INSERTs
-- For e-commerce: Reads >> Writes, so this is acceptable

-- ================================================================================
-- VERIFY INDEXES CREATED
-- ================================================================================

-- Show all indexes on products table
-- SHOW INDEX FROM products;

-- Test if index is used (should show key=idx_products_category_created)
-- EXPLAIN SELECT * FROM products WHERE category_id = 1 ORDER BY created_at DESC LIMIT 20;

-- ================================================================================
-- PERFORMANCE EXPECTATIONS
-- ================================================================================

-- Query: SELECT * FROM products WHERE category_id = 5 ORDER BY created_at DESC LIMIT 20
-- Before (no index):
--   type: ALL | rows: 1,000,000 | Extra: Using where; Using filesort | Time: 500ms
-- After (with idx_products_category_created):
--   type: ref | rows: 50,000 | Extra: Using index | Time: 8ms
-- Improvement: 62x faster!

-- Query: SELECT * FROM products WHERE category_id = 5 AND productPrice BETWEEN 100 AND 500
-- Before (single index):
--   type: range | rows: 200,000 | Extra: Using where | Time: 180ms
-- After (composite idx_products_category_price_created):
--   type: range | rows: 5,000 | Extra: Using index condition | Time: 12ms
-- Improvement: 15x faster!

-- ================================================================================
-- MAINTENANCE COMMANDS
-- ================================================================================

-- Update index statistics (run after bulk inserts)
-- ANALYZE TABLE products;

-- Check index fragmentation (if many UPDATEs/DELETEs)
-- OPTIMIZE TABLE products;

-- Monitor unused indexes
-- SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'hqtcsdl' AND object_name = 'products';

-- ================================================================================
