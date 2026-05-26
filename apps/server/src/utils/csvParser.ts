import fs from "node:fs";
import csv from "csv-parser";

export type CsvRow = Record<string, string>;

export async function* streamCsvRows(filePath: string): AsyncGenerator<CsvRow> {
  const input = fs.createReadStream(filePath);
  const parser = input.pipe(csv({ mapHeaders: ({ header }) => header.trim() }));

  for await (const row of parser) {
    yield row as CsvRow;
  }
}
