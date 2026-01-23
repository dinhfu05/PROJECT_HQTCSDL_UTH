import crypto from 'crypto';

/**
 * Cache Key Builder
 * Standardized cache key generation for consistent naming
 */
export class CacheKeyBuilder {
    private static readonly PREFIX = 'hqtcsdl';

    /**
     * Create hash from object for consistent keys
     */
    private static hashObject(obj: any): string {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        return crypto.createHash('md5').update(str).digest('hex').substring(0, 8);
    }

    /**
     * Products list cache key
     * Pattern: hqtcsdl:products:list:{params_hash}
     */
    static productList(params: {
        category_id?: number;
        sort?: string;
        page?: number;
        limit?: number;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
    }): string {
        const hash = this.hashObject(params);
        return `${this.PREFIX}:products:list:${hash}`;
    }

    /**
     * Single product cache key
     * Pattern: hqtcsdl:products:item:{id}
     */
    static productItem(id: number): string {
        return `${this.PREFIX}:products:item:${id}`;
    }

    /**
     * Product search results
     * Pattern: hqtcsdl:products:search:{query}:{params_hash}
     */
    static productSearch(query: string, params: { page?: number; limit?: number }): string {
        const hash = this.hashObject(params);
        const querySlug = query.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
        return `${this.PREFIX}:products:search:${querySlug}:${hash}`;
    }

    /**
     * Category cache key
     * Pattern: hqtcsdl:categories:item:{id}
     */
    static categoryItem(id: number): string {
        return `${this.PREFIX}:categories:item:${id}`;
    }

    /**
     * All categories list
     * Pattern: hqtcsdl:categories:list
     */
    static categoriesList(): string {
        return `${this.PREFIX}:categories:list`;
    }

    /**
     * User cache key
     * Pattern: hqtcsdl:users:item:{id}
     */
    static userItem(id: number): string {
        return `${this.PREFIX}:users:item:${id}`;
    }

    /**
     * Pattern for flushing all product caches
     */
    static productsPattern(): string {
        return `${this.PREFIX}:products:*`;
    }

    /**
     * Pattern for flushing product lists only
     */
    static productListsPattern(): string {
        return `${this.PREFIX}:products:list:*`;
    }

    /**
     * Pattern for flushing product searches
     */
    static productSearchPattern(): string {
        return `${this.PREFIX}:products:search:*`;
    }

    /**
     * Pattern for flushing all caches
     */
    static allPattern(): string {
        return `${this.PREFIX}:*`;
    }
}
