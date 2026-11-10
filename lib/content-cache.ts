import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const memory = new Map<string, unknown>();
const cacheDirectory = join(process.cwd(), ".clocked_cache");

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, normalize(entry)]));
  }
  return value;
}

export function cacheKey(endpoint: string, payload: unknown): string {
  return createHash("sha256").update(JSON.stringify({ endpoint, payload: normalize(payload) })).digest("hex");
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (memory.has(key)) return memory.get(key) as T;
  try {
    const value = JSON.parse(await readFile(join(cacheDirectory, `${key}.json`), "utf8")) as T;
    memory.set(key, value);
    return value;
  } catch {
    return null;
  }
}

export async function setCached(key: string, value: unknown): Promise<void> {
  memory.set(key, value);
  try {
    await mkdir(cacheDirectory, { recursive: true });
    await writeFile(join(cacheDirectory, `${key}.json`), JSON.stringify(value), "utf8");
  } catch {
    return;
  }
}

export function clearMemoryCache(): void {
  memory.clear();
}
