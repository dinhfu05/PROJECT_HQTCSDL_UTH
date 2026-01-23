# Test Data Seeds

Large datasets for performance testing.

## Files

### `products-100k.sql`
Stored procedure to generate 100,000 realistic products.

**Features:**
- 20 categories (evenly distributed)
- Price range: $10 - $2,000 (realistic weighted distribution)
- Varied product names (Premium Laptop, Wireless Mouse, etc.)
- Random creation dates (last 2 years)
- Batch insert for performance (1000 products/commit)

**Usage:**
```sql
SOURCE /docker-entrypoint-initdb.d/seeds/products-100k.sql;
-- Estimated time: 30-60 seconds
```

**Verification:**
```sql
SELECT COUNT(*) FROM products;
-- Should return: 100000

SELECT category_id, COUNT(*) FROM products GROUP BY category_id;
-- Should show ~5000 products per category
```

## Purpose
Use for testing index performance with large datasets.
Small sample data is in parent `seed-data.sql`.
