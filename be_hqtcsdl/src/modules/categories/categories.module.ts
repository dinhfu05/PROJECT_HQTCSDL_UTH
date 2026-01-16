import { Router } from 'express';
import { categoriesRoutes } from './routes/categories.routes';

export class CategoriesModule {
    public router: Router;

    constructor() {
        this.router = categoriesRoutes;
    }
} 