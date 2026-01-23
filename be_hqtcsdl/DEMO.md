# 🚀 Performance Demo Guide - Manual Commands

Complete step-by-step guide to demonstrate database optimization with visual metrics.

---

## 📋 **Prerequisites**

```bash
# Terminal 1: Start backend server
cd be_hqtcsdl
npm run dev

# Terminal 2: Monitor Docker stats (live CPU/memory)
docker stats hqtcsdl-mysql

# Terminal 3: MySQL shell for queries
npm run db
```

---

## 🎬 **Phase 1: Baseline (NO INDEXES)**

### **Step 1: Prepare Database**

```sql
-- Clean slate
USE hqtcsdl;
TRUNCATE TABLE products;

-- Seed 100k products
SOURCE /sql/seeds/products-100k.sql;
-- ⏱️ Expected: ~30-60 seconds

-- Verify data
SELECT COUNT(*) FROM products;
-- Expected: 100000
```

### **Step 2: Drop All Indexes**

```sql
-- Drop indexes (keep only PRIMARY and foreign keys)
SOURCE /sql/indexes/drop-products.sql;

-- Verify: Should only see PRIMARY key
SHOW INDEX FROM products;
```

### **Step 3: Run Performance Tests**

```sql
-- Test 1: Category filtering + sorting
EXPLAIN ANALYZE
SELECT p.*, c.name as category_name 
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.category_id = 1
ORDER BY p.created_at DESC
LIMIT 20;
```

**📊 Expected Results:**
- ⏱️ Time: `30-40ms`
- 🔍 Type: `ALL` (full table scan)
- 📈 Rows scanned: `~100,000`
- ⚠️ Extra: `Using filesort`

```sql
-- Test 2: Price range filtering
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE productPrice BETWEEN 100.00 AND 500.00
ORDER BY productPrice
LIMIT 20;
```

**📊 Expected Results:**
- ⏱️ Time: `70-80ms`
- 🔍 Type: `ALL` (full table scan)
- 📈 Rows scanned: `~100,000`
- ⚠️ Extra: `Using where; Using filesort`

```sql
-- Test 3: Pagination (cursor-based)
EXPLAIN ANALYZE
SELECT * FROM products
ORDER BY created_at DESC, productId DESC
LIMIT 20;
```

**📊 Expected Results:**
- ⏱️ Time: `60-70ms`
- 🔍 Type: `ALL`
- 📈 Rows scanned: `~100,000`
- ⚠️ Extra: `Using filesort`

### **Step 4: Monitor Resources**

```bash
# In Terminal 2 - Watch Docker stats
# Note CPU% and MEM USAGE while queries run
docker stats hqtcsdl-mysql --no-stream
```

**📊 Baseline Metrics:**
- CPU: `15-25%` during queries
- Memory: `~300-400 MB`
- Query time: `30-80ms`

---

## ⚡ **Phase 2: WITH INDEXES**

### **Step 1: Create All Indexes**

```sql
-- Create 10 optimized indexes
SOURCE /sql/create-indexes.sql;
-- ⏱️ Expected: ~15-20 seconds

-- Update table statistics
ANALYZE TABLE products;

-- Verify all indexes created
SHOW INDEX FROM products;
-- Expected: 17 rows (10 custom + PRIMARY + foreign keys)
```

### **Step 2: Check Index Size**

```sql
SELECT 
    table_name,
    ROUND(data_length / 1024 / 1024, 2) AS data_mb,
    ROUND(index_length / 1024 / 1024, 2) AS index_mb,
    ROUND((index_length / data_length) * 100, 2) AS index_ratio
FROM information_schema.tables
WHERE table_schema = 'hqtcsdl' AND table_name = 'products';
```

**📊 Expected:**
- Data: `~37 MB`
- Indexes: `~48 MB`
- Ratio: `~128%` (indexes bigger than data - normal!)

### **Step 3: Re-run Same Tests**

```sql
-- Test 1: Category filtering + sorting (AGAIN)
EXPLAIN ANALYZE
SELECT p.*, c.name as category_name 
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.category_id = 1
ORDER BY p.created_at DESC
LIMIT 20;
```

**📊 Expected Results:**
- ⏱️ Time: `0.5ms` ✅ **70x faster!**
- 🔍 Type: `ref` (using index)
- 📈 Index used: `idx_products_category_created`
- ✅ No filesort!

```sql
-- Test 2: Price range filtering (AGAIN)
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE productPrice BETWEEN 100.00 AND 500.00
ORDER BY productPrice
LIMIT 20;
```

**📊 Expected Results:**
- ⏱️ Time: `0.6ms` ✅ **130x faster!**
- 🔍 Type: `range`
- 📈 Index used: `idx_products_price`
- ✅ No filesort!

```sql
-- Test 3: Pagination (AGAIN)
EXPLAIN ANALYZE
SELECT * FROM products
ORDER BY created_at DESC, productId DESC
LIMIT 20;
```

**📊 Expected Results:**
- ⏱️ Time: `0.4ms` ✅ **170x faster!**
- 🔍 Type: `index scan`
- 📈 Index used: `idx_products_created_id`
- ✅ Direct index read!

### **Step 4: Advanced Test - FULLTEXT Search**

```sql
-- This would ERROR without index, now works!
EXPLAIN ANALYZE
SELECT * FROM products
WHERE MATCH(productName) AGAINST('iPhone')
LIMIT 20;
```

**📊 Expected:**
- ⏱️ Time: `0.07ms` ✅
- 🔍 Type: `fulltext`
- 📈 Index: `idx_products_name_fulltext`

### **Step 5: Monitor Resources Again**

```bash
docker stats hqtcsdl-mysql --no-stream
```

**📊 With Indexes:**
- CPU: `5-10%` ✅ **Lower!**
- Memory: `~450 MB` (indexes cached)
- Query time: `0.4-0.7ms` ✅ **50-170x improvement**

---

## 📊 **Visual Comparison Commands**

### **Side-by-side Query Comparison**

```sql
-- Run full test suite
SOURCE /sql/tests/products-performance.sql;
```

**Compare table at the end:**

| Test | Without Index | With Index | Improvement |
|------|---------------|------------|-------------|
| Category + sort | 36ms | 0.5ms | 70x ⚡ |
| Price range | 78ms | 0.6ms | 130x ⚡ |
| Pagination | 65ms | 0.4ms | 170x ⚡ |
| FULLTEXT | ERROR ❌ | 0.07ms | WORKS ✅ |

### **Index Usage Analysis**

```sql
-- See which queries use which indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY,
    INDEX_TYPE
FROM information_schema.statistics
WHERE TABLE_SCHEMA = 'hqtcsdl' 
  AND TABLE_NAME = 'products'
  AND INDEX_NAME != 'PRIMARY'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;
```

---

## 🔴 **Phase 3: WITH REDIS CACHE (Future)**

> **Note:** Redis integration will be implemented in Phase 2 of the project.

### **Expected Workflow:**

```bash
# Terminal 4: Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Update .env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **Expected Improvements:**

```sql
-- First query: Hit database (0.5ms)
SELECT * FROM products WHERE category_id = 1 LIMIT 20;

-- Cached in Redis with TTL=60s

-- Second query: Hit Redis (<0.1ms)
-- No database query at all!
```

**📊 Expected Metrics with Redis:**
- CPU: `2-5%` ✅ **Minimal!**
- Query time: `<0.1ms` for cached queries
- Database load: Reduced by 80-90%

---

## 🎯 **Quick Reference: Key Commands**

### **Database Connection**
```bash
npm run db                  # Quick connect
make db                     # Alternative
```

### **Data Management**
```bash
npm run db:seed            # Seed 100k products
npm run db:test            # Run performance tests
npm run db:indexes         # Create indexes
npm run db:drop            # Drop indexes
```

### **Monitoring**
```bash
# Live stats
docker stats hqtcsdl-mysql

# Check indexes
SHOW INDEX FROM products;

# Table size
SELECT 
  ROUND(data_length/1024/1024, 2) AS data_mb,
  ROUND(index_length/1024/1024, 2) AS index_mb
FROM information_schema.tables 
WHERE table_name = 'products';
```

### **Performance Testing**
```sql
-- Single query test
EXPLAIN ANALYZE <YOUR_QUERY>;

-- Full test suite
SOURCE /sql/tests/products-performance.sql;
```

---

## 📸 **Demo Script - What to Show**

### **Act 1: Problem (No Indexes)**
1. Show table with 100k rows
2. Run query → Show `EXPLAIN ANALYZE` output
3. Point out: `type=ALL`, `rows=100000`, `Using filesort`
4. Show timing: `70ms`
5. Check CPU in `docker stats`

### **Act 2: Solution (Indexes)**
1. Create indexes → Show creation time
2. Run SAME query again
3. Point out: `type=ref`, `using index`, NO filesort
4. Show timing: `0.5ms` → **130x faster!**
5. Check CPU again → **Lower!**

### **Act 3: Ultimate (Redis - Future)**
1. First request → DB query (0.5ms)
2. Cache in Redis
3. Second request → Redis hit (<0.1ms)
4. Show `docker stats redis` → minimal CPU

---

## 💡 **Pro Tips for Demo**

1. **Use `\G` for vertical output:**
   ```sql
   EXPLAIN ANALYZE SELECT ...\G
   -- Easier to read!
   ```

2. **Clear screen between tests:**
   ```sql
   \! clear
   ```

3. **Time queries:**
   ```sql
   SET profiling = 1;
   SELECT ...
   SHOW PROFILES;
   ```

4. **Watch live:**
   ```bash
   watch -n 1 'docker stats --no-stream hqtcsdl-mysql'
   ```

---

## 🎬 **Ready to Demo!**

Open 3 terminals:
1. **Server** (`npm run dev`)
2. **Monitoring** (`docker stats`)
3. **MySQL** (`npm run db`)

Follow the phases above and demonstrate the dramatic performance improvements! 🚀
