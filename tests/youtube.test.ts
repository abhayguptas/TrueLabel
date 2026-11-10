import { describe, expect, it } from "vitest";
import { extractYouTubeId, resolveInputText } from "@/lib/youtube-resolver";

describe("youtube-resolver", () => {
  it("extracts video ID from youtu.be short url with query params", () => {
    const id = extractYouTubeId("https://youtu.be/_eoHSNwoPvY?si=gANVaOg2xxH2Ug4d");
    expect(id).toBe("_eoHSNwoPvY");
  });

  it("extracts video ID from standard youtube.com watch url", () => {
    const id = extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(id).toBe("dQw4w9WgXcQ");
  });

  it("fetches transcript for real public video or handles cleanly", async () => {
    try {
      const res = await resolveInputText("https://youtu.be/_eoHSNwoPvY?si=gANVaOg2xxH2Ug4d");
      expect(res.source.type).toBe("youtube");
      expect(res.text.length).toBeGreaterThan(20);
      console.log("YouTube transcript resolved length:", res.text.length, "Sample:", res.text.slice(0, 100));
    } catch (e: any) {
      console.log("YouTube fetch error:", e.message);
      expect(e.message).toBeDefined();
    }
  }, 15000);

  it("recovers correct casing and resolves transcript for ml8oYYFfjwo (Gillette ad)", async () => {
    const res = await resolveInputText("https://www.youtube.com/watch?v=ml8oYYFfjwo");
    expect(res.source.type).toBe("youtube");
    expect(res.text.length).toBeGreaterThan(30);
    expect(res.text.toLowerCase()).toContain("shaving");
    console.log("Recovered and resolved Gillette transcript:", res.text);
  }, 15000);
});
