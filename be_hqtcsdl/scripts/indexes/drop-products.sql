-- ================================================================================
-- DROP INDEXES FOR PRODUCTS TABLE (Safe version)
-- ================================================================================
-- Purpose: Remove all secondary indexes for performance testing
-- WARNING: Only for development/testing! Never run in production!
-- ================================================================================

-- Use procedure to safely drop indexes (ignore if not exists)
DELIMITER //

CREATE PROCEDURE drop_index_if_exists(IN idx_name VARCHAR(64))
BEGIN
    DECLARE CONTINUE HANDLER FOR 1091 BEGIN END;  -- Ignore "index doesn't exist" error
    SET @sql = CONCAT('DROP INDEX ', idx_name, ' ON products');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //

DELIMITER ;

-- Drop all indexes safely
CALL drop_index_if_exists('idx_products_price_id');
CALL drop_index_if_exists('idx_products_created_id');
CALL drop_index_if_exists('idx_products_category_price_created');
CALL drop_index_if_exists('idx_products_category_price');
CALL drop_index_if_exists('idx_products_category_created');
CALL drop_index_if_exists('idx_products_name_fulltext');
CALL drop_index_if_exists('idx_products_name');
CALL drop_index_if_exists('idx_products_created');
CALL drop_index_if_exists('idx_products_price');

-- Cleanup procedure
DROP PROCEDURE IF EXISTS drop_index_if_exists;

-- Show remaining indexes
SELECT '✅ Indexes dropped!' AS status;
SHOW INDEX FROM products;
