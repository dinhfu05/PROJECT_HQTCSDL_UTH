# Index Management Scripts

Scripts for creating and dropping database indexes.

## Files

### `orders.sql`
Creates 10 indexes for `orders` and `order_items` tables:
- Single-column: `user_id`, `status`, `created_at`, `total_amount`
- Composite: `(user_id, status)`, `(user_id, status, created_at)`, `(status, created_at)`
- Foreign keys: `order_id`, `product_id` in order_items

### `drop-products.sql`
Drops all secondary indexes from `products` table for performance testing.

### `drop-orders.sql`
Drops all secondary indexes from `orders` and `order_items` tables.

## Usage

```sql
-- Create indexes
SOURCE /docker-entrypoint-initdb.d/indexes/orders.sql;

-- Drop indexes (testing only)
SOURCE /docker-entrypoint-initdb.d/indexes/drop-products.sql;
SOURCE /docker-entrypoint-initdb.d/indexes/drop-orders.sql;
```

## Note
Primary indexes in main `create-indexes.sql` file cover products table.
