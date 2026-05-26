import { env } from "@E-Commerce-Web-Application/env/server";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Auth models (better-auth)
export { User, Session, Account, Verification } from "./models/auth.model";

// App models
export { Product } from "./models/product.model";
export type { IProduct } from "./models/product.model";

export { Order } from "./models/order.model";
export type { IOrder, IOrderItem, IShippingAddress } from "./models/order.model";
