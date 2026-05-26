import { migrationLogger } from "./migrationLogger.js";

export function writeValidationReport(name: string, summary: Record<string, unknown>) {
  migrationLogger.report(`report-${name}`, summary);
}
