import { OrdersRepository } from "./repositories/orders.repo";
import { HttpException } from "../../common/exceptions";
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryFilters,
  ORDER_STATUS,
} from "./orders.types";

export class OrdersService {
  private repo: OrdersRepository;

  constructor() {
    this.repo = new OrdersRepository();
  }

  /**
   * CREATE ORDER
   * Business Rules:
   * 1. Validate items không empty
   * 2. Validate quantity > 0
   * 3. Validate price > 0
   */
  async createOrder(data: CreateOrderDto) {
    // Validation
    if (!data.items || data.items.length === 0) {
      throw new HttpException(400, "Order must have at least one item");
    }

    for (const item of data.items) {
      if (item.quantity <= 0) {
        throw new HttpException(400, "Quantity must be greater than 0");
      }
      if (item.price < 0) {
        throw new HttpException(400, "Price cannot be negative");
      }
    }

    // Create order
    const order = await this.repo.create(data);

    // Fetch complete order with items
    return this.repo.findById(order.id);
  }

  /**
   * GET ORDER BY ID
   * Business Rule: Trả về 404 nếu không tìm thấy
   */
  async getOrderById(id: number) {
    const order = await this.repo.findById(id);

    if (!order) {
      throw new HttpException(404, `Order #${id} not found`);
    }

    return order;
  }

  /**
   * LIST ORDERS
   * Business Rule: Default pagination
   */
  async listOrders(
    filters: OrderQueryFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20;

    return this.repo.findAll(filters, page, limit);
  }

  /**
   * UPDATE ORDER STATUS
   * Business Rules:
   * 1. Không cho phép update status nếu đã delivered/canceled
   * 2. Validate status transitions
   */
  async updateOrder(id: number, data: UpdateOrderDto) {
    const existing = await this.repo.findById(id);

    if (!existing) {
      throw new HttpException(404, `Order #${id} not found`);
    }

    // Business rule: Cannot modify delivered/canceled orders
    if (
      existing.status === ORDER_STATUS.DELIVERED ||
      existing.status === ORDER_STATUS.CANCELED
    ) {
      throw new HttpException(
        400,
        `Cannot modify order with status: ${existing.status}`
      );
    }

    // Business rule: Status transition validation
    if (data.status) {
      this.validateStatusTransition(existing.status, data.status);
    }

    await this.repo.update(id, data);
    return this.repo.findById(id);
  }

  /**
   * CANCEL ORDER
   * Business Rule: Chỉ cancel được order pending/shipped
   */
  async cancelOrder(id: number) {
    const order = await this.repo.findById(id);

    if (!order) {
      throw new HttpException(404, `Order #${id} not found`);
    }

    if (order.status === ORDER_STATUS.DELIVERED) {
      throw new HttpException(400, "Cannot cancel delivered order");
    }

    if (order.status === ORDER_STATUS.CANCELED) {
      throw new HttpException(400, "Order already canceled");
    }

    return this.repo.update(id, { status: ORDER_STATUS.CANCELED });
  }

  /**
   * DELETE ORDER
   * Business Rule: Chỉ xóa được order canceled
   */
  async deleteOrder(id: number) {
    const order = await this.repo.findById(id);

    if (!order) {
      throw new HttpException(404, `Order #${id} not found`);
    }

    if (order.status !== ORDER_STATUS.CANCELED) {
      throw new HttpException(400, "Only canceled orders can be deleted");
    }

    return this.repo.delete(id);
  }

  /**
   * ORDER ITEMS OPERATIONS
   */

  async updateOrderItem(orderId: number, itemId: number, data: any) {
    const order = await this.repo.findById(orderId);

    if (!order) {
      throw new HttpException(404, `Order #${orderId} not found`);
    }

    // Cannot modify delivered/canceled orders
    if (
      order.status === ORDER_STATUS.DELIVERED ||
      order.status === ORDER_STATUS.CANCELED
    ) {
      throw new HttpException(
        400,
        "Cannot modify items of delivered/canceled order"
      );
    }

    // Update item
    const updated = await this.repo.updateItem(itemId, data);

    if (!updated) {
      throw new HttpException(404, `Order item #${itemId} not found`);
    }

    // Recalculate total
    await this.repo.recalculateTotal(orderId);

    // Return updated order
    return this.repo.findById(orderId);
  }

  async deleteOrderItem(orderId: number, itemId: number) {
    const order = await this.repo.findById(orderId);

    if (!order) {
      throw new HttpException(404, `Order #${orderId} not found`);
    }

    if (
      order.status === ORDER_STATUS.DELIVERED ||
      order.status === ORDER_STATUS.CANCELED
    ) {
      throw new HttpException(
        400,
        "Cannot modify items of delivered/canceled order"
      );
    }

    // Check if last item
    const items = await this.repo.findItemsByOrderId(orderId);
    if (items.length === 1) {
      throw new HttpException(
        400,
        "Cannot delete last item. Delete order instead."
      );
    }

    await this.repo.deleteItem(itemId);
    await this.repo.recalculateTotal(orderId);

    return this.repo.findById(orderId);
  }

  /**
   * HELPER - Validate status transitions
   */
  private validateStatusTransition(
    currentStatus: ORDER_STATUS,
    newStatus: ORDER_STATUS
  ) {
    const validTransitions: Record<ORDER_STATUS, ORDER_STATUS[]> = {
      [ORDER_STATUS.PENDING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELED],
      [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELED],
      [ORDER_STATUS.DELIVERED]: [],
      [ORDER_STATUS.CANCELED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new HttpException(
        400,
        `Invalid status transition: ${currentStatus} -> ${newStatus}`
      );
    }
  }
}
