// Product types for detail view

export interface ProductDetail {
  id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  discount?: number;
  category_id: number;
  category_name?: string;
  stock_quantity: number;
  sales_count?: number;
  rating?: number;
  location?: string;
  images?: string[];
  created_at: Date;
  updated_at?: Date;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id: number;
  stock_quantity?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  original_price?: number;
  category_id?: number;
  stock_quantity?: number;
}
