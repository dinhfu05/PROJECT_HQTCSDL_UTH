// Products Repository - CRUD operations

import { RowDataPacket } from 'mysql2/promise';
import { database } from '../../../infra/database';
import { ProductDetail, CreateProductDto, UpdateProductDto } from '../products.types';

interface ProductRow extends RowDataPacket, ProductDetail {}

export class ProductsRepo {
  // Get single product by ID with full details
  async findById(id: number): Promise<ProductDetail | null> {
    const sql = `
      SELECT 
        p.productId,
        p.productName,
        p.productDescription,
        p.productPrice,
        p.category_id,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.productId = ?
    `;

    const [product] = await database.query<ProductRow[]>(sql, [id]);
    return product || null;
  }

  // Create new product
  async create(data: CreateProductDto): Promise<number> {
    const sql = `
      INSERT INTO products (productName, productDescription, productPrice, category_id)
      VALUES (?, ?, ?, ?)
    `;

    const result = await database.execute(sql, [
      data.productName,
      data.productDescription || null,
      data.productPrice,
      data.category_id,
    ]);

    return result.insertId;
  }

  // Update product
  async update(id: number, data: UpdateProductDto): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.productName !== undefined) {
      fields.push('productName = ?');
      values.push(data.productName);
    }
    if (data.productDescription !== undefined) {
      fields.push('productDescription = ?');
      values.push(data.productDescription);
    }
    if (data.productPrice !== undefined) {
      fields.push('productPrice = ?');
      values.push(data.productPrice);
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(data.category_id);
    }

    if (fields.length === 0) return false;

    fields.push('updated_at = NOW()');
    values.push(id);

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE productId = ?`;
    const result = await database.execute(sql, values);

    return result.affectedRows > 0;
  }

  // Delete product
  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM products WHERE productId = ?`;
    const result = await database.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

export const productsRepo = new ProductsRepo();
