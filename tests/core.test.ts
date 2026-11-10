import { describe, expect, it, beforeEach } from "vitest";
import { cacheKey } from "../lib/content-cache";
import { consumeLiveScan, resetRateLimits } from "../lib/rate-limiter";
import { unicodeSlice } from "../lib/unicode-slice";

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

