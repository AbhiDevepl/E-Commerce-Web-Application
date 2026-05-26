import "dotenv/config";

export const env = {
  MONGODB_URL: process.env.MONGODB_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5000",
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
