================================================================================
                          REPOSITORIES LAYER
================================================================================

MỤC ĐÍCH:
---------
Repository layer chịu trách nhiệm giao tiếp trực tiếp với Database.
Tất cả các câu SQL đều nằm ở đây, tách biệt khỏi business logic.

================================================================================
                          CÁC FILE TRONG FOLDER
================================================================================

repositories/
└─ products.repo.ts      # CRUD operations cho từng product

================================================================================
                          PRODUCTS.REPO.TS
================================================================================

CLASS: ProductsRepo
-------------------

┌────────────────────────────────────────────────────────────────────────────┐
│  Method          │  SQL Type  │  Mô tả                                    │
├──────────────────┼────────────┼───────────────────────────────────────────┤
│  findById(id)    │  SELECT    │  Lấy chi tiết 1 sản phẩm theo ID          │
│  create(data)    │  INSERT    │  Tạo sản phẩm mới, trả về insertId        │
│  update(id,data) │  UPDATE    │  Cập nhật sản phẩm, trả về true/false     │
│  delete(id)      │  DELETE    │  Xóa sản phẩm, trả về true/false          │
└────────────────────────────────────────────────────────────────────────────┘

================================================================================
                     PHÂN BIỆT query() vs execute()
================================================================================

Trong mysql2, có 2 phương thức chính:

┌─────────────────────────────────────────────────────────────────────────────┐
│  database.query<T>()                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  - Dùng cho: SELECT                                                         │
│  - Trả về: RowDataPacket[] (mảng các dòng dữ liệu)                          │
│  - Ví dụ:                                                                   │
│      const rows = await database.query<ProductRow[]>(sql, [id]);            │
│      // rows = [{ id: 1, name: "Product A" }, ...]                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  database.execute()                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  - Dùng cho: INSERT, UPDATE, DELETE                                         │
│  - Trả về: ResultSetHeader (thông tin về thao tác)                          │
│  - Ví dụ:                                                                   │
│      const result = await database.execute(sql, [data]);                    │
│      // result = { insertId: 123, affectedRows: 1, ... }                    │
└─────────────────────────────────────────────────────────────────────────────┘

LƯU Ý QUAN TRỌNG:
-----------------
❌ KHÔNG dùng: database.query<ResultSetHeader>(sql, [...])
   → Sẽ gây lỗi TypeScript vì ResultSetHeader không phải mảng!

✅ ĐÚNG: database.execute(sql, [...]) cho INSERT/UPDATE/DELETE

================================================================================
                          INTERFACE DEFINITIONS
================================================================================

// Kết hợp RowDataPacket với ProductDetail để TypeScript hiểu kiểu dữ liệu
interface ProductRow extends RowDataPacket, ProductDetail {}

// Dữ liệu để tạo product mới
interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id: number;
  stock_quantity?: number;
}

// Dữ liệu để cập nhật product (tất cả optional)
interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  original_price?: number;
  category_id?: number;
  stock_quantity?: number;
}

================================================================================
                          CODE EXAMPLE
================================================================================

// === SELECT - Dùng query() ===
async findById(id: number): Promise<ProductDetail | null> {
  const sql = `SELECT * FROM products WHERE id = ?`;
  const [product] = await database.query<ProductRow[]>(sql, [id]);
  return product || null;
}

// === INSERT - Dùng execute() ===
async create(data: CreateProductDto): Promise<number> {
  const sql = `INSERT INTO products (name, price) VALUES (?, ?)`;
  const result = await database.execute(sql, [data.name, data.price]);
  return result.insertId;  // ID của record vừa tạo
}

// === UPDATE - Dùng execute() ===
async update(id: number, data: UpdateProductDto): Promise<boolean> {
  const sql = `UPDATE products SET name = ? WHERE id = ?`;
  const result = await database.execute(sql, [data.name, id]);
  return result.affectedRows > 0;  // true nếu có record được update
}

// === DELETE - Dùng execute() ===
async delete(id: number): Promise<boolean> {
  const sql = `DELETE FROM products WHERE id = ?`;
  const result = await database.execute(sql, [id]);
  return result.affectedRows > 0;  // true nếu có record bị xóa
}

================================================================================
