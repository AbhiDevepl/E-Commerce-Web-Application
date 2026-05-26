import { connectMigrationDb, disconnectMigrationDb } from "../config/migrationDb.js";
import { migrationLogger } from "../utils/migrationLogger.js";
import { analyzeCsvs } from "./analyzeCsv.js";
import { importOrdersAndChildren } from "./importOrders.js";
import { importProducts } from "./importProducts.js";
import { importSessionsAndPageviews } from "./importSessions.js";
import { verifyImport } from "./verifyImport.js";

async function importAll() {
  const startedAt = Date.now();
  try {
    await connectMigrationDb();
    await analyzeCsvs();
    const products = await importProducts();
    const orderDomain = await importOrdersAndChildren();
    const sessionDomain = await importSessionsAndPageviews();
    const verification = await verifyImport();

    migrationLogger.report("final-report", {
      products,
      orderDomain,
      sessionDomain,
      verification,
      durationMs: Date.now() - startedAt,
      finishedAt: new Date().toISOString(),
    });

    migrationLogger.info("Full import workflow completed");
  } catch (err) {
    migrationLogger.error("Full import failed", err);
    process.exitCode = 1;
  } finally {
    await disconnectMigrationDb();
  }
}

importAll();
