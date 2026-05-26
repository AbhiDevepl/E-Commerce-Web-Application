import { Router } from "express";
import {
  getAllOrders,
  getMyOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
