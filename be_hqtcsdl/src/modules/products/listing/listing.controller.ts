// Listing Controller - HTTP endpoints for product listing

import { Request, Response, Router } from 'express';
import { listingService } from './listing.service';

const router = Router();

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
