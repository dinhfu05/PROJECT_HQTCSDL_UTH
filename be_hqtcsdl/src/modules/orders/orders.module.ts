import { Router } from "express";
import { OrdersController } from "./orders.controller";

const router = Router();
const controller = new OrdersController();

// create order
router.post("/", controller.createOrder);

// list order
router.get("/", controller.listOrders);

// get order detail
router.get("/:id", controller.getOrder);

// update order
router.patch("/:id", controller.updateOrder);

// cancel order
router.post("/:id/cancel", controller.cancelOrder);

// delete order
router.delete("/:id", controller.deleteOrder);

// update order item
router.patch("/:orderId/items/:itemId", controller.updateOrderItem);

// delete order item
router.delete("/:orderId/items/:itemId", controller.deleteOrderItem);

export default router;
