import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HQTCSDL Product API',
      version,
      description: 'API documentation for Product Management and Listing',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development Server',
      },
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
            data: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  productId: { type: 'integer' },
                  productName: { type: 'string' },
                  productPrice: { type: 'number' },
                  category_id: { type: 'integer' },
                  created_at: { type: 'string', format: 'date-time' },
                }
              } 
            },
            nextCursor: { type: 'string', nullable: true },
            hasMore: { type: 'boolean' },
            perf: {
              type: 'object',
              properties: {
                db_ms: { type: 'number' },
                total_ms: { type: 'number' },
              }
            }
          }
        }
      },
    },
  },
  // Only look for docs in products module as requested
  apis: ['./src/modules/products/**/*.controller.ts', './src/modules/products/**/*.types.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
