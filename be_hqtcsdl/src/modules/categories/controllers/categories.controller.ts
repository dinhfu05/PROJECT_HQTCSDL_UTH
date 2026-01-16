import { Request, Response } from 'express';
import { CategoriesService } from '../services/categories.service';

export class CategoriesController {
    private categoriesService: CategoriesService;

    constructor() {
        this.categoriesService = new CategoriesService();
    }

    // GET ALL
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.categoriesService.getAll();
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh sách danh mục',
                error,
            });
        }
    }

    // GET BY ID
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.categoriesService.getById(Number(id));
            res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi lấy danh mục',
                error,
            });
        }
    }

    // CREATE
    async create(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.categoriesService.create(req.body);
            res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi tạo danh mục',
                error,
            });
        }
    }

    // UPDATE
    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.categoriesService.update(Number(id), req.body);
            res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi cập nhật danh mục',
                error,
            });
        }
    }

    // DELETE
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this.categoriesService.delete(Number(id));
            res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server khi xóa danh mục',
                error,
            });
        }
    }
} 