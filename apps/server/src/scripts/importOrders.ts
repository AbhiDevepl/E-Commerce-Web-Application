import path from "node:path";
import { connectMigrationDb } from "../config/migrationDb.js";
import { migrationEnv } from "../config/migrationEnv.js";
import { MigrationOrder } from "../models/migration/orderMigration.model.js";
import { MigrationOrderItem } from "../models/migration/orderItemMigration.model.js";
import { MigrationRefund } from "../models/migration/refundMigration.model.js";
import { streamCsvRows } from "../utils/csvParser.js";
import { cleanBool01, cleanDate, cleanInt, cleanNumber } from "../utils/dataCleaner.js";
import { DuplicateChecker } from "../utils/duplicateChecker.js";
import { migrationLogger } from "../utils/migrationLogger.js";
import { writeValidationReport } from "../utils/reportWriter.js";
import { orderItemRowSchema, orderRowSchema, refundRowSchema } from "../utils/validation.js";
import { retry, spinner } from "./importShared.js";

export async function importOrdersAndChildren() {
  await connectMigrationDb();
  const stats = {
    orders: { processed: 0, invalid: 0, duplicatesInCsv: 0, insertedOrUpdated: 0 },
    orderItems: { processed: 0, invalid: 0, duplicatesInCsv: 0, insertedOrUpdated: 0 },
    refunds: { processed: 0, invalid: 0, duplicatesInCsv: 0, insertedOrUpdated: 0 },
  };

  const orderSpin = spinner("Importing orders");
  const orderDup = new DuplicateChecker();
  let ops: any[] = [];
  for await (const row of streamCsvRows(path.join(migrationEnv.csvDir, "orders.csv"))) {
    stats.orders.processed += 1;
    if (!orderRowSchema.safeParse(row).success) {
      stats.orders.invalid += 1;
      continue;
    }
    const legacyOrderId = cleanInt(row.order_id);
    if (!legacyOrderId) {
      stats.orders.invalid += 1;
      continue;
    }
    if (orderDup.has(legacyOrderId)) {
      stats.orders.duplicatesInCsv += 1;
      continue;
    }
    orderDup.mark(legacyOrderId);
    ops.push({
      updateOne: {
        filter: { legacyOrderId },
        update: {
          $set: {
            legacyOrderId,
            createdAt: cleanDate(row.created_at) || new Date(0),
            websiteSessionId: cleanInt(row.website_session_id),
            legacyUserId: cleanInt(row.user_id),
            primaryProductId: cleanInt(row.primary_product_id),
            itemsPurchased: cleanInt(row.items_purchased) || 0,
            priceUsd: cleanNumber(row.price_usd) || 0,
            cogsUsd: cleanNumber(row.cogs_usd) || 0,
          },
        },
        upsert: true,
      },
    });
    if (ops.length >= migrationEnv.batchSize) {
      const res: any = await retry(() => (MigrationOrder as any).bulkWrite(ops, { ordered: false }));
      stats.orders.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
      ops = [];
    }
  }
  if (ops.length) {
    const res: any = await retry(() => (MigrationOrder as any).bulkWrite(ops, { ordered: false }));
    stats.orders.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
  }
  orderSpin.succeed("Orders import complete");

  const itemSpin = spinner("Importing order items");
  const itemDup = new DuplicateChecker();
  ops = [];
  for await (const row of streamCsvRows(path.join(migrationEnv.csvDir, "order_items.csv"))) {
    stats.orderItems.processed += 1;
    if (!orderItemRowSchema.safeParse(row).success) {
      stats.orderItems.invalid += 1;
      continue;
    }
    const legacyOrderItemId = cleanInt(row.order_item_id);
    if (!legacyOrderItemId) {
      stats.orderItems.invalid += 1;
      continue;
    }
    if (itemDup.has(legacyOrderItemId)) {
      stats.orderItems.duplicatesInCsv += 1;
      continue;
    }
    itemDup.mark(legacyOrderItemId);
    ops.push({
      updateOne: {
        filter: { legacyOrderItemId },
        update: {
          $set: {
            legacyOrderItemId,
            createdAt: cleanDate(row.created_at) || new Date(0),
            orderLegacyId: cleanInt(row.order_id),
            productLegacyId: cleanInt(row.product_id),
            isPrimaryItem: cleanBool01(row.is_primary_item) || false,
            priceUsd: cleanNumber(row.price_usd) || 0,
            cogsUsd: cleanNumber(row.cogs_usd) || 0,
          },
        },
        upsert: true,
      },
    });
    if (ops.length >= migrationEnv.batchSize) {
      const res: any = await retry(() => (MigrationOrderItem as any).bulkWrite(ops, { ordered: false }));
      stats.orderItems.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
      ops = [];
    }
  }
  if (ops.length) {
    const res: any = await retry(() => (MigrationOrderItem as any).bulkWrite(ops, { ordered: false }));
    stats.orderItems.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
  }
  itemSpin.succeed("Order items import complete");

  const refundSpin = spinner("Importing refunds");
  const refundDup = new DuplicateChecker();
  ops = [];
  for await (const row of streamCsvRows(path.join(migrationEnv.csvDir, "order_item_refunds.csv"))) {
    stats.refunds.processed += 1;
    if (!refundRowSchema.safeParse(row).success) {
      stats.refunds.invalid += 1;
      continue;
    }
    const legacyRefundId = cleanInt(row.order_item_refund_id);
    if (!legacyRefundId) {
      stats.refunds.invalid += 1;
      continue;
    }
    if (refundDup.has(legacyRefundId)) {
      stats.refunds.duplicatesInCsv += 1;
      continue;
    }
    refundDup.mark(legacyRefundId);
    ops.push({
      updateOne: {
        filter: { legacyRefundId },
        update: {
          $set: {
            legacyRefundId,
            createdAt: cleanDate(row.created_at) || new Date(0),
            orderItemLegacyId: cleanInt(row.order_item_id),
            orderLegacyId: cleanInt(row.order_id),
            refundAmountUsd: cleanNumber(row.refund_amount_usd) || 0,
          },
        },
        upsert: true,
      },
    });
    if (ops.length >= migrationEnv.batchSize) {
      const res: any = await retry(() => (MigrationRefund as any).bulkWrite(ops, { ordered: false }));
      stats.refunds.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
      ops = [];
    }
  }
  if (ops.length) {
    const res: any = await retry(() => (MigrationRefund as any).bulkWrite(ops, { ordered: false }));
    stats.refunds.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
  }
  refundSpin.succeed("Refunds import complete");

  migrationLogger.info(`Order-domain import summary: ${JSON.stringify(stats)}`);
  writeValidationReport("orders-domain", stats);
  return stats;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  importOrdersAndChildren().catch((err) => {
    migrationLogger.error("Failed to import orders domain", err);
    process.exit(1);
  });
}
