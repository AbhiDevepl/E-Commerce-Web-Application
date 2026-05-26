import path from "node:path";
import { connectMigrationDb } from "../config/migrationDb.js";
import { migrationEnv } from "../config/migrationEnv.js";
import { MigrationPageview } from "../models/migration/pageviewMigration.model.js";
import { MigrationSession } from "../models/migration/sessionMigration.model.js";
import { streamCsvRows } from "../utils/csvParser.js";
import { cleanBool01, cleanDate, cleanInt, cleanString, normalizeDevice } from "../utils/dataCleaner.js";
import { DuplicateChecker } from "../utils/duplicateChecker.js";
import { migrationLogger } from "../utils/migrationLogger.js";
import { writeValidationReport } from "../utils/reportWriter.js";
import { pageviewRowSchema, sessionRowSchema } from "../utils/validation.js";
import { retry, spinner } from "./importShared.js";

export async function importSessionsAndPageviews() {
  await connectMigrationDb();

  const stats = {
    sessions: { processed: 0, invalid: 0, duplicatesInCsv: 0, insertedOrUpdated: 0 },
    pageviews: { processed: 0, invalid: 0, duplicatesInCsv: 0, insertedOrUpdated: 0 },
  };

  const sessionSpin = spinner("Importing website sessions");
  const sessionDup = new DuplicateChecker();
  let ops: any[] = [];

  for await (const row of streamCsvRows(path.join(migrationEnv.csvDir, "website_sessions.csv"))) {
    stats.sessions.processed += 1;
    if (!sessionRowSchema.safeParse(row).success) {
      stats.sessions.invalid += 1;
      continue;
    }

    const legacySessionId = cleanInt(row.website_session_id);
    if (!legacySessionId) {
      stats.sessions.invalid += 1;
      continue;
    }
    if (sessionDup.has(legacySessionId)) {
      stats.sessions.duplicatesInCsv += 1;
      continue;
    }
    sessionDup.mark(legacySessionId);

    ops.push({
      updateOne: {
        filter: { legacySessionId },
        update: {
          $set: {
            legacySessionId,
            createdAt: cleanDate(row.created_at) || new Date(0),
            legacyUserId: cleanInt(row.user_id),
            isRepeatSession: cleanBool01(row.is_repeat_session) || false,
            utmSource: cleanString(row.utm_source),
            utmCampaign: cleanString(row.utm_campaign),
            utmContent: cleanString(row.utm_content),
            deviceType: normalizeDevice(row.device_type),
            httpReferer: cleanString(row.http_referer),
          },
        },
        upsert: true,
      },
    });

    if (ops.length >= migrationEnv.batchSize) {
      const res: any = await retry(() => (MigrationSession as any).bulkWrite(ops, { ordered: false }));
      stats.sessions.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
      ops = [];
    }
  }

  if (ops.length) {
    const res: any = await retry(() => (MigrationSession as any).bulkWrite(ops, { ordered: false }));
    stats.sessions.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
  }
  sessionSpin.succeed("Sessions import complete");

  const pageviewSpin = spinner("Importing website pageviews");
  const pageviewDup = new DuplicateChecker();
  ops = [];

  for await (const row of streamCsvRows(path.join(migrationEnv.csvDir, "website_pageviews.csv"))) {
    stats.pageviews.processed += 1;
    if (!pageviewRowSchema.safeParse(row).success) {
      stats.pageviews.invalid += 1;
      continue;
    }

    const legacyPageviewId = cleanInt(row.website_pageview_id);
    if (!legacyPageviewId) {
      stats.pageviews.invalid += 1;
      continue;
    }
    if (pageviewDup.has(legacyPageviewId)) {
      stats.pageviews.duplicatesInCsv += 1;
      continue;
    }
    pageviewDup.mark(legacyPageviewId);

    ops.push({
      updateOne: {
        filter: { legacyPageviewId },
        update: {
          $set: {
            legacyPageviewId,
            createdAt: cleanDate(row.created_at) || new Date(0),
            sessionLegacyId: cleanInt(row.website_session_id),
            pageviewUrl: cleanString(row.pageview_url) || "/",
          },
        },
        upsert: true,
      },
    });

    if (ops.length >= migrationEnv.batchSize) {
      const res: any = await retry(() => (MigrationPageview as any).bulkWrite(ops, { ordered: false }));
      stats.pageviews.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
      ops = [];
    }
  }

  if (ops.length) {
    const res: any = await retry(() => (MigrationPageview as any).bulkWrite(ops, { ordered: false }));
    stats.pageviews.insertedOrUpdated += (res?.upsertedCount || 0) + (res?.modifiedCount || 0);
  }
  pageviewSpin.succeed("Pageviews import complete");

  migrationLogger.info(`Session-domain import summary: ${JSON.stringify(stats)}`);
  writeValidationReport("sessions-domain", stats);
  return stats;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  importSessionsAndPageviews().catch((err) => {
    migrationLogger.error("Failed to import sessions domain", err);
    process.exit(1);
  });
}
