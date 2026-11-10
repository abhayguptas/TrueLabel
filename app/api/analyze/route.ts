import { NextRequest } from "next/server";
import { hasClockedApiKey, ClockedError } from "@/lib/clocked-client";
import { runPipeline } from "@/lib/pipeline-runner";
import { consumeLiveScan, rateLimitKey } from "@/lib/rate-limiter";
import { sensitivityKeys, type AnalyzeRequest, type PipelineEvent } from "@/lib/types";
import { InputResolutionError, resolveInputText } from "@/lib/youtube-resolver";

export const runtime = "nodejs";

function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function decodedBytes(dataUrl: string): number {
  const encoded = dataUrl.split(",")[1] ?? "";
  return Math.floor(encoded.length * 0.75);
}

function isImage(value: unknown): value is string {
  return typeof value === "string" && /^data:image\/(png|jpeg|webp);base64,/i.test(value);
}

function validate(input: unknown): AnalyzeRequest | string {
  const request = input as Partial<AnalyzeRequest>;
  const query = typeof request.query === "string" ? request.query : "";
  const personalContext = typeof request.personalContext === "string" ? request.personalContext : "";
  const frontImageBase64 = request.frontImageBase64 === null || isImage(request.frontImageBase64) ? request.frontImageBase64 ?? null : undefined;
  const backImageBase64 = request.backImageBase64 === null || isImage(request.backImageBase64) ? request.backImageBase64 ?? null : undefined;
  const sensitivities = Array.isArray(request.sensitivities) ? request.sensitivities.filter((item): item is AnalyzeRequest["sensitivities"][number] => sensitivityKeys.includes(item as AnalyzeRequest["sensitivities"][number])) : [];
  if (!query.trim() && !frontImageBase64 && !backImageBase64) return "Enter product text or upload a label image.";
  if (query.length > 15000) return "Product text is limited to 15,000 characters.";
  if (personalContext.length > 1000) return "Personal context is limited to 1,000 characters.";
  if (frontImageBase64 === undefined || backImageBase64 === undefined) return "Images must be PNG, JPEG, or WebP data URLs.";
  const images = [frontImageBase64, backImageBase64].filter((image): image is string => Boolean(image));
  if (images.some((image) => decodedBytes(image) > 4 * 1024 * 1024)) return "Each source image must be 4 MB or smaller.";
  if (images.reduce((total, image) => total + decodedBytes(image), 0) > 2.4 * 1024 * 1024) return "Compressed label images must total 2.4 MB or less.";
  return { query, personalContext, frontImageBase64, backImageBase64, sensitivities, presetId: null, forceLive: true };
}

function sse(event: PipelineEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!hasClockedApiKey()) return errorResponse("Live scanning is unavailable. Add CLOCKED_API_KEY to .env.local and restart the server.", 503);
  const body = await request.json().catch(() => null);
  const validated = validate(body);
  if (typeof validated === "string") return errorResponse(validated, 422);
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const deviceId = request.headers.get("x-device-id") || "unknown-device";
  const allowance = consumeLiveScan(rateLimitKey(forwarded, deviceId));
  if (!allowance.allowed) return errorResponse(`Live scan limit reached. Try again after ${new Date(allowance.resetAt).toISOString()}.`, 429);
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const resolved = validated.query.trim() ? await resolveInputText(validated.query) : { text: "", source: { type: "text" as const } };
        if (resolved.source.type === "youtube") controller.enqueue(sse({ stage: "resolve_source", payload: { status: "resolved", source: resolved.source, transcriptLength: resolved.text.length } }));
        for await (const event of runPipeline({ ...validated, query: resolved.text, inputSource: resolved.source })) controller.enqueue(sse(event));
      } catch (error) {
        const message = error instanceof ClockedError || error instanceof InputResolutionError ? error.message : "The live scan could not be completed.";
        controller.enqueue(sse({ stage: "error", payload: { message } }));
      } finally {
        controller.close();
      }
    }
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
