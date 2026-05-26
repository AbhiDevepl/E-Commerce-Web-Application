import mongoose from "mongoose";
import { connectMigrationDb, disconnectMigrationDb } from "../config/migrationDb.js";

async function healthCheck() {
  await connectMigrationDb();
  const status = {
    dbState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    collections: await mongoose.connection.db?.listCollections().toArray(),
  };
  console.log(JSON.stringify(status, null, 2));
  await disconnectMigrationDb();
}

healthCheck().catch((err) => {
  console.error(err);
  process.exit(1);
});
