import { Category, CategoryCreationAttributes } from '../models/categories.model';

export class CategoriesService {
    // GET ALL - Lấy tất cả danh mục
    async getAll() {
        try {
            const categories = await Category.findAll();
            return {
                success: true,
                data: categories,
                message: 'Lấy danh sách danh mục thành công',
            };
        } catch (error) {
            throw {
                success: false,
                message: 'Lỗi khi lấy danh sách danh mục',
                error,
            };
        }
    }

    // GET BY ID - Lấy danh mục theo ID
    async getById(id: number) {
        try {
            const category = await Category.findByPk(id);
            if (!category) {
                return {
                    success: false,
                    message: 'Danh mục không tồn tại',
                    data: null,
                };
            }
            return {
                success: true,
                data: category,
                message: 'Lấy danh mục thành công',
            };
        } catch (error) {
            throw {
                success: false,
                message: 'Lỗi khi lấy danh mục',
                error,
            };
        }
    }

    // CREATE - Tạo danh mục mới
    async create(data: CategoryCreationAttributes) {
        try {
            // Validate dữ liệu
            if (!data.name || data.name.trim() === '') {
                return {
                    success: false,
                    message: 'Tên danh mục không được để trống',
                    data: null,
                };
            }

            // Kiểm tra trùng lặp
            const existingCategory = await Category.findOne({
                where: { name: data.name },
            });
            if (existingCategory) {
                return {
                    success: false,
                    message: 'Danh mục này đã tồn tại',
                    data: null,
                };
            }

            const category = await Category.create(data);
            return {
                success: true,
                data: category,
                message: 'Tạo danh mục thành công',
            };
        } catch (error) {
            throw {
                success: false,
                message: 'Lỗi khi tạo danh mục',
                error,
            };
        }
    }

    // UPDATE - Cập nhật danh mục
    async update(id: number, data: Partial<CategoryCreationAttributes>) {
        try {
            const category = await Category.findByPk(id);
            if (!category) {
                return {
                    success: false,
                    message: 'Danh mục không tồn tại',
                    data: null,
                };
            }

            // Validate tên nếu được update
            if (data.name && data.name.trim() === '') {
                return {
                    success: false,
                    message: 'Tên danh mục không được để trống',
                    data: null,
                };
            }

            const updatedCategory = await category.update(data);
            return {
                success: true,
                data: updatedCategory,
                message: 'Cập nhật danh mục thành công',
            };
        } catch (error) {
            throw {
                success: false,
                message: 'Lỗi khi cập nhật danh mục',
                error,
            };
        }
    }

    // DELETE - Xóa danh mục
    async delete(id: number) {
        try {
            const category = await Category.findByPk(id);
            if (!category) {
                return {
                    success: false,
                    message: 'Danh mục không tồn tại',
                    data: null,
                };
            }

            await category.destroy();
            return {
                success: true,
                data: null,
                message: 'Xóa danh mục thành công',
            };
        } catch (error) {
            throw {
                success: false,
                message: 'Lỗi khi xóa danh mục',
                error,
            };
        }
    }
} 