// Listing Repository - Raw SQL optimized for performance

import { RowDataPacket } from 'mysql2/promise';
import { database } from '../../../infra/database';
import { ListingQuery } from './listing.query';
import { ProductListingItem, CursorData } from './listing.types';

interface ProductRow extends RowDataPacket, ProductListingItem {}

export class ListingRepo {
  // Main listing query - optimized for index usage
  async findProducts(
    query: ListingQuery
  ): Promise<{ products: ProductListingItem[]; db_ms: number; rows_examined?: number }> {
    const startTime = process.hrtime.bigint();

    const where = query.buildWhereClause();
    const cursor = query.buildCursorCondition();
    const orderBy = query.buildOrderByClause();
    const limit = query.getLimit();

    // Build SQL - index-friendly structure
    const sql = `
      SELECT 
        p.productId,
        p.productName,
        p.productPrice,
        p.category_id,
        c.name as category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${where.sql}
      ${cursor.sql}
      ${orderBy}
      LIMIT ?
    `;

    const values = [...where.values, ...cursor.values, limit + 1]; // +1 to check hasMore

    const products = await database.query<ProductRow[]>(sql, values);

    const endTime = process.hrtime.bigint();
    const db_ms = Number(endTime - startTime) / 1_000_000;

    return { products, db_ms };
  }

  // Get ALL products (no pagination/limit)
  async getAllProducts(): Promise<{ products: ProductListingItem[]; db_ms: number }> {
    const startTime = process.hrtime.bigint();

    const sql = `
      SELECT 
        p.productId,
        p.productName,
        p.productPrice,
        p.category_id,
        c.name as category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `;

    const products = await database.query<ProductRow[]>(sql);

    const endTime = process.hrtime.bigint();
    const db_ms = Number(endTime - startTime) / 1_000_000;

    return { products, db_ms };
  }


  // Count total (for first page only, expensive with 1M rows)
  async countTotal(query: ListingQuery): Promise<number> {
    const where = query.buildWhereClause();

    const sql = `
      SELECT COUNT(*) as total
      FROM products p
      ${where.sql}
    `;

    const [result] = await database.query<RowDataPacket[]>(sql, where.values);
    return result?.total || 0;
  }

  // EXPLAIN query for debugging
  async explainQuery(query: ListingQuery): Promise<RowDataPacket[]> {
    const where = query.buildWhereClause();
    const orderBy = query.buildOrderByClause();

    const sql = `
      EXPLAIN
      SELECT p.productId, p.productName, p.productPrice
      FROM products p
      ${where.sql}
      ${orderBy}
      LIMIT 20
    `;

    return database.query<RowDataPacket[]>(sql, where.values);
  }

  // EXPLAIN ANALYZE for performance metrics
  async explainAnalyzeQuery(query: ListingQuery): Promise<RowDataPacket[]> {
    const where = query.buildWhereClause();
    const orderBy = query.buildOrderByClause();

    const sql = `
      EXPLAIN ANALYZE
      SELECT p.productId, p.productName, p.productPrice
      FROM products p
      ${where.sql}
      ${orderBy}
      LIMIT 20
    `;

    return database.query<RowDataPacket[]>(sql, where.values);
  }
}

export const listingRepo = new ListingRepo();
