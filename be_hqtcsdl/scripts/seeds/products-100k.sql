-- ================================================================================
-- SEED LARGE DATASET FOR PRODUCTS (Performance Testing)
-- ================================================================================
-- Purpose: Generate realistic product data to test index performance
-- Target: 100,000 products across 20 categories
-- Note: Adjust quantities based on your testing needs
-- ================================================================================

-- IMPORTANT: Run this AFTER creating tables but BEFORE creating indexes
-- This ensures fair comparison of query performance

-- ================================================================================
-- STEP 1: Create Categories (if not exists)
-- ================================================================================

INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Computers', 'Laptops, desktops, and computer parts'),
('Phones', 'Mobile phones and accessories'),
('Gaming', 'Gaming consoles and video games'),
('Audio', 'Headphones, speakers, and audio equipment'),
('Cameras', 'Cameras and photography equipment'),
('Wearables', 'Smart watches and fitness trackers'),
('Home', 'Home appliances and smart home devices'),
('Office', 'Office supplies and equipment'),
('Networking', 'Routers, switches, and network equipment'),
('Storage', 'Hard drives, SSDs, and storage devices'),
('Monitors', 'Computer monitors and displays'),
('Accessories', 'Various tech accessories'),
('Software', 'Software and digital products'),
('Components', 'Computer components and parts'),
('Tablets', 'Tablets and e-readers'),
('TV', 'Televisions and streaming devices'),
('Smart Home', 'IoT and smart home products'),
('Cables', 'Cables and adapters'),
('Power', 'Batteries, chargers, and power supplies')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ================================================================================
-- STEP 2: Seed Products (Bulk Insert)
-- ================================================================================
-- This uses a stored procedure for efficient bulk insertion
-- Generates 100,000 products with realistic data

DELIMITER $$

DROP PROCEDURE IF EXISTS seed_products$$

CREATE PROCEDURE seed_products(IN num_products INT)
BEGIN
  DECLARE i INT DEFAULT 0;
  DECLARE batch_size INT DEFAULT 1000;
  DECLARE category_count INT;
  DECLARE random_category INT;
  DECLARE random_price DECIMAL(15,2);
  DECLARE product_name VARCHAR(255);
  DECLARE product_desc TEXT;
  
  -- Get category count
  SELECT COUNT(*) INTO category_count FROM categories;
  
  -- Disable keys for faster insert
  ALTER TABLE products DISABLE KEYS;
  
  SET autocommit = 0;
  
  WHILE i < num_products DO
    -- Random category (1 to category_count)
    SET random_category = FLOOR(1 + RAND() * category_count);
    
    -- Random price between 10.00 and 2000.00
    -- More products in lower price range (realistic distribution)
    SET random_price = ROUND(10 + POW(RAND(), 2) * 1990, 2);
    
    -- Generate product name (varied patterns)
    SET product_name = CONCAT(
      CASE FLOOR(RAND() * 10)
        WHEN 0 THEN 'Premium '
        WHEN 1 THEN 'Professional '
        WHEN 2 THEN 'Wireless '
        WHEN 3 THEN 'Portable '
        WHEN 4 THEN 'Digital '
        WHEN 5 THEN 'Smart '
        WHEN 6 THEN 'Ultra '
        WHEN 7 THEN 'High-Performance '
        WHEN 8 THEN 'Budget '
        ELSE ''
      END,
      CASE FLOOR(RAND() * 15)
        WHEN 0 THEN 'Laptop'
        WHEN 1 THEN 'Mouse'
        WHEN 2 THEN 'Keyboard'
        WHEN 3 THEN 'Monitor'
        WHEN 4 THEN 'Headphones'
        WHEN 5 THEN 'Speaker'
        WHEN 6 THEN 'Camera'
        WHEN 7 THEN 'Tablet'
        WHEN 8 THEN 'Phone'
        WHEN 9 THEN 'Charger'
        WHEN 10 THEN 'Cable'
        WHEN 11 THEN 'Adapter'
        WHEN 12 THEN 'Case'
        WHEN 13 THEN 'Stand'
        ELSE 'Device'
      END,
      ' Model ',
      LPAD(i, 6, '0')
    );
    
    -- Generate description
    SET product_desc = CONCAT(
      'High-quality product with advanced features. ',
      'Item #', i, '. ',
      'Perfect for professional and personal use.'
    );
    
    -- Insert product
    INSERT INTO products (productName, productDescription, productPrice, category_id, created_at)
    VALUES (
      product_name,
      product_desc,
      random_price,
      random_category,
      -- Random date in last 2 years
      DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 730) DAY)
    );
    
    SET i = i + 1;
    
    -- Commit every batch_size records
    IF i % batch_size = 0 THEN
      COMMIT;
      SELECT CONCAT('Inserted ', i, ' / ', num_products, ' products...') AS progress;
    END IF;
  END WHILE;
  
  COMMIT;
  
  -- Re-enable keys
  ALTER TABLE products ENABLE KEYS;
  
  SELECT CONCAT('✅ Successfully seeded ', num_products, ' products!') AS result;
END$$

DELIMITER ;

-- ================================================================================
-- STEP 3: Execute Seeding
-- ================================================================================

-- Seed 100,000 products (adjust number as needed)
-- Estimated time: 30-60 seconds depending on hardware
CALL seed_products(100000);

-- ================================================================================
-- STEP 4: Verify Data
-- ================================================================================

-- Check total products
SELECT COUNT(*) as total_products FROM products;

-- Check distribution across categories
SELECT 
  c.name as category,
  COUNT(p.productId) as product_count,
  ROUND(AVG(p.productPrice), 2) as avg_price,
  ROUND(MIN(p.productPrice), 2) as min_price,
  ROUND(MAX(p.productPrice), 2) as max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY product_count DESC;

-- Check date distribution
SELECT 
  DATE_FORMAT(created_at, '%Y-%m') as month,
  COUNT(*) as products_created
FROM products
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC
LIMIT 12;

-- Check price distribution
SELECT 
  CASE 
    WHEN productPrice < 50 THEN 'Under $50'
    WHEN productPrice < 100 THEN '$50-$100'
    WHEN productPrice < 200 THEN '$100-$200'
    WHEN productPrice < 500 THEN '$200-$500'
    WHEN productPrice < 1000 THEN '$500-$1000'
    ELSE 'Over $1000'
  END as price_range,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM products), 2) as percentage
FROM products
GROUP BY price_range
ORDER BY MIN(productPrice);

-- ================================================================================
-- STEP 5: Update Statistics
-- ================================================================================

-- Important: Update table statistics for query optimizer
ANALYZE TABLE products;
ANALYZE TABLE categories;

-- ================================================================================
-- CLEANUP PROCEDURE
-- ================================================================================

-- If you want to clean up the stored procedure:
-- DROP PROCEDURE IF EXISTS seed_products;

-- ================================================================================
-- NOTES
-- ================================================================================

-- Data characteristics:
-- - 100,000 products (configurable)
-- - 20 categories (evenly distributed)
-- - Price range: $10 - $2000 (weighted towards lower prices)
-- - Created dates: Random over last 2 years
-- - Realistic product names with variety
--
-- This dataset is ideal for testing:
-- - Index effectiveness with large tables
-- - Query performance with filtering/sorting
-- - Pagination with deep offsets
-- - Full-text search performance
--
-- After seeding:
-- 1. Run test-products-performance.sql WITHOUT indexes
-- 2. Create indexes with create-indexes.sql
-- 3. Run test-products-performance.sql WITH indexes
-- 4. Compare results!

-- ================================================================================
