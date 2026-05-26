import { Response } from "express";
import { z } from "zod";
import { Order } from "../models/Order.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const orderSchema = z.object({
  orderItems: z
    .array(
      z.object({
        product: z.string(),
        name: z.string(),
        image: z.string(),
        price: z.number(),
        quantity: z.number().positive(),
      })
    )
    .min(1),
  shippingAddress: z.object({
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  paymentMethod: z.string().default("Cash on Delivery"),
  totalPrice: z.number().positive(),
});

export const placeOrder = async (req: AuthRequest, res: Response) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  const order = await Order.create({ ...parsed.data, user: req.user?.id });
  res.status(201).json(order);
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ user: req.user?.id }).sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  if (
    req.user?.role !== "admin" &&
    order.user.toString() !== req.user?.id
  ) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }
  res.json(order);
};

export const getAllOrders = async (_req: AuthRequest, res: Response) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: status },
    { new: true }
  );
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  res.json(order);
};
