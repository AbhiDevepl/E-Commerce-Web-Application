import { connectMigrationDb, disconnectMigrationDb } from "../config/migrationDb.js";
import { MigrationOrder } from "../models/migration/orderMigration.model.js";
import { MigrationOrderItem } from "../models/migration/orderItemMigration.model.js";
import { MigrationPageview } from "../models/migration/pageviewMigration.model.js";
import { MigrationProduct } from "../models/migration/productMigration.model.js";
import { MigrationRefund } from "../models/migration/refundMigration.model.js";
import { MigrationSession } from "../models/migration/sessionMigration.model.js";
import { migrationLogger } from "../utils/migrationLogger.js";
import { writeValidationReport } from "../utils/reportWriter.js";

export async function verifyImport() {
  await connectMigrationDb();
  const [products, orders, orderItems, refunds, sessions, pageviews] = await Promise.all([
    MigrationProduct.countDocuments(),
    MigrationOrder.countDocuments(),
    MigrationOrderItem.countDocuments(),
    MigrationRefund.countDocuments(),
    MigrationSession.countDocuments(),
    MigrationPageview.countDocuments(),
  ]);

  const validOrderIds = (await (MigrationOrder as any).distinct("legacyOrderId")) as number[];
  const validOrderItemIds = (await (MigrationOrderItem as any).distinct("legacyOrderItemId")) as number[];
  const validSessionIds = (await (MigrationSession as any).distinct("legacySessionId")) as number[];

  const [orphanOrderItems, orphanRefunds, orphanPageviews] = await Promise.all([
    MigrationOrderItem.countDocuments({ orderLegacyId: { $nin: validOrderIds } }),
    MigrationRefund.countDocuments({ orderItemLegacyId: { $nin: validOrderItemIds } }),
    MigrationPageview.countDocuments({ sessionLegacyId: { $nin: validSessionIds } }),
  ]);

  const summary = {
    counts: { products, orders, orderItems, refunds, sessions, pageviews },
    integrity: { orphanOrderItems, orphanRefunds, orphanPageviews },
  };

  migrationLogger.info(`Verification: ${JSON.stringify(summary)}`);
  writeValidationReport("verification", summary);
  await disconnectMigrationDb();
  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyImport().then((s) => console.log(JSON.stringify(s, null, 2))).catch((err) => {
    migrationLogger.error("Verification failed", err);
    process.exit(1);
  });
}
