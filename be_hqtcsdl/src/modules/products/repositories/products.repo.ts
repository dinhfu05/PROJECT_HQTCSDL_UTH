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
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.category_id,
        c.name as category_name,
        p.stock_quantity,
        p.sales_count,
        p.rating,
        p.location,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;

    const [product] = await database.query<ProductRow[]>(sql, [id]);
    return product || null;
  }

  // Create new product
  async create(data: CreateProductDto): Promise<number> {
    const sql = `
      INSERT INTO products (name, description, price, original_price, category_id, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await database.execute(sql, [
      data.name,
      data.description || null,
      data.price,
      data.original_price || null,
      data.category_id,
      data.stock_quantity || 0,
    ]);

    return result.insertId;
  }

  // Update product
  async update(id: number, data: UpdateProductDto): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.price !== undefined) {
      fields.push('price = ?');
      values.push(data.price);
    }
    if (data.original_price !== undefined) {
      fields.push('original_price = ?');
      values.push(data.original_price);
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(data.category_id);
    }
    if (data.stock_quantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(data.stock_quantity);
    }

    if (fields.length === 0) return false;

    fields.push('updated_at = NOW()');
    values.push(id);

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    const result = await database.execute(sql, values);

    return result.affectedRows > 0;
  }

  // Delete product
  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM products WHERE id = ?`;
    const result = await database.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

export const productsRepo = new ProductsRepo();
