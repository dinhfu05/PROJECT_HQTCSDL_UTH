================================================================================
                               SEEDS FOLDER
================================================================================

MỤC ĐÍCH:
---------
Tạo 1 TRIỆU records để test query performance.
ĐÂY LÀ BƯỚC QUAN TRỌNG NHẤT!

================================================================================
                        FOCUS: QUERY PERFORMANCE
================================================================================

DỮ LIỆU CẦN TẠO:
----------------
1. Products: 1,000,000 records  ← QUAN TRỌNG NHẤT
2. Categories: 100 records
3. Users: 10,000 records
4. Orders: 100,000 records
5. Order_items: 300,000 records
6. Inventory: 1,000,000 records (1 per product)

CÁCH TẠO 1 TRIỆU RECORDS NHANH:
-------------------------------

1. SỬ DỤNG BATCH INSERT (không insert từng record)
   
   INSERT INTO products (name, price, category_id) VALUES
   ('Product 1', 10.00, 1),
   ('Product 2', 20.00, 2),
   ... (1000 records per batch)
   
   → 1000 batches × 1000 records = 1 triệu

2. SỬ DỤNG FAKER LIBRARY
   
   npm install @faker-js/faker
   
   import { faker } from '@faker-js/faker';
   
   for (let batch = 0; batch < 1000; batch++) {
       const values = [];
       for (let i = 0; i < 1000; i++) {
           values.push([
               faker.commerce.productName(),
               faker.commerce.price(),
               faker.number.int({ min: 1, max: 100 })
           ]);
       }
       await database.execute(
           'INSERT INTO products (name, price, category_id) VALUES ?',
           [values]
       );
       console.log(`Batch ${batch + 1}/1000`);
   }

3. DISABLE INDEXES TRƯỚC KHI SEED (nhanh hơn 10x!)
   
   ALTER TABLE products DISABLE KEYS;
   -- Insert 1 triệu records
   ALTER TABLE products ENABLE KEYS;

THỜI GIAN ƯỚC TÍNH:
-------------------
- Có indexes: 30-60 phút
- Không indexes: 3-5 phút
- Recommend: Tắt indexes, seed, bật lại indexes

================================================================================
