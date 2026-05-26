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
