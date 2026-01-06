// Products Service - Business logic for product CRUD

import { productsRepo } from './repositories/products.repo';
import { ProductDetail, CreateProductDto, UpdateProductDto } from './products.types';

export class ProductsService {
  async getProductById(id: number): Promise<ProductDetail | null> {
    return productsRepo.findById(id);
  }

  async createProduct(data: CreateProductDto): Promise<ProductDetail | null> {
    const id = await productsRepo.create(data);
    return productsRepo.findById(id);
  }

  async updateProduct(id: number, data: UpdateProductDto): Promise<ProductDetail | null> {
    const updated = await productsRepo.update(id, data);
    if (!updated) return null;
    return productsRepo.findById(id);
  }

  async deleteProduct(id: number): Promise<boolean> {
    return productsRepo.delete(id);
  }
}

export const productsService = new ProductsService();
