// Listing types for product filtering, sorting, pagination

export interface ListingQueryParams {
  // Pagination
  cursor?: string;
  limit?: number;

  // Filtering
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;

  // Sorting
  sortBy?: 'productPrice' | 'created_at' | 'productName';
  sortOrder?: 'asc' | 'desc';
}

export interface ListingResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
  perf: {
    db_ms: number;
    total_ms: number;
    rows_examined?: number;
  };
}

export interface ProductListingItem {
  productId: number;
  productName: string;
  productPrice: number;
  category_id: number;
  category_name?: string;
  created_at: Date;
}

export interface CursorData {
  productId: number;
  sortValue: string | number;
}
