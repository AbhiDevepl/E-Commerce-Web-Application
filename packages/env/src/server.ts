import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    MONGODB_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
    CLIENT_URL: z.string().min(1).default("http://localhost:5000"),
    PORT: z.string().default("3000"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
