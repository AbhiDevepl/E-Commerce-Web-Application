import path from "node:path";

const rootDir = path.resolve(process.cwd(), "..", "..");

export const migrationEnv = {
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URL || "mongodb://localhost:27017/ecommerce_app",
  csvDir: process.env.CSV_DIR || path.resolve(rootDir, "database"),
  logsDir: process.env.LOGS_DIR || path.resolve(process.cwd(), "logs"),
  batchSize: Number(process.env.MIGRATION_BATCH_SIZE || 1000),
  dryRun: process.env.MIGRATION_DRY_RUN === "true",
};
