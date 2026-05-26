import path from "node:path";
import { connectMigrationDb } from "../config/migrationDb.js";
import { migrationEnv } from "../config/migrationEnv.js";
import { MigrationProduct } from "../models/migration/productMigration.model.js";
import { streamCsvRows } from "../utils/csvParser.js";
import { cleanDate, cleanInt, cleanString } from "../utils/dataCleaner.js";
import { DuplicateChecker } from "../utils/duplicateChecker.js";
import { migrationLogger } from "../utils/migrationLogger.js";
import { writeValidationReport } from "../utils/reportWriter.js";
import { productRowSchema } from "../utils/validation.js";
import { retry, spinner } from "./importShared.js";

export async function importProducts() {
  await connectMigrationDb();
  const filePath = path.join(migrationEnv.csvDir, "products.csv");
  const spin = spinner("Importing products");

  const dup = new DuplicateChecker();
  const ops: any[] = [];
  const stats = { processed: 0, insertedOrUpdated: 0, invalid: 0, duplicatesInCsv: 0 };

  for await (const row of streamCsvRows(filePath)) {
    stats.processed += 1;
    if (!productRowSchema.safeParse(row).success) {
      stats.invalid += 1;
      continue;
    }

    const legacyProductId = cleanInt(row.product_id);
    if (!legacyProductId) {
      stats.invalid += 1;
      continue;
    }
    if (dup.has(legacyProductId)) {
      stats.duplicatesInCsv += 1;
      continue;
    }
    dup.mark(legacyProductId);

    ops.push({
      updateOne: {
        filter: { legacyProductId },
        update: {
          $set: {
            legacyProductId,
            createdAt: cleanDate(row.created_at) || new Date(0),
            productName: cleanString(row.product_name) || `Product ${legacyProductId}`,
          },
        },
        upsert: true,
      },
    });

    if (ops.length >= migrationEnv.batchSize) {
      const res: any = await retry(() => (MigrationProduct as any).bulkWrite(ops, { ordered: false }));
      stats.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
      ops.length = 0;
    }
  }

  if (ops.length) {
    const res: any = await retry(() => (MigrationProduct as any).bulkWrite(ops, { ordered: false }));
    stats.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
  }

  spin.succeed("Products import complete");
  migrationLogger.info(`Products: ${JSON.stringify(stats)}`);
  writeValidationReport("products", stats);
  return stats;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  importProducts().catch((err) => {
    migrationLogger.error("Failed to import products", err);
    process.exit(1);
  });
}
