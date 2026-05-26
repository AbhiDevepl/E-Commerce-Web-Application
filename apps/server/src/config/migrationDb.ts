import { webcrypto } from "node:crypto";
import mongoose from "mongoose";
import { migrationEnv } from "./migrationEnv.js";

export async function connectMigrationDb() {
  if (mongoose.connection.readyState === 1) return;
  globalThis.crypto ??= webcrypto as Crypto;
  await mongoose.connect(migrationEnv.mongoUri);
}

export async function disconnectMigrationDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
