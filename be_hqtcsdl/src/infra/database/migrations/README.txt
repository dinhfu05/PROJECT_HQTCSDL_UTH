================================================================================
                              MIGRATIONS FOLDER
================================================================================

MỤC ĐÍCH:
---------
Folder này chứa các file SQL để quản lý thay đổi cấu trúc database theo thời gian.

CÁCH DÙNG:
----------
- Mỗi file đặt tên theo format: YYYYMMDD_HHMMSS_ten_migration.sql
  Ví dụ: 20241221_120000_create_products_table.sql

- Mỗi migration chỉ chứa MỘT thay đổi:
  + Tạo bảng mới
  + Thêm/xóa cột
  + Thêm/xóa index
  + Thay đổi constraint

TẠI SAO CẦN MIGRATIONS:
-----------------------
1. Theo dõi lịch sử thay đổi database
2. Dễ dàng rollback nếu có lỗi
3. Đồng bộ database giữa các môi trường (dev, staging, production)
4. Làm việc nhóm dễ dàng hơn

VÍ DỤ FILE MIGRATION:
---------------------
-- Migration: Create products table
-- Date: 2024-12-21

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    -- ... other fields
    INDEX idx_name (name)
) ENGINE=InnoDB;

================================================================================
