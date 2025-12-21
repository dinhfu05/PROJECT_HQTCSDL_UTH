// Cursor-based pagination utilities

export interface CursorData {
  id: number;
  sortValue: string | number;
}

export class Cursor {
  // Encode cursor for next page
  static encode(data: CursorData): string {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  // Decode cursor from request
  static decode(cursor: string): CursorData | null {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8');
      return JSON.parse(decoded) as CursorData;
    } catch {
      return null;
    }
  }

  // Validate cursor format
  static isValid(cursor: string): boolean {
    const decoded = this.decode(cursor);
    return decoded !== null && typeof decoded.id === 'number';
  }
}

// Pagination metadata
export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
  limit: number;
}

// Response with pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  perf?: {
    db_ms: number;
    total_ms: number;
  };
}
