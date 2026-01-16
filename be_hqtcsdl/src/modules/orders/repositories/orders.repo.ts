import { db } from "../../../infra/database";
import {
  Order,
  OrderItem,
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryFilters,
  OrderResponse,
} from "../orders.types";

export class OrdersRepository {
  async create(data: CreateOrderDto): Promise<Order> {
    const trx = await db.transaction();

    try {
      // Step 1: Tính total_amount trước khi insert
      const total = data.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      // Step 2: Insert order
      const [order] = await trx("orders")
        .insert({
          user_id: data.user_id,
          status: "pending",
          total_amount: total,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        })
        .returning("*"); // PostgreSQL feature: trả về row vừa insert

      // Step 3: Batch insert order items
      const itemsToInsert = data.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      await trx("order_items").insert(itemsToInsert);

      await trx.commit();
      return order;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * READ - Lấy order với items (JOIN tối ưu)
   * PERFORMANCE OPTIMIZATION:
   * 1. Single query với JOIN thay vì N+1 query
   * 2. SELECT specific columns thay vì SELECT *
   * 3. Index trên order_id trong order_items
   */
  async findById(id: number): Promise<OrderResponse | null> {
    const rows = await db("orders as o")
      .leftJoin("order_items as oi", "o.id", "oi.order_id")
      .leftJoin("products as p", "oi.product_id", "p.productId")
      .select(
        "o.id",
        "o.user_id",
        "o.status",
        "o.total_amount",
        "o.created_at",
        "o.updated_at",
        "oi.id as item_id",
        "oi.product_id",
        "oi.quantity",
        "oi.price",
        "p.productName as product_name"
      )
      .where("o.id", id);

    if (rows.length === 0) return null;

    // Transform flat rows thành nested structure
    return this.transformOrderWithItems(rows);
  }

  /**
   * LIST - Lấy danh sách orders với filters + pagination
   * PERFORMANCE OPTIMIZATION:
   * 1. WHERE conditions với indexed columns
   * 2. LIMIT/OFFSET cho pagination
   * 3. COUNT query riêng (chỉ chạy khi cần)
   */
  async findAll(
    filters: OrderQueryFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Order[]; total: number }> {
    const query = db("orders");

    // Apply filters (WHERE clauses)
    if (filters.user_id) {
      query.where("user_id", filters.user_id);
    }
    if (filters.status) {
      query.where("status", filters.status);
    }
    if (filters.min_amount) {
      query.where("total_amount", ">=", filters.min_amount);
    }
    if (filters.max_amount) {
      query.where("total_amount", "<=", filters.max_amount);
    }
    if (filters.from_date) {
      query.where("created_at", ">=", filters.from_date);
    }
    if (filters.to_date) {
      query.where("created_at", "<=", filters.to_date);
    }

    // Count total (cho pagination)
    const [{ count }] = await query.clone().count("* as count");

    // Get data với pagination
    const data = await query
      .select("*")
      .orderBy("created_at", "desc") // Index trên created_at
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data,
      total: Number(count),
    };
  }

  /**
   * UPDATE - Cập nhật order
   * PERFORMANCE: WHERE id có index (Primary Key)
   */
  async update(id: number, data: UpdateOrderDto): Promise<Order | null> {
    const [updated] = await db("orders")
      .where("id", id)
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning("*");

    return updated || null;
  }

  /**
   * DELETE - Xóa order (cascade order_items)
   * PERFORMANCE: Transaction để đảm bảo consistency
   */
  async delete(id: number): Promise<boolean> {
    const trx = await db.transaction();

    try {
      // Step 1: Xóa order items trước (foreign key constraint)
      await trx("order_items").where("order_id", id).del();

      // Step 2: Xóa order
      const deleted = await trx("orders").where("id", id).del();

      await trx.commit();
      return deleted > 0;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * HELPER - Transform flat JOIN results thành nested structure
   * Lý do: JOIN trả về flat rows, cần group items vào order
   */
  private transformOrderWithItems(rows: any[]): OrderResponse {
    const order = {
      id: rows[0].id,
      user_id: rows[0].user_id,
      status: rows[0].status,
      total_amount: rows[0].total_amount,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      items: [] as any[],
    };

    rows.forEach((row) => {
      if (row.item_id) {
        order.items.push({
          id: row.item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          quantity: row.quantity,
          price: row.price,
          subtotal: row.quantity * row.price,
        });
      }
    });

    return order;
  }

  /**
   * ORDER ITEMS OPERATIONS
   */

  async findItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return db("order_items").where("order_id", orderId).select("*");
  }

  async updateItem(id: number, data: any): Promise<OrderItem | null> {
    const [updated] = await db("order_items")
      .where("id", id)
      .update(data)
      .returning("*");

    return updated || null;
  }

  async deleteItem(id: number): Promise<boolean> {
    const deleted = await db("order_items").where("id", id).del();
    return deleted > 0;
  }

  /**
   * BUSINESS QUERY - Tính lại total amount
   * PERFORMANCE: SUM aggregation trong database thay vì app
   */
  async recalculateTotal(orderId: number): Promise<number> {
    const [result] = await db("order_items")
      .where("order_id", orderId)
      .sum("quantity * price as total");

    const total = result.total || 0;

    await db("orders")
      .where("id", orderId)
      .update({ total_amount: total, updated_at: db.fn.now() });

    return total;
  }
}
