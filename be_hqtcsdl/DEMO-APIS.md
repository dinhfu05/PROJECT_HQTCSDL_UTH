# 🎯 API Endpoints cho Demo

## 📋 **Tổng quan API**

### **Base URL**
- Development: `http://localhost:3002`
- Swagger Docs: `http://localhost:3002/api-docs`

---

## 🛍️ **Products APIs**

### **1. GET /products**
**Mục đích:** List products với filter, sort, pagination (CÓ CACHE)

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `categoryId` - Filter theo category
- `minPrice` - Giá tối thiểu
- `maxPrice` - Giá tối đa
- `search` - Tìm kiếm theo tên
- `sortBy` - `productPrice` | `created_at` | `productName`
- `sortOrder` - `asc` | `desc`
- `cursor` - Cursor cho pagination

**Ví dụ:**
```bash
# Lần 1: Cache MISS (query DB)
curl "http://localhost:3002/products?categoryId=1&limit=20"

# Lần 2: Cache HIT (từ Redis)
curl "http://localhost:3002/products?categoryId=1&limit=20"
```

**Response Headers:**
- `X-Cache: HIT` hoặc `X-Cache: MISS`
- `X-Cache-Hit-Rate: 50%`

**Response:**
```json
{
  "success": true,
  "data": [...],
  "nextCursor": "...",
  "hasMore": true,
  "perf": {
    "db_ms": 0.5,
    "total_ms": 2.3
  }
}
```

---

### **2. GET /products/:id**
**Mục đích:** Lấy chi tiết 1 product (CÓ CACHE)

**Ví dụ:**
```bash
curl "http://localhost:3002/products/1"
```

---

### **3. GET /products/all**
**Mục đích:** Lấy TẤT CẢ products (không pagination, CÓ CACHE)

**Ví dụ:**
```bash
curl "http://localhost:3002/products/all"
```

---

### **4. GET /products/explain**
**Mục đích:** Debug query plan (EXPLAIN)

**Ví dụ:**
```bash
curl "http://localhost:3002/products/explain?categoryId=1"
```

---

### **5. GET /products/explain-analyze**
**Mục đích:** Debug query performance (EXPLAIN ANALYZE)

**Ví dụ:**
```bash
curl "http://localhost:3002/products/explain-analyze?categoryId=1"
```

---

## 🔧 **Debug APIs** (Development only)

### **Cache Debug**

#### **GET /api/debug/cache/health**
Kiểm tra Redis health
```bash
curl "http://localhost:3002/api/debug/cache/health"
```

#### **GET /api/debug/cache/stats**
Xem cache statistics
```bash
curl "http://localhost:3002/api/debug/cache/stats"
```

#### **GET /api/debug/cache/keys?pattern=products:***
List tất cả cache keys
```bash
curl "http://localhost:3002/api/debug/cache/keys?pattern=products:*"
```

#### **DELETE /api/debug/cache/flush?pattern=products:***
Xóa cache theo pattern
```bash
curl -X DELETE "http://localhost:3002/api/debug/cache/flush?pattern=products:*"
```

#### **DELETE /api/debug/cache/flush-all**
Xóa toàn bộ cache
```bash
curl -X DELETE "http://localhost:3002/api/debug/cache/flush-all"
```

---

### **Index Debug**

#### **GET /api/debug/indexes/:table**
Xem indexes của table
```bash
curl "http://localhost:3002/api/debug/indexes/products"
```

#### **GET /api/debug/indexes**
Xem tất cả indexes
```bash
curl "http://localhost:3002/api/debug/indexes"
```

#### **GET /api/debug/indexes/check/:table/:index**
Kiểm tra index có tồn tại không
```bash
curl "http://localhost:3002/api/debug/indexes/check/products/idx_products_category_created"
```

---

## 🎬 **Demo Script - API Commands**

### **Phase 1: No Indexes (MySQL Shell)**
```sql
-- Drop indexes
SOURCE /docker-entrypoint-initdb.d/indexes/drop-products.sql;

-- Test query
EXPLAIN ANALYZE
SELECT * FROM products WHERE category_id = 1 ORDER BY created_at DESC LIMIT 20;
```

### **Phase 2: With Indexes (MySQL Shell)**
```sql
-- Create indexes
SOURCE /docker-entrypoint-initdb.d/create-indexes.sql;

-- Test same query
EXPLAIN ANALYZE
SELECT * FROM products WHERE category_id = 1 ORDER BY created_at DESC LIMIT 20;
```

### **Phase 3: With Redis (API + Shell)**

**Terminal 1: Start Backend**
```bash
cd be_hqtcsdl
npm run dev
```

**Terminal 2: Test API**
```bash
# Request 1: Cache MISS
curl -i "http://localhost:3002/products?categoryId=1&limit=20"
# Look for: X-Cache: MISS

# Request 2: Cache HIT
curl -i "http://localhost:3002/products?categoryId=1&limit=20"
# Look for: X-Cache: HIT

# Check cache stats
curl "http://localhost:3002/api/debug/cache/stats"

# View cache keys
curl "http://localhost:3002/api/debug/cache/keys?pattern=products:*"
```

**Terminal 3: MySQL Monitor**
```sql
-- Watch queries
SHOW PROCESSLIST;
-- With cache, you'll see FEWER queries
```

---

## 📊 **Key Metrics để Demo**

| Phase | Query Time | CPU | Cache Status |
|-------|-----------|-----|--------------|
| No Index | 30-80ms | 25-35% | N/A |
| With Index | 0.4-0.7ms | 8-12% | N/A |
| With Redis | <0.1ms (cached) | 2-5% | HIT |

---

## ✅ **Checklist trước Demo**

- [ ] Docker containers đang chạy: `docker ps`
- [ ] MySQL: `docker exec -it hqtcsdl-mysql mysql -u root -proot123 hqtcsdl`
- [ ] Redis: `docker exec hqtcsdl-redis redis-cli ping` → `PONG`
- [ ] Backend: `npm run dev` → Server running
- [ ] Data: 100k products đã seed
- [ ] btop: Đang monitor CPU

---

## 🚀 **Quick Test Commands**

```bash
# Health check
curl "http://localhost:3002/health"

# Test listing (no cache)
curl "http://localhost:3002/products?limit=5"

# Test cache
curl -i "http://localhost:3002/products?categoryId=1" | grep X-Cache

# Cache stats
curl "http://localhost:3002/api/debug/cache/stats"

# Index info
curl "http://localhost:3002/api/debug/indexes/products"
```
