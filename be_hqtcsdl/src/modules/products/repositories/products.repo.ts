// Products Repository - CRUD operations with Redis caching

import { database } from '../../../infra/database';
import { cacheService, CacheKeyBuilder } from '../../../infra/cache';
import { config } from '../../../config';
import { ProductDetail, CreateProductDto, UpdateProductDto } from '../products.types';

export class ProductsRepo {
  // Get single product by ID with full details
  async findById(id: number): Promise<ProductDetail | null> {
    // Build cache key
    const cacheKey = CacheKeyBuilder.productItem(id);

    // Try cache first
    const cached = await cacheService.get<ProductDetail>(cacheKey);
    if (cached) {
      return cached; // Cache HIT
    }

    // Cache MISS - query database
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

    const [product] = await database.query<ProductDetail[]>(sql, [id]);

    // Store in cache if found
    if (product) {
      await cacheService.set(cacheKey, product, config.redis.ttl.products);
    }

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

    const success = result.affectedRows > 0;

    // Invalidate cache if updated
    if (success) {
      const cacheKey = CacheKeyBuilder.productItem(id);
      await cacheService.del(cacheKey);

      // Also invalidate product lists (they may include this product)
      await cacheService.flushPattern(CacheKeyBuilder.productListsPattern());
    }

    return success;
  }

  // Delete product
  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM products WHERE productId = ?`;
    const result = await database.execute(sql, [id]);

    const success = result.affectedRows > 0;

    // Invalidate cache if deleted
    if (success) {
      const cacheKey = CacheKeyBuilder.productItem(id);
      await cacheService.del(cacheKey);

      // Also invalidate product lists
      await cacheService.flushPattern(CacheKeyBuilder.productListsPattern());
    }

    return success;
  }
}

export const productsRepo = new ProductsRepo();
