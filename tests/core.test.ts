import { describe, expect, it, beforeEach } from "vitest";
import { cacheKey } from "../lib/content-cache";
import { consumeLiveScan, resetRateLimits } from "../lib/rate-limiter";
import { unicodeSlice } from "../lib/unicode-slice";
import { extractYouTubeId, isUnsupportedVideoUrl } from "../lib/youtube-resolver";

describe("unicodeSlice", () => {
  it("uses Unicode code point offsets", () => {
    expect(unicodeSlice("Dose: 50µg ™", 6, 10)).toBe("50µg");
  });
});

describe("cacheKey", () => {
  it("is stable when object keys are reordered", () => {
    expect(cacheKey("fill", { b: 2, a: { z: 1, y: 2 } })).toBe(cacheKey("fill", { a: { y: 2, z: 1 }, b: 2 }));
  });
});

describe("consumeLiveScan", () => {
  beforeEach(resetRateLimits);
  it("allows fifteen scans then blocks the sixteenth", () => {
    for (let index = 0; index < 15; index += 1) expect(consumeLiveScan("device", 1000 + index).allowed).toBe(true);
    expect(consumeLiveScan("device", 1100).allowed).toBe(false);
  });
});

describe("video input detection", () => {
  it("recognizes supported YouTube URLs and unsupported social video URLs", () => {
    expect(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(isUnsupportedVideoUrl("https://www.instagram.com/reel/example/")).toBe(true);
    expect(isUnsupportedVideoUrl("A product claim about skincare")).toBe(false);
  });
});

