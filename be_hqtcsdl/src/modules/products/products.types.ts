// Product types for detail view

export interface ProductDetail {
  productId: number;
  productName: string;
  productDescription?: string;
  productPrice: number;
  category_id: number;
  created_at: Date;
  updated_at?: Date;
}

export interface CreateProductDto {
  productName: string;
  productDescription?: string;
  productPrice: number;
  category_id: number;
}

export interface UpdateProductDto {
  productName?: string;
  productDescription?: string;
  productPrice?: number;
  category_id?: number;
}
