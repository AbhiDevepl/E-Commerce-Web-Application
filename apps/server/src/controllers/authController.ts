import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  const { name, email, password } = parsed.data;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user.id),
  });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.errors[0].message });
    return;
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user.id),
  });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
};
