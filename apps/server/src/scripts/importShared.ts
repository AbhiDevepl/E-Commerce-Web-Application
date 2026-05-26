import ora from "ora";

export async function retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 250): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

export function spinner(text: string) {
  return ora({ text }).start();
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
