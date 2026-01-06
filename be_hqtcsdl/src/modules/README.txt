================================================================================
                             MODULES FOLDER
================================================================================

MỤC ĐÍCH:
---------
Chứa tất cả business logic modules của ecommerce.

CẤU TRÚC:
---------
modules/
├── users/        - User management (sample)
├── products/     - 🔥 QUAN TRỌNG NHẤT
│   └── listing/  - Hot path cho benchmark
├── categories/   - Product categories
├── orders/       - Order management
└── inventory/    - Stock management

FOCUS CHO PERFORMANCE:
----------------------
⭐ products/listing/ - Đây là nơi benchmark <1M vs 1M records

CÁC MODULE KHÁC:
----------------
Có README.txt riêng với hướng dẫn query performance cụ thể.

================================================================================
