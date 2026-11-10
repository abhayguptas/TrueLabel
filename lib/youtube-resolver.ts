import { YoutubeTranscript } from "youtube-transcript";

export class InputResolutionError extends Error {}

export interface ResolvedInput {
  text: string;
  source: { type: "text" | "youtube"; label?: string; videoId?: string };
}

export function extractYouTubeId(value: string): string | null {
  const url = value.trim();
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|v\/|live\/))([A-Za-z0-9_-]{11})/i
  );
  return match?.[1] ?? null;
}

export function isUnsupportedVideoUrl(value: string): boolean {
  return /(?:instagram\.com|tiktok\.com)\//i.test(value);
}

export async function resolveInputText(value: string): Promise<ResolvedInput> {
  const text = value.trim();
  if (isUnsupportedVideoUrl(text)) {
    throw new InputResolutionError(
      "Instagram and TikTok block reliable public caption reads. Paste the transcript or product claim text directly."
    );
  }
  const videoId = extractYouTubeId(text);
  if (!videoId) return { text, source: { type: "text" } };

  // Resilient multi-tier transcript resolution
  let transcriptEntries: Array<{ text: string }> | null = null;
  const attempts = [
    () => YoutubeTranscript.fetchTranscript(videoId, { lang: "en" }),
    () => YoutubeTranscript.fetchTranscript(videoId, { lang: "en-US" }),
    () => YoutubeTranscript.fetchTranscript(videoId, { lang: "en-GB" }),
    () => YoutubeTranscript.fetchTranscript(videoId) // Any default available language
  ];

  for (const attempt of attempts) {
    try {
      const res = await attempt();
      if (Array.isArray(res) && res.length > 0) {
        transcriptEntries = res;
        break;
      }
    } catch {
      // Continue to next fallback attempt
    }
  }

  if (!transcriptEntries || transcriptEntries.length === 0) {
    throw new InputResolutionError(
      "Could not extract captions from this YouTube video. The creator may not have enabled closed captions. Please paste the ad claim or transcript directly."
    );
  }

  const resolved = transcriptEntries
    .map((entry) => entry.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

  if (resolved.length < 15) {
    throw new InputResolutionError(
      "The YouTube video caption track was empty. Please paste the ad transcript or product text directly."
    );
  }

  return {
    text: resolved.slice(0, 15000),
    source: { type: "youtube", videoId, label: `YouTube caption transcript (${videoId})` }
  };
}
