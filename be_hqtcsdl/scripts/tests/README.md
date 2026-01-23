# Performance Tests

Benchmark queries for measuring index effectiveness.

## Files

### `products-performance.sql`
8 test cases with `EXPLAIN ANALYZE`:

1. **Category filter + sort** - Tests `idx_products_category_created`
2. **Price range** - Tests `idx_products_price`
3. **Category + price + sort** - Tests `idx_products_category_price_created`
4. **Cursor pagination** - Tests `idx_products_created_id`
5. **Full-text search** - Tests `idx_products_name_fulltext`
6. **Category + price sort** - Tests `idx_products_category_price`
7. **Price pagination** - Tests `idx_products_price_id`
8. **Count with filter** - Tests basic index usage

## Usage

**Run full test suite:**
```sql
SOURCE /docker-entrypoint-initdb.d/tests/products-performance.sql;
```

**Expected results (100k+ products):**

| Test | Without Index | With Index | Improvement |
|------|--------------|------------|-------------|
| 1    | 500ms        | 8ms        | 62x ⚡      |
| 2    | 300ms        | 15ms       | 20x ⚡      |
| 3    | 800ms        | 20ms       | 40x ⚡      |
| 4    | 600ms        | 3ms        | 200x ⚡     |
| 5    | 1000ms       | 30ms       | 33x ⚡      |
| 6    | 400ms        | 12ms       | 33x ⚡      |
| 7    | 500ms        | 5ms        | 100x ⚡     |
| 8    | 2000ms       | 100ms      | 20x ⚡      |

## Workflow

1. Test WITHOUT indexes (baseline)
2. Create indexes
3. Test WITH indexes
4. Compare results
