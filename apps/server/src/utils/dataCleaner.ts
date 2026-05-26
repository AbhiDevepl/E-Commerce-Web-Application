export function cleanString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const v = String(value).trim();
  if (!v || v.toLowerCase() === "null" || v.toLowerCase() === "nan") return null;
  return v;
}

export function cleanNumber(value: unknown): number | null {
  const str = cleanString(value);
  if (!str) return null;
  const n = Number(str.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function cleanInt(value: unknown): number | null {
  const n = cleanNumber(value);
  if (n === null) return null;
  return Number.isInteger(n) ? n : Math.trunc(n);
}

export function cleanBool01(value: unknown): boolean | null {
  const n = cleanInt(value);
  if (n === null) return null;
  return n === 1;
}

export function cleanDate(value: unknown): Date | null {
  const str = cleanString(value);
  if (!str) return null;
  const normalized = str.replace(/^"|"$/g, "");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizeDevice(value: unknown): "mobile" | "desktop" | "other" {
  const v = cleanString(value)?.toLowerCase();
  if (v === "mobile" || v === "desktop") return v;
  return "other";
}
