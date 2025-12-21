// Products Module - Combines listing and detail endpoints

import { Router } from 'express';
import { productsController } from './products.controller';
import { listingController } from './listing/listing.controller';

const router = Router();

// GET /products - Listing with filter/sort/pagination (listing module)
router.use('/', listingController);

// GET /products/:id - Product detail (products controller)
// POST /products - Create product
// PATCH /products/:id - Update product
// DELETE /products/:id - Delete product
router.use('/', productsController);

export const productsModule: Router = router;

// Re-export types
export * from './products.types';
export * from './listing/listing.types';
