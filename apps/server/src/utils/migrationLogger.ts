import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { migrationEnv } from "../config/migrationEnv.js";

function ensureLogDir() {
  fs.mkdirSync(migrationEnv.logsDir, { recursive: true });
}

function append(fileName: string, line: string) {
  ensureLogDir();
  const file = path.join(migrationEnv.logsDir, fileName);
  fs.appendFileSync(file, `${new Date().toISOString()} ${line}\n`, "utf8");
}

export const migrationLogger = {
  info(msg: string) {
    console.log(chalk.cyan(msg));
    append("migration.log", `[INFO] ${msg}`);
  },
  warn(msg: string) {
    console.warn(chalk.yellow(msg));
    append("migration.log", `[WARN] ${msg}`);
  },
  error(msg: string, err?: unknown) {
    console.error(chalk.red(msg));
    append("errors.log", `[ERROR] ${msg} ${err instanceof Error ? err.stack : ""}`);
  },
  report(reportName: string, payload: unknown) {
    ensureLogDir();
    const file = path.join(migrationEnv.logsDir, `${reportName}.json`);
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");
  },
};
