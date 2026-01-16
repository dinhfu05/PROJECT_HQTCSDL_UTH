import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller';

const router = Router();
const categoriesController = new CategoriesController();

// GET ALL - /api/categories
router.get('/', (req, res) => categoriesController.getAll(req, res));

// GET BY ID - /api/categories/:id
router.get('/:id', (req, res) => categoriesController.getById(req, res));

// CREATE - POST /api/categories
router.post('/', (req, res) => categoriesController.create(req, res));

// UPDATE - PUT /api/categories/:id
router.put('/:id', (req, res) => categoriesController.update(req, res));

// DELETE - DELETE /api/categories/:id
router.delete('/:id', (req, res) => categoriesController.delete(req, res));

export const categoriesRoutes = router; 