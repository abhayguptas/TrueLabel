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

export async function recoverCaseSensitiveVideoId(typedId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(typedId)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      html.match(/watch%3Fv%3D([A-Za-z0-9_-]{11})/i) ||
      html.match(/watch\?v=([A-Za-z0-9_-]{11})/i) ||
      html.match(/youtu\.be\/([A-Za-z0-9_-]{11})/i);
    if (match && match[1].toLowerCase() === typedId.toLowerCase()) {
      return match[1];
    }
  } catch {}
  return null;
}

export async function fetchOEmbedMetadata(
  videoId: string
): Promise<{ title: string; author: string } | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.title) {
        return { title: String(data.title), author: String(data.author_name ?? "") };
      }
    }
  } catch {}
  return null;
}

export async function resolveInputText(value: string): Promise<ResolvedInput> {
  const text = value.trim();
  if (isUnsupportedVideoUrl(text)) {
    throw new InputResolutionError(
      "Instagram and TikTok block reliable public caption reads. Paste the transcript or product claim text directly."
    );
  }
  let videoId = extractYouTubeId(text);
  if (!videoId) return { text, source: { type: "text" } };

  // Resilient multi-tier transcript resolution
  const tryFetchTranscript = async (id: string): Promise<Array<{ text: string }> | null> => {
    const attempts = [
      () => YoutubeTranscript.fetchTranscript(id, { lang: "en" }),
      () => YoutubeTranscript.fetchTranscript(id, { lang: "en-US" }),
      () => YoutubeTranscript.fetchTranscript(id, { lang: "en-GB" }),
      () => YoutubeTranscript.fetchTranscript(id) // Any default available language
    ];

    for (const attempt of attempts) {
      try {
        const res = await attempt();
        if (Array.isArray(res) && res.length > 0) {
          return res;
        }
      } catch {
        // Continue to next fallback attempt
      }
    }
    return null;
  };

  let transcriptEntries = await tryFetchTranscript(videoId);

  // If transcript failed, check for case-sensitivity mismatch in typed video ID
  if (!transcriptEntries) {
    const recoveredId = await recoverCaseSensitiveVideoId(videoId);
    if (recoveredId && recoveredId !== videoId) {
      videoId = recoveredId;
      transcriptEntries = await tryFetchTranscript(recoveredId);
    }
  }

  // If captions were found, decode and return clean transcript
  if (transcriptEntries && transcriptEntries.length > 0) {
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

    if (resolved.length >= 15) {
      return {
        text: resolved.slice(0, 15000),
        source: { type: "youtube", videoId, label: `YouTube caption transcript (${videoId})` }
      };
    }
  }

  // Graceful fallback to official video metadata via oEmbed if captions are disabled or restricted
  const oembed = await fetchOEmbedMetadata(videoId);
  if (oembed) {
    return {
      text: `Product Ad Video: "${oembed.title}" by ${oembed.author || "Brand"}.\nMarketing claim: ${oembed.title}. Check formulation claims and active ingredient disclosures.`,
      source: {
        type: "youtube",
        videoId,
        label: `YouTube Video: ${oembed.title} (Captions disabled; analyzing ad title & claims)`
      }
    };
  }

  throw new InputResolutionError(
    `Could not extract captions from this YouTube video (${videoId}). The video may be unavailable or closed captions are disabled. Please paste the ad claim or transcript directly.`
  );
}
