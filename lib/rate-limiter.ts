import { createHash } from "node:crypto";

const requests = new Map<string, number[]>();
const limit = 15;
const windowMs = 60 * 60 * 1000;

export function rateLimitKey(ip: string, deviceId: string): string {
  return createHash("sha256").update(`${ip}:${deviceId}`).digest("hex");
}

export function consumeLiveScan(key: string, now = Date.now()): { allowed: boolean; remaining: number; resetAt: number } {
  const cutoff = now - windowMs;
  const active = (requests.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
  const resetAt = active[0] ? active[0] + windowMs : now + windowMs;
  if (active.length >= limit) {
    requests.set(key, active);
    return { allowed: false, remaining: 0, resetAt };
  }
  active.push(now);
  requests.set(key, active);
  return { allowed: true, remaining: limit - active.length, resetAt: active[0] + windowMs };
}

export function resetRateLimits(): void {
  requests.clear();
}
