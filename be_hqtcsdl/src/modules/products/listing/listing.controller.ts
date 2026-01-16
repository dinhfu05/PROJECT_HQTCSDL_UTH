// Listing Controller - HTTP endpoints for product listing

import { Request, Response, Router } from 'express';
import { listingService } from './listing.service';

const router = Router();

/**
 * @swagger
 * /products/all:
 *   get:
 *     summary: Get ALL products (no pagination)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 */
// GET /products/all - Get all products (no pagination)
router.get('/all', async (req: Request, res: Response) => {
  try {
    const result = await listingService.getAllProducts();

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           example: 5
 *         description: Items per page (max 100)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           example: 1000000
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           example: 50000000
 *         description: Maximum price
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "iPhone"
 *         description: Search by name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [productPrice, created_at, productName]
 *           example: "productPrice"
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: "desc"
 *         description: Sort order
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor for pagination (get from nextCursor)
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListingResult'
 */
// GET /products - Main listing endpoint (filter/sort/pagination)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await listingService.getProducts(req.query);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * @swagger
 * /products/with-count:
 *   get:
 *     summary: List products with total count (slower)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of products with total
 */
// GET /products/with-count - Listing with total count (slower)
router.get('/with-count', async (req: Request, res: Response) => {
  try {
    const result = await listingService.getProductsWithCount(req.query);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * @swagger
 * /products/explain:
 *   get:
 *     summary: Explain query execution plan
 *     tags: [Listing Debug]
 *     responses:
 *       200:
 *         description: Query explain result
 */
// GET /products/explain - Debug query plan
router.get('/explain', async (req: Request, res: Response) => {
  try {
    const explain = await listingService.explainQuery(req.query);

    res.json({
      success: true,
      explain,
      query: req.query,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * @swagger
 * /products/explain-analyze:
 *   get:
 *     summary: Explain Analyze for query performance
 *     tags: [Listing Debug]
 *     responses:
 *       200:
 *         description: Detailed query analysis
 */
// GET /products/explain-analyze - Detailed performance analysis
router.get('/explain-analyze', async (req: Request, res: Response) => {
  try {
    const analyze = await listingService.explainAnalyzeQuery(req.query);

    res.json({
      success: true,
      analyze,
      query: req.query,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export const listingController: Router = router;
