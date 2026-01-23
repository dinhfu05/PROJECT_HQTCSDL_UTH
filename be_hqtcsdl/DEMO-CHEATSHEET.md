# 🎬 Manual Demo Cheatsheet - Terminal Commands

**3-Terminal Setup:** MySQL Shell | API/Scripts | Monitoring

---

## 🚀 **Setup - Open 3 Terminals**

### **Terminal 1: MySQL Shell**
```bash
cd ~/PROJECT_HQTCSDL_UTH/be_hqtcsdl
docker exec -it hqtcsdl-mysql mysql -u root -proot123 hqtcsdl
```

### **Terminal 2: Scripts & API**
```bash
cd ~/PROJECT_HQTCSDL_UTH/be_hqtcsdl
# Ready for commands
```

### **Terminal 3: Monitoring**
```bash
btop
# Filter: Press 'f' then type 'mysql'
```

---

## 📊 **PHASE 1: Baseline (No Indexes)**

### **Terminal 1 (MySQL):**

```sql
-- Verify database
USE hqtcsdl;

-- Check products count
SELECT COUNT(*) FROM products;
-- Expected: 100000

-- Drop all indexes
SOURCE /sql/indexes/drop-products.sql;

-- Verify only PRIMARY remains
SHOW INDEX FROM products;
```

### **Test Query 1: Category Filtering**

```sql
EXPLAIN ANALYZE
SELECT p.*, c.name as category_name 
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.category_id = 1
ORDER BY p.created_at DESC
LIMIT 20;
```

**📌 Look for:**
- `actual time=36.4..36.4` ← ~36ms (SLOW)
- `type=ALL` ← Full table scan
- `rows=100000` ← Scanned all rows
- `Using filesort` ← Extra sorting

### **Test Query 2: Price Range**

```sql
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE productPrice BETWEEN 100.00 AND 500.00
ORDER BY productPrice
LIMIT 20;
```

**📌 Look for:**
- `actual time=78.2` ← ~78ms
- `type=ALL`
- `Using where; Using filesort`

### **Test Query 3: Pagination**

```sql
EXPLAIN ANALYZE
SELECT * FROM products
ORDER BY created_at DESC, productId DESC
LIMIT 20;
```

**📌 Look for:**
- `actual time=65.5` ← ~65ms
- `Using filesort`

### **Terminal 3 (btop):**
- Watch CPU spike to **25-35%** during queries

---

## ⚡ **PHASE 2: With Indexes**

### **Terminal 1 (MySQL):**

```sql
-- Create all indexes
SOURCE /sql/create-indexes.sql;
-- Wait ~15 seconds

-- Update statistics
ANALYZE TABLE products;

-- Verify indexes created
SHOW INDEX FROM products;
-- Expected: 17 rows (10 custom + PRIMARY + foreign keys)

-- List index names
SELECT DISTINCT index_name 
FROM information_schema.statistics 
WHERE table_schema='hqtcsdl' AND table_name='products';
```

### **Re-run Same Queries:**

**Query 1: Category Filtering (AGAIN)**

```sql
EXPLAIN ANALYZE
SELECT p.*, c.name as category_name 
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.category_id = 1
ORDER BY p.created_at DESC
LIMIT 20;
```

**📌 Compare:**
- `actual time=0.507..0.521` ← **0.5ms!** (70x faster!)
- `type=ref` ← Using index!
- `key=idx_products_category_created` ← Which index
- `rows=20` ← Only 20 rows scanned!
- NO "Using filesort" ← Pre-sorted by index

**Query 2: Price Range (AGAIN)**

```sql
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE productPrice BETWEEN 100.00 AND 500.00
ORDER BY productPrice
LIMIT 20;
```

**📌 Compare:**
- `actual time=0.6` ← **130x faster!**
- `type=range`
- `key=idx_products_price`

**Query 3: Pagination (AGAIN)**

```sql
EXPLAIN ANALYZE
SELECT * FROM products
ORDER BY created_at DESC, productId DESC
LIMIT 20;
```

**📌 Compare:**
- `actual time=0.39` ← **170x faster!**
- `type=index`
- `key=idx_products_created_id`

### **Index Storage Analysis:**

```sql
SELECT 
    table_name,
    ROUND(data_length / 1024 / 1024, 2) AS data_mb,
    ROUND(index_length / 1024 / 1024, 2) AS index_mb,
    ROUND((index_length / data_length) * 100, 2) AS index_ratio_pct
FROM information_schema.tables
WHERE table_schema = 'hqtcsdl' AND table_name = 'products';
```

**Expected:**
- data_mb: ~37
- index_mb: ~48
- index_ratio_pct: ~128%

### **Terminal 3 (btop):**
- CPU dropped to **8-12%** ✅

---

## 🔴 **PHASE 3: Redis Cache**

### **Terminal 2 (Scripts):**

**Start Redis:**
```bash
docker-compose up -d redis

# Verify
docker ps | grep redis
# Should see: hqtcsdl-redis running

# Health check
docker exec hqtcsdl-redis redis-cli ping
# Expected: PONG
```

**Start Backend:**
```bash
npm run dev
# Wait for:
# ✅ Redis connected and ready
# 🚀 Server is running on http://localhost:3000
```

**Check Cache Health:**
```bash
curl http://localhost:3000/api/debug/cache/health
```

Expected:
```json
{
  "healthy": true,
  "available": true
}
```

**View Cache Stats:**
```bash
curl http://localhost:3000/api/debug/cache/stats
```

**Test Cache - First Request (MISS):**
```bash
curl -i http://localhost:3000/api/products?category=1
```

Look for header:
```
X-Cache: MISS
```

**Second Request (HIT):**
```bash
curl -i http://localhost:3000/api/products?category=1
```

Look for header:
```
X-Cache: HIT
```

**Monitor Cache Keys:**
```bash
curl http://localhost:3000/api/debug/cache/keys
```

**Flush Cache (Test invalidation):**
```bash
curl -X DELETE "http://localhost:3000/api/debug/cache/flush?pattern=hqtcsdl:products:*"
```

### **Terminal 1 (MySQL - Monitor):**

```sql
-- Watch live queries
SHOW PROCESSLIST;

-- With cache, you'll see FEWER queries
-- First request: SELECT query
-- Second request: NO query (served from cache)
```

### **Terminal 3 (btop):**
- Database CPU: **2-5%** (minimal!)
- Redis process: ~3% CPU

---

## 📊 **Quick Comparison Commands**

### **Run Full Test Suite:**

**Terminal 1 (MySQL):**
```sql
SOURCE /sql/tests/products-performance.sql;
```

This runs all 10 test queries and shows results.

### **Check Individual Index:**

```sql
-- See if index exists
SELECT * FROM information_schema.statistics 
WHERE table_name='products' 
  AND index_name='idx_products_category_created';

-- Check index usage
SHOW INDEX FROM products WHERE Key_name='idx_products_category_created';
```

---

## 🎯 **Demo Flow Checklist**

### **Before Demo:**
- [ ] 3 terminals open
- [ ] MySQL connected (Terminal 1)
- [ ] btop running (Terminal 3)
- [ ] 100k products seeded
- [ ] Redis running

### **Phase 1:**
- [ ] Drop indexes
- [ ] Run baseline queries
- [ ] Point out: `type=ALL`, high time, filesort
- [ ] Show btop CPU spike

### **Phase 2:**
- [ ] Create indexes
- [ ] Re-run same queries
- [ ] Point out: `type=ref`, low time, using index
- [ ] Show btop CPU drop
- [ ] Show index storage

### **Phase 3:**
- [ ] Start backend
- [ ] Call API twice (MISS then HIT)
- [ ] Show cache stats
- [ ] Point out: X-Cache headers
- [ ] Show btop minimal CPU

---

## 💡 **Pro Tips**

### **Clear Screen Between Phases:**
```bash
# In terminal
clear
```

### **Monitor Redis Live:**
```bash
# Terminal 2
docker exec -it hqtcsdl-redis redis-cli MONITOR
# Then make API calls in another terminal
```

### **Check Query Cache:**
```bash
# See all cached keys
docker exec -it hqtcsdl-redis redis-cli KEYS "hqtcsdl:*"

# Get specific key
docker exec -it hqtcsdl-redis redis-cli GET "hqtcsdl:products:list:abc123"
```

### **Restart If Needed:**
```bash
# Reset database
docker-compose restart mysql

# Reset Redis
docker-compose restart redis

# Rebuild indexes
cd ~/PROJECT_HQTCSDL_UTH/be_hqtcsdl
docker exec -i hqtcsdl-mysql mysql -u root -proot123 hqtcsdl < scripts/create-indexes.sql
```

---

## 📈 **Key Metrics to Mention**

| Phase | Query Time | CPU | Rows Scanned |
|-------|-----------|-----|--------------|
| No Index | 30-80ms | 25-35% | 100,000 |
| With Index | 0.4-0.7ms | 8-12% | 20-50 |
| With Redis | <0.1ms | 2-5% | 0 (cached) |

**Improvements:**
- Indexes: **70-170x faster**
- Redis: **+10x** on top of indexes
- Total: **Up to 1700x faster** (no index → cached)

---

## 🎬 **Ready to Demo!**

**Terminal Layout:**
```
┌─────────────────────┬─────────────────────┐
│  Terminal 1         │  Terminal 3         │
│  MySQL Shell        │  btop Monitor       │
│  (Queries)          │  (CPU Watch)        │
│                     │                     │
│  mysql> EXPLAIN...  │  CPU: [████  ] 8%   │
│                     │                     │
└─────────────────────┴─────────────────────┘
┌─────────────────────────────────────────┐
│  Terminal 2 - Scripts & API             │
│  curl, docker, npm commands             │
│                                         │
│  $ curl http://localhost:3000/...      │
└─────────────────────────────────────────┘
```

**Copy commands từng dòng, gõ vào, và explain!** 🎯
