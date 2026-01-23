import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HQTCSDL Product API',
      version,
      description: 'API documentation for Product Management, Listing, Cache & Performance Demo',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development Server',
      },
    ],
    tags: [
      { name: 'Products', description: 'Product CRUD operations' },
      { name: 'Listing', description: 'Product listing with filter/sort/pagination' },
      { name: 'Cache Debug', description: 'Redis cache monitoring' },
      { name: 'Index Debug', description: 'Database index monitoring' },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            productId: { type: 'integer', example: 1 },
            productName: { type: 'string', example: 'iPhone 15' },
            productDescription: { type: 'string', example: 'Latest Apple iPhone' },
            productPrice: { type: 'number', example: 25000000 },
            category_id: { type: 'integer', example: 1 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        ListingResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { 
              type: 'array', 
              items: { $ref: '#/components/schemas/Product' }
            },
            nextCursor: { type: 'string', nullable: true },
            hasMore: { type: 'boolean' },
            perf: {
              type: 'object',
              properties: {
                db_ms: { type: 'number', example: 0.5 },
                total_ms: { type: 'number', example: 2.3 },
              }
            }
          }
        },
        CacheStats: {
          type: 'object',
          properties: {
            cache: {
              type: 'object',
              properties: {
                hits: { type: 'integer', example: 10 },
                misses: { type: 'integer', example: 5 },
                hitRate: { type: 'number', example: 66.67 },
              }
            },
            isHealthy: { type: 'boolean', example: true },
          }
        }
      },
    },
    paths: {
      '/api/debug/cache/stats': {
        get: {
          tags: ['Cache Debug'],
          summary: 'Get cache statistics',
          description: 'Returns hit/miss counts and hit rate',
          responses: {
            200: {
              description: 'Cache statistics',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CacheStats' }
                }
              }
            }
          }
        }
      },
      '/api/debug/cache/health': {
        get: {
          tags: ['Cache Debug'],
          summary: 'Check Redis health',
          responses: {
            200: { description: 'Redis is healthy' },
            503: { description: 'Redis is unavailable' }
          }
        }
      },
      '/api/debug/cache/keys': {
        get: {
          tags: ['Cache Debug'],
          summary: 'List cache keys',
          parameters: [
            {
              name: 'pattern',
              in: 'query',
              schema: { type: 'string', default: '*' },
              description: 'Key pattern to match'
            }
          ],
          responses: {
            200: { description: 'List of cache keys' }
          }
        }
      },
      '/api/debug/cache/flush': {
        delete: {
          tags: ['Cache Debug'],
          summary: 'Flush cache by pattern',
          parameters: [
            {
              name: 'pattern',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Key pattern to flush'
            }
          ],
          responses: {
            200: { description: 'Cache flushed' }
          }
        }
      },
      '/api/debug/indexes/{table}': {
        get: {
          tags: ['Index Debug'],
          summary: 'Get indexes for a table',
          parameters: [
            {
              name: 'table',
              in: 'path',
              required: true,
              schema: { 
                type: 'string',
                enum: ['products', 'orders', 'categories', 'users']
              }
            }
          ],
          responses: {
            200: { description: 'Table indexes' }
          }
        }
      },
      '/api/debug/indexes': {
        get: {
          tags: ['Index Debug'],
          summary: 'Get all indexes',
          responses: {
            200: { description: 'All indexes' }
          }
        }
      }
    }
  },
  apis: ['./src/modules/products/**/*.controller.ts', './src/modules/products/**/*.types.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
