// Query parser for listing - handles sort/filter/cursor

import { ListingQueryParams, CursorData } from './listing.types';

export class ListingQuery {
  private params: ListingQueryParams;

  constructor(query: Record<string, unknown>) {
    this.params = this.parseQuery(query);
  }

  private parseQuery(query: Record<string, unknown>): ListingQueryParams {
    return {
      cursor: query.cursor as string | undefined,
      limit: Math.min(Number(query.limit) || 20, 100), // Max 100

      // Filters
      categoryId: query.categoryId ? Number(query.categoryId) : undefined,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      search: query.search as string | undefined,

      // Sorting
      sortBy: this.parseSortBy(query.sortBy as string),
      sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    };
  }

  private parseSortBy(
    sortBy?: string
  ): 'productPrice' | 'created_at' | 'productName' {
    const allowed = ['productPrice', 'created_at', 'productName'];
    return allowed.includes(sortBy || '')
      ? (sortBy as 'productPrice' | 'created_at' | 'productName')
      : 'created_at';
  }

  getParams(): ListingQueryParams {
    return this.params;
  }

  // Build WHERE clause for SQL
  buildWhereClause(): { sql: string; values: unknown[] } {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (this.params.categoryId) {
      conditions.push('p.category_id = ?');
      values.push(this.params.categoryId);
    }

    if (this.params.minPrice !== undefined) {
      conditions.push('p.productPrice >= ?');
      values.push(this.params.minPrice);
    }

    if (this.params.maxPrice !== undefined) {
      conditions.push('p.productPrice <= ?');
      values.push(this.params.maxPrice);
    }

    if (this.params.search) {
      // Use FULLTEXT if available, fallback to LIKE
      conditions.push('p.productName LIKE ?');
      values.push(`%${this.params.search}%`);
    }

    return {
      sql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values,
    };
  }

  // Build ORDER BY clause
  buildOrderByClause(): string {
    const { sortBy, sortOrder } = this.params;
    return `ORDER BY p.${sortBy} ${sortOrder?.toUpperCase()}, p.productId ${sortOrder?.toUpperCase()}`;
  }

  // Decode cursor for pagination
  decodeCursor(): CursorData | null {
    if (!this.params.cursor) return null;

    try {
      const decoded = Buffer.from(this.params.cursor, 'base64').toString('utf8');
      return JSON.parse(decoded) as CursorData;
    } catch {
      return null;
    }
  }

  // Build cursor condition for WHERE clause
  buildCursorCondition(): { sql: string; values: unknown[] } {
    const cursor = this.decodeCursor();
    if (!cursor) return { sql: '', values: [] };

    const { sortBy, sortOrder } = this.params;
    const operator = sortOrder === 'desc' ? '<' : '>';

    // Composite cursor: (sortValue, productId) for stable pagination
    return {
      sql: `AND (p.${sortBy} ${operator} ? OR (p.${sortBy} = ? AND p.productId ${operator} ?))`,
      values: [cursor.sortValue, cursor.sortValue, cursor.productId],
    };
  }

  getLimit(): number {
    return this.params.limit || 20;
  }
}
