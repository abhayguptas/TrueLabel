import { YoutubeTranscript } from "youtube-transcript";

export class InputResolutionError extends Error {}

export interface ResolvedInput {
  text: string;
  source: { type: "text" | "youtube"; label?: string; videoId?: string };
}

export function extractYouTubeId(value: string): string | null {
  const url = value.trim();
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|v\/|live\/))([A-Za-z0-9_-]{11})/i);
  return match?.[1] ?? null;
}

export function isUnsupportedVideoUrl(value: string): boolean {
  return /(?:instagram\.com|tiktok\.com)\//i.test(value);
}

export async function resolveInputText(value: string): Promise<ResolvedInput> {
  const text = value.trim();
  if (isUnsupportedVideoUrl(text)) throw new InputResolutionError("Instagram and TikTok block reliable public caption reads. Paste the transcript or product claim text directly.");
  const videoId = extractYouTubeId(text);
  if (!videoId) return { text, source: { type: "text" } };
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    const resolved = transcript.map((entry) => entry.text).join(" ").replace(/\s+/g, " ").trim();
    if (resolved.length < 20) throw new Error("The caption track was empty.");
    return { text: resolved.slice(0, 15000), source: { type: "youtube", videoId, label: `YouTube caption transcript (${videoId})` } };
  } catch {
    throw new InputResolutionError("Could not extract English captions from this YouTube video. The creator may have disabled captions. Paste the ad text directly.");
  }
}
