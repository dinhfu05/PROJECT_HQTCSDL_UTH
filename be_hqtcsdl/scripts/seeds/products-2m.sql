-- ================================================================================
-- SEED 2 MILLION PRODUCTS (Fast exponential duplication)
-- ================================================================================
-- Strategy: Insert 1000 base rows, then double repeatedly until 2M
-- Expected time: 1-2 minutes
-- ================================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;

-- Clear existing
TRUNCATE TABLE products;

-- Step 1: Insert 1000 base products
INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT 
    CONCAT(
        ELT(FLOOR(1 + RAND() * 10), 'iPhone','Samsung','Xiaomi','OPPO','MacBook','Dell','HP','Lenovo','Asus','iPad'),
        ' ',
        ELT(FLOOR(1 + RAND() * 10), 'Pro','Ultra','Plus','Lite','Mini','Air','SE','Note','Max','Elite'),
        ' V', FLOOR(10 + RAND() * 90)
    ) as productName,
    'High quality product with great features and warranty.' as productDescription,
    ROUND(100 + RAND() * 50000, 2) as productPrice,
    FLOOR(1 + RAND() * 10) as category_id,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY) as created_at
FROM 
    (SELECT @row := @row + 1 as row_num FROM 
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
        (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c,
        (SELECT @row := 0) r
    ) nums
LIMIT 1000;

SELECT CONCAT('Base: ', COUNT(*), ' products') AS progress FROM products;

-- Step 2: Double until we reach ~2M
-- 1000 -> 2000 -> 4000 -> 8000 -> 16000 -> 32000 -> 64000 -> 128000 -> 256000 -> 512000 -> 1024000 -> 2048000

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-A'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 2: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-B'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 3: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-C'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 4: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-D'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 5: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-E'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 6: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-F'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 7: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-G'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 8: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-H'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 9: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-I'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 10: ', COUNT(*), ' products') AS progress FROM products;

INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
SELECT CONCAT(productName, '-J'), productDescription, productPrice * (0.9 + RAND() * 0.2), category_id, DATE_SUB(created_at, INTERVAL FLOOR(RAND() * 30) DAY) FROM products;
SELECT CONCAT('Step 11: ', COUNT(*), ' products') AS progress FROM products;

-- Re-enable
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- Update stats
ANALYZE TABLE products;

-- Final count
SELECT '✅ DONE!' AS status;
SELECT COUNT(*) AS total_products FROM products;
SELECT category_id, COUNT(*) as count FROM products GROUP BY category_id ORDER BY category_id;
