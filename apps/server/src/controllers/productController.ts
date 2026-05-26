import { z } from "zod";
import { Product } from "../models/Product.js";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  stock: z.number().min(0),
  image: z.string().optional(),
});

export const getProducts = async (req: any, res: any) => {
  const { search, category, sort } = req.query;
  const filter: Record<string, unknown> = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;
  let query = Product.find(filter);
  if (sort === "price_asc") query = query.sort({ price: 1 });
  else if (sort === "price_desc") query = query.sort({ price: -1 });
  else query = query.sort({ createdAt: -1 });
  const products = await query;
  res.json(products);
};

export const getProductById = async (req: any, res: any) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404).json({ message: "Product not found" }); return; }
  res.json(product);
};

export const createProduct = async (req: any, res: any) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: parsed.error.errors[0].message }); return; }
  const product = await Product.create(parsed.data);
  res.status(201).json(product);
};

export const updateProduct = async (req: any, res: any) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ message: parsed.error.errors[0].message }); return; }
  const product = await Product.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!product) { res.status(404).json({ message: "Product not found" }); return; }
  res.json(product);
};

export const deleteProduct = async (req: any, res: any) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) { res.status(404).json({ message: "Product not found" }); return; }
  res.json({ message: "Product deleted" });
};
