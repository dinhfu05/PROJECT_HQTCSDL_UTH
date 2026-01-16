// src/modules/orders/orders.controller.ts

import { Request, Response, NextFunction } from "express";
import { OrdersService } from "./orders.services";
import { ORDER_STATUS } from "./orders.types";

/**
 * CONTROLLER LAYER - HTTP Request/Response handling
 * Lý do:
 * - Parse request params/body
 * - Format response
 * - Error handling (pass to middleware)
 */

export class OrdersController {
  private service: OrdersService;

  constructor() {
    this.service = new OrdersService();
  }

  /**
   * POST /orders - Tạo order mới
   */
  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await this.service.createOrder(req.body);

      res.status(201).json({
        success: true,
        data: order,
        message: "Order created successfully",
      });
    } catch (error) {
      next(error); // Pass to error middleware
    }
  };

  /**
   * GET /orders/:id - Lấy chi tiết order
   */
  getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const order = await this.service.getOrderById(id);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /orders - List orders với filters
   * Query params:
   * - user_id
   * - status
   * - min_amount, max_amount
   * - from_date, to_date
   * - page, limit
   */
  listOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        user_id: req.query.user_id
          ? parseInt(req.query.user_id as string)
          : undefined,
        status: req.query.status as ORDER_STATUS,
        min_amount: req.query.min_amount
          ? parseFloat(req.query.min_amount as string)
          : undefined,
        max_amount: req.query.max_amount
          ? parseFloat(req.query.max_amount as string)
          : undefined,
        from_date: req.query.from_date
          ? new Date(req.query.from_date as string)
          : undefined,
        to_date: req.query.to_date
          ? new Date(req.query.to_date as string)
          : undefined,
      };

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await this.service.listOrders(filters, page, limit);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /orders/:id - Update order (thường là status)
   */
  updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const order = await this.service.updateOrder(id, req.body);

      res.json({
        success: true,
        data: order,
        message: "Order updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /orders/:id/cancel - Cancel order
   */
  cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const order = await this.service.cancelOrder(id);

      res.json({
        success: true,
        data: order,
        message: "Order canceled successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /orders/:id - Xóa order
   */
  deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.deleteOrder(id);

      res.json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ORDER ITEMS ENDPOINTS
   */

  /**
   * PATCH /orders/:orderId/items/:itemId - Update order item
   */
  updateOrderItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const itemId = parseInt(req.params.itemId);

      const order = await this.service.updateOrderItem(
        orderId,
        itemId,
        req.body
      );

      res.json({
        success: true,
        data: order,
        message: "Order item updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /orders/:orderId/items/:itemId - Xóa order item
   */
  deleteOrderItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const itemId = parseInt(req.params.itemId);

      const order = await this.service.deleteOrderItem(orderId, itemId);

      res.json({
        success: true,
        data: order,
        message: "Order item deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
