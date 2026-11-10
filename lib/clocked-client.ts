import { randomUUID } from "node:crypto";
import { cacheKey, getCached, setCached } from "@/lib/content-cache";
import type { ClockedResponse } from "@/lib/types";

const baseUrl = "https://clocked.rezolve.ai/clocked";
const retryDelays = [400, 900, 1800];

export class ClockedError extends Error {
  constructor(public readonly status: number, message: string, public readonly retryAsNew: boolean) {
    super(message);
  }
}

function apiKey(): string {
  const value = process.env.CLOCKED_API_KEY?.trim();
  if (!value) throw new ClockedError(503, "CLOCKED_API_KEY is not configured on this server.", false);
  return value;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds + Math.floor(Math.random() * 120)));
}

function shouldRetry(status: number, retryAsNew: boolean): boolean {
  return (status === 429 || status >= 500 || status === 409) && !retryAsNew;
}

export async function clocked<T>(endpoint: string, payload: Record<string, unknown>, options: { cache?: boolean } = {}): Promise<ClockedResponse<T>> {
  const cacheEnabled = options.cache === true;
  const key = cacheKey(endpoint, payload);
  if (cacheEnabled) {
    const cached = await getCached<T>(key);
    if (cached) return { data: cached, headers: new Headers(), cached: true };
  }
  const idempotencyKey = randomUUID();
  let lastError: ClockedError | null = null;
  for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey()}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(payload),
        cache: "no-store"
      });
      const parsed = await response.json().catch(() => null) as Record<string, unknown> | null;
      if (response.ok && parsed) {
        if (cacheEnabled) await setCached(key, parsed);
        return { data: parsed as T, headers: response.headers, cached: false };
      }
      const retryAsNew = parsed?.retryAsNew === true;
      const error = new ClockedError(response.status, typeof parsed?.error === "string" ? parsed.error : `Clocked ${endpoint} request failed.`, retryAsNew);
      lastError = error;
      if (attempt === retryDelays.length || !shouldRetry(response.status, retryAsNew)) throw error;
    } catch (error) {
      if (error instanceof ClockedError) {
        if (attempt === retryDelays.length || !shouldRetry(error.status, error.retryAsNew)) throw error;
        lastError = error;
      } else {
        lastError = new ClockedError(502, "Clocked could not be reached. Retry the scan.", false);
        if (attempt === retryDelays.length) throw lastError;
      }
    }
    await delay(retryDelays[attempt]);
  }
  throw lastError ?? new ClockedError(502, "Clocked request failed.", false);
}

export function hasClockedApiKey(): boolean {
  return Boolean(process.env.CLOCKED_API_KEY?.trim());
}
