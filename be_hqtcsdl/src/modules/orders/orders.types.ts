/**
 * ENUMS - Định nghĩa các giá trị cố định
 * Lý do: Type-safe, dễ maintain, tránh typo
 */
export enum ORDER_STATUS {
  PENDING = "pending",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELED = "canceled",
}

/**
 * DATABASE ENTITIES - Map trực tiếp với bảng DB
 * Lý do: Tách biệt database layer với business logic
 */
export interface Order {
  id: number;
  user_id: number;
  status: ORDER_STATUS;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

/**
 * DTO (Data Transfer Object) - Input validation
 * Lý do: Validate dữ liệu từ client, tránh SQL injection và bad data
 */
export interface CreateOrderDto {
  user_id: number;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  product_id: number;
  quantity: number;
  price: number;
}

export interface UpdateOrderDto {
  status?: ORDER_STATUS;
}

export interface UpdateOrderItemDto {
  quantity?: number;
  price?: number;
}

/**
 * RESPONSE DTOs - Cấu trúc trả về cho client
 * Lý do: Kiểm soát data expose, tối ưu payload size
 */
export interface OrderResponse {
  id: number;
  user_id: number;
  status: ORDER_STATUS;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
  items?: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: number;
  product_id: number;
  product_name?: string; // JOIN với products
  quantity: number;
  price: number;
  subtotal: number; // quantity * price (tính sẵn)
}

export interface OrderQueryFilters {
  user_id?: number;
  status?: ORDER_STATUS;
  min_amount?: number;
  max_amount?: number;
  from_date?: Date;
  to_date?: Date;
}
