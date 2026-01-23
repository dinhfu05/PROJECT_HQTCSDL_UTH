-- ================================================================================
-- PERFORMANCE TEST QUERIES FOR PRODUCTS
-- ================================================================================
-- Purpose: Test and compare query performance WITH and WITHOUT indexes
-- Run these queries before and after creating indexes
-- Record EXPLAIN ANALYZE output for comparison
-- ================================================================================

-- INSTRUCTIONS:
-- 1. Run without indexes: SOURCE drop-indexes-products.sql
-- 2. Execute queries below and record times
-- 3. Create indexes: SOURCE create-indexes.sql  
-- 4. Execute same queries and compare
-- ================================================================================

-- ================================================================================
-- TEST 1: Simple Category Filter + Sort (Most Common Query)
-- ================================================================================
-- Expected index used: idx_products_category_created
-- Target: FROM 500ms → 8ms (60x faster)

EXPLAIN ANALYZE
SELECT 
  p.productId,
  p.productName,
  p.productPrice,
  p.category_id,
  c.name as category_name,
  p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.category_id = 1
ORDER BY p.created_at DESC
LIMIT 20;

-- Record results:
-- WITHOUT indexes: type=___, rows=___, time=___ms
-- WITH indexes:    type=___, rows=___, time=___ms

-- ================================================================================
-- TEST 2: Price Range Filter
-- ================================================================================
-- Expected index used: idx_products_price
-- Target: FROM 300ms → 15ms (20x faster)

EXPLAIN ANALYZE
SELECT productId, productName, productPrice
FROM products
WHERE productPrice BETWEEN 100.00 AND 500.00
ORDER BY productPrice ASC
LIMIT 20;

-- Record results:
-- WITHOUT indexes: type=___, rows=___, time=___ms
-- WITH indexes:    type=___, rows=___, time=___ms

-- ================================================================================
-- TEST 3: Category + Price Range + Sort (Complex Query)
-- ================================================================================
-- Expected index used: idx_products_category_price_created
-- Target: FROM 800ms → 20ms (40x faster)

EXPLAIN ANALYZE
SELECT 
  productId,
  productName,
  productPrice,
  category_id,
  created_at
FROM products
WHERE category_id = 2
  AND productPrice BETWEEN 50.00 AND 200.00
ORDER BY created_at DESC
LIMIT 20;

-- Record results:
-- WITHOUT indexes: type=___, rows=___, time=___ms
-- WITH indexes:    type=___, rows=___, time=___ms

-- ================================================================================
-- TEST 4: Cursor-based Pagination
-- ================================================================================
-- Expected index used: idx_products_created_id
-- Target: Stable performance regardless of page number

-- First page (baseline)
EXPLAIN ANALYZE
SELECT productId, productName, created_at
FROM products
ORDER BY created_at DESC, productId DESC
LIMIT 20;

-- Deep pagination (using cursor)
EXPLAIN ANALYZE
SELECT productId, productName, created_at
FROM products
WHERE (created_at < '2024-01-01 00:00:00' 
   OR (created_at = '2024-01-01 00:00:00' AND productId < 50000))
ORDER BY created_at DESC, productId DESC
LIMIT 20;

-- Record results:
-- WITHOUT idx_products_created_id: type=___, Extra=___, time=___ms
-- WITH idx_products_created_id:    type=___, Extra=___, time=___ms

-- ================================================================================
-- TEST 5: Full-text Search
-- ================================================================================
-- Expected index used: idx_products_name_fulltext
-- Target: FROM 1000ms → 30ms (33x faster)

-- Simple LIKE (inefficient without fulltext)
EXPLAIN ANALYZE
SELECT productId, productName
FROM products
WHERE productName LIKE '%iPhone%'
LIMIT 20;

-- MATCH AGAINST (requires fulltext index)
EXPLAIN ANALYZE
SELECT productId, productName
FROM products
WHERE MATCH(productName) AGAINST('iPhone' IN NATURAL LANGUAGE MODE)
LIMIT 20;

-- Record results:
-- LIKE without index:  type=___, rows=___, time=___ms
-- MATCH with fulltext: type=___, rows=___, time=___ms

-- ================================================================================
-- TEST 6: Category + Sort by Price
-- ================================================================================
-- Expected index used: idx_products_category_price
-- Target: FROM 400ms → 12ms (33x faster)

EXPLAIN ANALYZE
SELECT productId, productName, productPrice, category_id
FROM products
WHERE category_id = 3
ORDER BY productPrice ASC
LIMIT 20;

-- Record results:
-- WITHOUT indexes: type=___, rows=___, Extra=___, time=___ms
-- WITH indexes:    type=___, rows=___, Extra=___, time=___ms

-- ================================================================================
-- TEST 7: Sort by Price (Pagination with Price)
-- ================================================================================
-- Expected index used: idx_products_price_id
-- Target: Efficient pagination sorted by price

EXPLAIN ANALYZE
SELECT productId, productName, productPrice
FROM products
WHERE (productPrice > 99.99 OR (productPrice = 99.99 AND productId > 1000))
ORDER BY productPrice ASC, productId ASC
LIMIT 20;

-- Record results:
-- WITHOUT indexes: type=___, rows=___, time=___ms
-- WITH indexes:    type=___, rows=___, time=___ms

-- ================================================================================
-- TEST 8: Count Total (Heavy Query)
-- ================================================================================
-- Expected: Index scan instead of table scan
-- Target: FROM 2000ms → 100ms (20x faster)

EXPLAIN ANALYZE
SELECT COUNT(*) as total
FROM products
WHERE category_id = 1;

-- Record results:
-- WITHOUT indexes: type=___, rows=___, time=___ms
-- WITH indexes:    type=___, rows=___, time=___ms

-- ================================================================================
-- SUMMARY TABLE TEMPLATE
-- ================================================================================

-- Copy this table and fill in your results:
/*
+--------+----------------------------------+----------------+----------------+-------------+
| Test # | Query Description                | Without Index  | With Index     | Improvement |
+--------+----------------------------------+----------------+----------------+-------------+
| 1      | Category filter + sort           | ___ms          | ___ms          | ___x        |
| 2      | Price range                      | ___ms          | ___ms          | ___x        |
| 3      | Category + price + sort          | ___ms          | ___ms          | ___x        |
| 4      | Cursor pagination                | ___ms          | ___ms          | ___x        |
| 5      | Full-text search                 | ___ms          | ___ms          | ___x        |
| 6      | Category + price sort            | ___ms          | ___ms          | ___x        |
| 7      | Price pagination                 | ___ms          | ___ms          | ___x        |
| 8      | Count with filter                | ___ms          | ___ms          | ___x        |
+--------+----------------------------------+----------------+----------------+-------------+
| AVG    | Overall improvement              |                |                | ___x        |
+--------+----------------------------------+----------------+----------------+-------------+
*/

-- ================================================================================
-- ADDITIONAL ANALYSIS QUERIES
-- ================================================================================

-- Check which indexes are actually used
SELECT 
  TABLE_NAME,
  INDEX_NAME,
  SEQ_IN_INDEX,
  COLUMN_NAME,
  CARDINALITY,
  INDEX_TYPE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'hqtcsdl'
  AND TABLE_NAME = 'products'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Analyze table to update statistics
ANALYZE TABLE products;

-- Check table size and index size
SELECT 
  TABLE_NAME,
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Total Size (MB)',
  ROUND((DATA_LENGTH / 1024 / 1024), 2) AS 'Data Size (MB)',
  ROUND((INDEX_LENGTH / 1024 / 1024), 2) AS 'Index Size (MB)',
  ROUND((INDEX_LENGTH / DATA_LENGTH * 100), 2) AS 'Index/Data Ratio %'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'hqtcsdl'
  AND TABLE_NAME = 'products';

-- ================================================================================
