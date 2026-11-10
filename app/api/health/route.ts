import catalog from "@/data/catalog.json";
import { hasClockedApiKey } from "@/lib/clocked-client";

export const runtime = "nodejs";

export function GET(): Response {
  return Response.json({ status: "ok", hasApiKey: hasClockedApiKey(), catalogCount: catalog.length, presetsCount: 0, mode: "live-only" });
}
