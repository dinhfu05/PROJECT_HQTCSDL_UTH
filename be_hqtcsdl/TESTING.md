# 🧪 Testing Guide - Performance Demo

Hướng dẫn test từng phase của demo performance optimization.

---

## 📋 **Prerequisites**

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Verify services running
docker ps
# Should see: hqtcsdl-mysql, hqtcsdl-redis

# 3. Seed data (2M products)
npm run db:seed:2m
# Wait 1-2 minutes
```

---

## 🔴 **PHASE 1: Test WITHOUT Composite Indexes**

### **Setup**

```bash
# Drop composite indexes
npm run db:drop
```

### **Test Queries**

**MySQL Shell:**
```bash
npm run db
```

```sql
-- Test 1: Check indexes (should only see PRIMARY + category)
SHOW INDEX FROM products;

-- Test 2: Query with ORDER BY (will be SLOW)
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE category_id = 1 
ORDER BY created_at DESC 
LIMIT 20;

-- Expected results:
-- - actual time: 1500-2000ms
-- - Sort: products.created_at DESC (filesort)
-- - rows: ~200k scanned
```

```sql
-- Test 3: Heavy query to see CPU spike
SELECT BENCHMARK(10, (
  SELECT COUNT(*) FROM products 
  WHERE category_id = 1 
  ORDER BY created_at DESC
));

-- Expected: CPU spike 30-50% in btop
-- Time: 10-20 seconds
```

### **Expected Results**

| Metric | Value |
|--------|-------|
| Query Time | 1500-2000ms |
| CPU Usage | 30-50% |
| Sort Operation | ✅ Yes (filesort) |
| Rows Scanned | ~200k |

---

## ⚡ **PHASE 2: Test WITH Composite Indexes**

### **Setup**

```bash
# Create indexes
npm run db:indexes
```

### **Test Queries**

**MySQL Shell:**
```sql
-- Test 1: Check indexes (should see all indexes)
SHOW INDEX FROM products;
-- Expected: 17 rows (PRIMARY + 10 custom indexes)

-- Test 2: SAME query as Phase 1
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE category_id = 1 
ORDER BY created_at DESC 
LIMIT 20;

-- Expected results:
-- - actual time: 0.3-0.7ms ⚡
-- - Index lookup using idx_products_category_created
-- - NO filesort!
-- - rows: 20 (only 20 scanned!)
```

```sql
-- Test 3: Same benchmark (compare CPU)
SELECT BENCHMARK(10, (
  SELECT COUNT(*) FROM products 
  WHERE category_id = 1 
  ORDER BY created_at DESC
));

-- Expected: CPU 5-10% in btop
-- Time: 1-2 seconds
```

### **Expected Results**

| Metric | Value | Improvement |
|--------|-------|-------------|
| Query Time | 0.3-0.7ms | **~3000x faster** |
| CPU Usage | 5-10% | **70% reduction** |
| Sort Operation | ❌ No (using index) | ✅ |
| Rows Scanned | 20 | **10,000x less** |

---

## 🔴 **PHASE 3: Test Redis Cache**

### **Setup**

```bash
# Start backend server
npm run dev

# Wait for:
# ✅ Redis connected and ready
# 🚀 Server is running on http://localhost:3000
```

### **Test 1: Cache MISS (First Request)**

**Swagger UI:** http://localhost:3000/api-docs

**Or curl:**
```bash
curl -i "http://localhost:3000/products?categoryId=1&limit=20"
```

**Expected Response Headers:**
```
X-Cache: MISS
X-Cache-Hit-Rate: 0%
```

**Expected Response Body:**
```json
{
  "success": true,
  "data": [...],
  "perf": {
    "db_ms": 0.5,
    "total_ms": 2.3
  }
}
```

### **Test 2: Cache HIT (Second Request)**

**Same request:**
```bash
curl -i "http://localhost:3000/products?categoryId=1&limit=20"
```

**Expected Response Headers:**
```
X-Cache: HIT
X-Cache-Hit-Rate: 50%
```

**Expected Response Body:**
```json
{
  "success": true,
  "data": [...],
  "perf": {
    "db_ms": 0,  // ← No database query!
    "total_ms": 0.1  // ← Much faster!
  }
}
```

### **Test 3: Cache Statistics**

**Swagger:** `GET /api/debug/cache/stats`

**Or curl:**
```bash
curl "http://localhost:3000/api/debug/cache/stats"
```

**Expected Response:**
```json
{
  "cache": {
    "hits": 1,
    "misses": 1,
    "total": 2,
    "hitRate": 50.0,
    "isAvailable": true
  },
  "redis": {
    "version": "7.x.x",
    "connected_clients": 1,
    "used_memory_human": "1.2M",
    "keyspace_hits": 1,
    "keyspace_misses": 1
  },
  "isHealthy": true
}
```

### **Test 4: View Cache Keys**

**Swagger:** `GET /api/debug/cache/keys?pattern=*`

**Or curl:**
```bash
curl "http://localhost:3000/api/debug/cache/keys?pattern=products:*"
```

**Expected Response:**
```json
{
  "pattern": "products:*",
  "total": 1,
  "keys": [
    {
      "key": "hqtcsdl:products:list:abc123",
      "ttl": 285
    }
  ]
}
```

### **Test 5: Cache Invalidation**

**Test Update Product:**
```bash
# Update product (should invalidate cache)
curl -X PATCH "http://localhost:3000/products/1" \
  -H "Content-Type: application/json" \
  -d '{"productPrice": 999999}'
```

**Then query again:**
```bash
curl -i "http://localhost:3000/products?categoryId=1&limit=20"
```

**Expected:** `X-Cache: MISS` (cache was invalidated)

### **Test 6: Flush Cache**

**Swagger:** `DELETE /api/debug/cache/flush?pattern=*`

**Or curl:**
```bash
curl -X DELETE "http://localhost:3000/api/debug/cache/flush?pattern=*"
```

**Expected Response:**
```json
{
  "pattern": "*",
  "flushed": 5,
  "message": "Flushed 5 keys"
}
```

### **Test 7: Redis Health Check**

**Swagger:** `GET /api/debug/cache/health`

**Or curl:**
```bash
curl "http://localhost:3000/api/debug/cache/health"
```

**Expected Response:**
```json
{
  "healthy": true,
  "available": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📊 **Performance Comparison Table**

| Phase | Query Time | CPU | Cache Status | Rows Scanned |
|-------|-----------|-----|--------------|--------------|
| **Phase 1** (No composite) | 1500-2000ms | 30-50% | N/A | ~200k |
| **Phase 2** (With indexes) | 0.3-0.7ms | 5-10% | N/A | 20 |
| **Phase 3** (Redis MISS) | 0.5ms | 5-10% | MISS | 20 |
| **Phase 3** (Redis HIT) | <0.1ms | 2-5% | HIT | 0 |

**Total Improvement:** Up to **20,000x faster** (Phase 1 → Phase 3 HIT)

---

## 🧪 **Automated Test Script**

```bash
#!/bin/bash
# test-demo.sh

echo "🧪 Starting Demo Tests..."

# Phase 1
echo "📊 Phase 1: No Composite Indexes"
npm run db:drop
echo "✅ Indexes dropped"

# Phase 2
echo "⚡ Phase 2: With Composite Indexes"
npm run db:indexes
echo "✅ Indexes created"

# Phase 3
echo "🔴 Phase 3: Redis Cache"
echo "Starting server..."
npm run dev &
SERVER_PID=$!
sleep 5

echo "Testing cache MISS..."
curl -s "http://localhost:3000/products?categoryId=1&limit=5" | jq '.perf'

echo "Testing cache HIT..."
curl -s "http://localhost:3000/products?categoryId=1&limit=5" | jq '.perf'

echo "Cache stats:"
curl -s "http://localhost:3000/api/debug/cache/stats" | jq '.cache'

kill $SERVER_PID
echo "✅ All tests completed!"
```

---

## ✅ **Test Checklist**

### **Phase 1**
- [ ] Indexes dropped (only PRIMARY + category)
- [ ] Query time > 1000ms
- [ ] EXPLAIN shows `filesort`
- [ ] CPU spike visible in btop

### **Phase 2**
- [ ] All indexes created (17 rows)
- [ ] Query time < 1ms
- [ ] EXPLAIN shows `Index lookup`
- [ ] No `filesort` in EXPLAIN
- [ ] CPU usage reduced

### **Phase 3**
- [ ] Server starts successfully
- [ ] Redis connected
- [ ] First request: `X-Cache: MISS`
- [ ] Second request: `X-Cache: HIT`
- [ ] Cache stats show hits/misses
- [ ] Cache keys visible
- [ ] Cache invalidation works
- [ ] Flush cache works

---

## 🐛 **Troubleshooting**

### **Redis not connecting**
```bash
# Check Redis container
docker ps | grep redis

# Check Redis logs
docker logs hqtcsdl-redis

# Test Redis connection
docker exec hqtcsdl-redis redis-cli ping
# Should return: PONG
```

### **Cache always MISS**
- Check Redis is running
- Check `REDIS_HOST` and `REDIS_PORT` in config
- Check server logs for Redis errors

### **Query still slow after indexes**
- Run `ANALYZE TABLE products;` to update statistics
- Check `SHOW INDEX FROM products;` to verify indexes exist
- Check EXPLAIN to see which index is used

---

## 📝 **Notes**

- **Cache TTL:** 300 seconds (5 minutes) for products
- **Cache only first page:** Cursor-based pagination is not cached
- **Cache invalidation:** Automatic on product update/delete
- **Debug endpoints:** Only available in `development` mode

---

## 🎯 **Quick Test Commands**

```bash
# Health check
curl http://localhost:3000/health

# Test listing
curl "http://localhost:3000/products?categoryId=1&limit=5"

# Cache stats
curl "http://localhost:3000/api/debug/cache/stats"

# Index info
curl "http://localhost:3000/api/debug/indexes/products"
```
