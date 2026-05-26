import fs from "node:fs";
import path from "node:path";
import { migrationEnv } from "../config/migrationEnv.js";
import { streamCsvRows } from "../utils/csvParser.js";
import { cleanDate, cleanNumber, cleanString } from "../utils/dataCleaner.js";
import { expectedRelationships } from "../utils/relationshipMapper.js";
import { migrationLogger } from "../utils/migrationLogger.js";
import { writeValidationReport } from "../utils/reportWriter.js";

const FILES = [
  "maven_fuzzy_factory_data_dictionary.csv",
  "order_item_refunds.csv",
  "order_items.csv",
  "orders.csv",
  "products.csv",
  "website_pageviews.csv",
  "website_sessions.csv",
];

type Profile = {
  file: string;
  rowCount: number;
  columns: Record<string, { nulls: number; numeric: number; dates: number; uniqueSampled: number }>;
};

export async function analyzeCsvs() {
  const profiles: Profile[] = [];

  for (const file of FILES) {
    const filePath = path.join(migrationEnv.csvDir, file);
    if (!fs.existsSync(filePath)) {
      migrationLogger.warn(`Missing CSV file: ${filePath}`);
      continue;
    }

    let rowCount = 0;
    const colTrack = new Map<string, { nulls: number; numeric: number; dates: number; uniqueValues: Set<string> }>();

    for await (const row of streamCsvRows(filePath)) {
      rowCount += 1;
      for (const [k, v] of Object.entries(row)) {
        if (!colTrack.has(k)) {
          colTrack.set(k, { nulls: 0, numeric: 0, dates: 0, uniqueValues: new Set() });
        }
        const entry = colTrack.get(k)!;
        const str = cleanString(v);
        if (str === null) {
          entry.nulls += 1;
          continue;
        }
        if (cleanNumber(str) !== null) entry.numeric += 1;
        if (cleanDate(str) !== null) entry.dates += 1;
        if (entry.uniqueValues.size < 10000) entry.uniqueValues.add(str);
      }
    }

    const columns: Profile["columns"] = {};
    for (const [k, v] of colTrack.entries()) {
      columns[k] = {
        nulls: v.nulls,
        numeric: v.numeric,
        dates: v.dates,
        uniqueSampled: v.uniqueValues.size,
      };
    }

    profiles.push({ file, rowCount, columns });
  }

  const summary = {
    csvDir: migrationEnv.csvDir,
    analyzedAt: new Date().toISOString(),
    profiles,
    detectedRelationships: expectedRelationships,
  };

  writeValidationReport("analysis", summary);
  migrationLogger.info(`CSV analysis complete for ${profiles.length} files`);
  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeCsvs().then((s) => console.log(JSON.stringify(s, null, 2))).catch((err) => {
    migrationLogger.error("CSV analysis failed", err);
    process.exit(1);
  });
}
