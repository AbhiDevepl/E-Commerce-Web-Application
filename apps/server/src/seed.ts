import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Product } from "./models/Product.js";
import { Order } from "./models/Order.js";

const MONGODB_URL = process.env.MONGODB_URL || "";

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium over-ear headphones with noise cancellation and 30-hour battery life.",
    price: 79.99,
    category: "Electronics",
    stock: 50,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
  },
  {
    name: "Running Shoes",
    description: "Lightweight and breathable running shoes with cushioned soles for maximum comfort.",
    price: 59.99,
    category: "Footwear",
    stock: 120,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Insulated 32oz bottle that keeps drinks cold for 24 hours and hot for 12 hours.",
    price: 24.99,
    category: "Sports",
    stock: 200,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop",
  },
  {
    name: "Laptop Backpack",
    description: "Water-resistant backpack with USB charging port. Fits laptops up to 15.6 inches.",
    price: 44.99,
    category: "Accessories",
    stock: 75,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
  },
  {
    name: "Smart Watch",
    description: "Fitness tracker with heart rate monitor, GPS, sleep tracking, and 7-day battery.",
    price: 149.99,
    category: "Electronics",
    stock: 30,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
  },
  {
    name: "Cotton T-Shirt",
    description: "100% organic cotton crew-neck t-shirt. Soft, comfortable, and eco-friendly.",
    price: 19.99,
    category: "Clothing",
    stock: 300,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
  },
  {
    name: "Yoga Mat",
    description: "Non-slip 6mm thick yoga mat with carrying strap. Perfect for home or studio.",
    price: 34.99,
    category: "Sports",
    stock: 90,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
  },
  {
    name: "Mechanical Keyboard",
    description: "Compact TKL mechanical keyboard with RGB backlight and blue switches.",
    price: 89.99,
    category: "Electronics",
    stock: 40,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop",
  },
  {
    name: "Sunglasses",
    description: "UV400 polarized sunglasses with lightweight frame. Stylish and protective.",
    price: 29.99,
    category: "Accessories",
    stock: 150,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop",
  },
  {
    name: "Coffee Mug",
    description: "12oz ceramic coffee mug with ergonomic handle. Microwave and dishwasher safe.",
    price: 14.99,
    category: "Kitchen",
    stock: 500,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop",
  },
];

const seedDB = async () => {
  await mongoose.connect(MONGODB_URL);
  console.log("Connected to MongoDB");

  await Order.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({});
  console.log("Cleared existing data");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await User.create([
    { name: "Admin", email: "admin@example.com", password: adminPassword, role: "admin" },
    { name: "Demo User", email: "user@example.com", password: userPassword, role: "user" },
  ]);
  console.log("Users created");

  await Product.insertMany(products);
  console.log("Products created");

  console.log("Seed complete!");
  process.exit(0);
};

seedDB().catch((err) => {
  console.error(err);
  process.exit(1);
});
