// Listing Service - Business logic for product listing

import { ListingQuery } from './listing.query';
import { listingRepo } from './listing.repo';
import { ListingResult, ProductListingItem, CursorData } from './listing.types';

export class ListingService {
  // Main listing method with performance tracking
  async getProducts(
    queryParams: Record<string, unknown>
  ): Promise<ListingResult<ProductListingItem>> {
    const startTime = process.hrtime.bigint();

    const query = new ListingQuery(queryParams);
    const limit = query.getLimit();

    // Execute query
    const { products, db_ms } = await listingRepo.findProducts(query);

    // Check if has more
    const hasMore = products.length > limit;
    const data = hasMore ? products.slice(0, limit) : products;

    // Generate next cursor
    const nextCursor = hasMore ? this.encodeCursor(data[data.length - 1], query) : null;

    const endTime = process.hrtime.bigint();
    const total_ms = Number(endTime - startTime) / 1_000_000;

    return {
      data,
      nextCursor,
      hasMore,
      perf: {
        db_ms: Math.round(db_ms * 100) / 100,
        total_ms: Math.round(total_ms * 100) / 100,
      },
    };
  }

  // Get ALL products without pagination
  async getAllProducts(): Promise<ListingResult<ProductListingItem>> {
    const { products, db_ms } = await listingRepo.getAllProducts();
    
    return {
      data: products,
      nextCursor: null,
      hasMore: false,
      total: products.length,
      perf: {
        db_ms: Math.round(db_ms * 100) / 100,
        total_ms: 0, // Simplified for this simple query
      },
    };
  }


  // Get listing with total count (slower, only for first page)
  async getProductsWithCount(
    queryParams: Record<string, unknown>
  ): Promise<ListingResult<ProductListingItem>> {
    const query = new ListingQuery(queryParams);
    const [result, total] = await Promise.all([
      this.getProducts(queryParams),
      listingRepo.countTotal(query),
    ]);

    return {
      ...result,
      total,
    };
  }

  // EXPLAIN for debugging query performance
  async explainQuery(queryParams: Record<string, unknown>) {
    const query = new ListingQuery(queryParams);
    return listingRepo.explainQuery(query);
  }

  // EXPLAIN ANALYZE for detailed performance
  async explainAnalyzeQuery(queryParams: Record<string, unknown>) {
    const query = new ListingQuery(queryParams);
    return listingRepo.explainAnalyzeQuery(query);
  }

  private encodeCursor(
    lastItem: ProductListingItem,
    query: ListingQuery
  ): string {
    const params = query.getParams();
    const sortBy = params.sortBy || 'created_at';

    const cursorData: CursorData = {
      productId: lastItem.productId,
      sortValue: lastItem[sortBy as keyof ProductListingItem] as string | number,
    };

    return Buffer.from(JSON.stringify(cursorData)).toString('base64');
  }
}

export const listingService = new ListingService();
