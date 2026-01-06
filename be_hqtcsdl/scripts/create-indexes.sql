-- Create Indexes for Performance Optimization
-- Run this script to optimize queries and see changes in EXPLAIN output
-- NOTE: Indexes are most effective with LARGE datasets (>10k rows).
-- For small datasets, MySQL Optimizer might still choose "Table Scan" (type: ALL) because it's faster.

-- 1. Index for filtering by Category (Foreign Key)
-- Helps: WHERE category_id = ?
CREATE INDEX idx_products_category ON products(category_id);

-- 2. Index for Sorting/Filtering by Price
-- Helps: WHERE productPrice > ? ORDER BY productPrice
CREATE INDEX idx_products_price ON products(productPrice);

-- 3. Composite Index for Sorting by Created Date (Default sort)
-- Helps: ORDER BY created_at DESC
CREATE INDEX idx_products_created ON products(created_at);

-- 4. Fulltext Index for Searching by Name
-- Helps: WHERE MATCH(productName) AGAINST(?)
-- Note: MySQL requires FULLTEXT index for MATCH(...) syntax, otherwise use LIKE with normal index
CREATE FULLTEXT INDEX idx_products_name_fulltext ON products(productName);
