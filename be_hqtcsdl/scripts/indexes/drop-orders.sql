-- ================================================================================
-- DROP INDEXES FOR ORDERS & ORDER_ITEMS TABLES
-- ================================================================================
-- Purpose: Remove indexes for testing performance comparison
-- Use case: Compare query speed WITH vs WITHOUT indexes
-- WARNING: Only run this in development/testing environment!
-- ================================================================================

-- IMPORTANT: Always keep PRIMARY KEYs! Only drop secondary indexes

-- ================================================================================
-- DROP ORDER_ITEMS INDEXES FIRST (Dependencies)
-- ================================================================================

-- Drop composite index
DROP INDEX IF EXISTS idx_order_items_order_product ON order_items;

-- Drop foreign key indexes
DROP INDEX IF EXISTS idx_order_items_product_id ON order_items;
DROP INDEX IF EXISTS idx_order_items_order_id ON order_items;

-- ================================================================================
-- DROP ORDERS INDEXES
-- ================================================================================

-- Drop composite indexes (order matters - most complex first)
DROP INDEX IF EXISTS idx_orders_user_status_created ON orders;
DROP INDEX IF EXISTS idx_orders_status_created ON orders;
DROP INDEX IF EXISTS idx_orders_user_status ON orders;

-- Drop single-column indexes
DROP INDEX IF EXISTS idx_orders_total_amount ON orders;
DROP INDEX IF EXISTS idx_orders_created_at ON orders;
DROP INDEX IF EXISTS idx_orders_status ON orders;
DROP INDEX IF EXISTS idx_orders_user_id ON orders;

-- ================================================================================
-- VERIFY INDEXES DROPPED
-- ================================================================================

-- Run these to verify only PRIMARY KEY remains:
-- SHOW INDEX FROM orders;
-- SHOW INDEX FROM order_items;

-- Expected output: Only PRIMARY and AUTO_INCREMENT indexes

-- ================================================================================
-- TESTING WORKFLOW
-- ================================================================================

-- Step 1: Drop indexes
-- SOURCE /path/to/drop-indexes-orders.sql;

-- Step 2: Run test queries and record time
-- SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';
-- (Record execution time from EXPLAIN ANALYZE)

-- Step 3: Re-create indexes  
-- SOURCE /path/to/create-indexes-orders.sql;

-- Step 4: Run same queries and compare time
-- SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';
-- (Compare execution time - should be 50-100x faster!)

-- ================================================================================
