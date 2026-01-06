// Products Controller - HTTP endpoints for product detail

import { Request, Response, Router } from 'express';
import { productsService } from './products.service';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management (CRUD)
 */
const router = Router();

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
// GET /products/:id - Get product detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      });
    }

    const product = await productsService.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
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
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - productPrice
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "iPhone 16 Pro"
 *               productPrice:
 *                 type: number
 *                 example: 29990000
 *               productDescription:
 *                 type: string
 *                 example: "New Apple Smartphone"
 *               category_id:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product created
 */
// POST /products - Create product
router.post('/', async (req: Request, res: Response) => {
  try {
    const product = await productsService.createProduct(req.body);
    res.status(201).json({
      success: true,
      data: product,
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
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "iPhone 16 Pro Max"
 *               productPrice:
 *                 type: number
 *                 example: 32000000
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
// PATCH /products/:id - Update product
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const product = await productsService.updateProduct(id, req.body);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
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
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
// DELETE /products/:id - Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await productsService.deleteProduct(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export const productsController: Router = router;
