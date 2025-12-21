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
  inStock?: boolean;

  // Sorting
  sortBy?: 'price' | 'created_at' | 'name' | 'sales_count';
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
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name?: string;
  stock_quantity?: number;
  created_at: Date;
}

export interface CursorData {
  id: number;
  sortValue: string | number;
}
