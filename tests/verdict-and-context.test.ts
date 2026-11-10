import { describe, expect, it } from "vitest";
import { interpretPersonalContext } from "../lib/pipeline-runner";
import { synthesizeExecutiveVerdict } from "../lib/verdict-synthesizer";
import { generateFullReportHtml } from "../lib/report-exporter";
import type { AnalyzeResult, IngredientResult } from "../lib/types";

describe("interpretPersonalContext", () => {
  const chipsIngredients: IngredientResult[] = [
    { name: "Refined Wheat Flour (Maida)", triggers: [] },
    { name: "Vegetable Oil (Palm Oil)", triggers: ["palm_oil_free"] },
    { name: "Potato Flakes", triggers: [] },
    { name: "Starch", triggers: [] },
    { name: "Sugar", triggers: ["diabetic"] },
    { name: "Iodized Salt", triggers: [] },
    { name: "Acidity Regulator (INS 330)", triggers: [] },
    { name: "Flavour Enhancers (INS 621, INS 631)", triggers: [] },
    { name: "Artificial Flavours (Sour Cream & Herbs)", triggers: [] },
    { name: "Artificial Colours (INS 102, INS 110)", triggers: [] },
    { name: "Anti-caking Agent (INS 551)", triggers: [] },
    { name: "Preservative (INS 211)", triggers: [] }
  ];

  it("detects high blood pressure and digestion triggers in snack chips", () => {
    const result = interpretPersonalContext("high blood pressure, and digestion problem", chipsIngredients, 0.5);
    expect(result.verdict).toBe("high");
    expect(result.probability).toBeGreaterThanOrEqual(0.8);
    expect(result.message).toContain("Trigger Alert");
    // Should flag salt/sodium/INS 621 (MSG) and maida/palm oil/INS 330
    expect(result.message.toLowerCase()).toMatch(/salt|621|maida|palm/);
  });

  it("detects celiac and gluten sensitivity", () => {
    const result = interpretPersonalContext("I have celiac disease and strictly avoid gluten", chipsIngredients, 0.5);
    expect(result.verdict).toBe("high");
    expect(result.message).toContain("Refined Wheat Flour (Maida)");
  });

  it("returns low verdict when user context has zero matching triggers", () => {
    const result = interpretPersonalContext("peanut and tree nut allergy only", [
      { name: "Water", triggers: [] },
      { name: "Glycerin", triggers: [] },
      { name: "Rice Bran Oil", triggers: [] }
    ], 0.1);
    expect(result.verdict).toBe("low");
    expect(result.message).toContain("All Clear");
  });
});

describe("synthesizeExecutiveVerdict", () => {
  const mockResult: AnalyzeResult = {
    claims: [
      {
        id: "1",
        claim: "Made from Whole Wheat",
        verdict: "contradicted",
        confidence: 0.95,
        evidence: {
          text: "Refined Wheat Flour (Maida), Vegetable Oil (Palm Oil), Potato Flakes, Starch, Sugar, Iodized Salt"
        }
      },
      {
        id: "2",
        claim: "Uses Extra Virgin Olive Oil",
        verdict: "contradicted",
        confidence: 0.95,
        evidence: {
          text: "Refined Wheat Flour (Maida), Vegetable Oil (Palm Oil), Potato Flakes, Starch, Sugar, Iodized Salt"
        }
      },
      {
        id: "3",
        claim: "100% Natural Flavors",
        verdict: "contradicted",
        confidence: 0.95,
        evidence: {
          text: "Flavour Enhancers (INS 621, INS 631), Artificial Flavours, Artificial Colours (INS 102, INS 110)"
        }
      }
    ],
    ingredients: [
      { name: "Refined Wheat Flour (Maida)", triggers: [] },
      { name: "Vegetable Oil (Palm Oil)", triggers: ["palm_oil_free"] },
      { name: "Artificial Colours (INS 102, INS 110)", triggers: [] }
    ],
    ingredientReviews: [
      { ingredient: "Refined Wheat Flour (Maida)", status: "reference", summary: "Milled flour stripped of bran and germ." },
      { ingredient: "Vegetable Oil (Palm Oil)", status: "reference", summary: "Refined tropical vegetable oil high in palmitic acid." }
    ],
    references: [],
    conflicts: [
      {
        left: "Uses Extra Virgin Olive Oil",
        right: "Vegetable Oil (Palm Oil)",
        detail: "Formulation Discrepancy",
        confidence: 0.98
      }
    ],
    risks: [],
    overallCaution: {
      probability: 0.95,
      verdict: "high",
      message: "Multiple front claims contradicted by declared ingredients."
    },
    personalContextCaution: {
      probability: 0.92,
      verdict: "high",
      message: "Trigger Alert: Disclosed ingredients contain match(es) for your stated context: Palm Oil, Iodized Salt."
    },
    productCategory: "packaged food",
    sourceMode: "text"
  };

  it("synthesizes clean executive verdict without raw ingredient repeats", () => {
    const verdict = synthesizeExecutiveVerdict(mockResult);
    expect(verdict.score).toBeLessThanOrEqual(25);
    expect(verdict.statusBadge).toBe("red");
    expect(verdict.statusLabel).toBe("Discrepancy Detected");
    expect(verdict.headline).toContain("Severe Marketing Discrepancy");
    expect(verdict.realityBullets).toHaveLength(3);

    // Bullet findings should be concise human sentences, not 200-char dump
    const oliveBullet = verdict.realityBullets.find((b) => b.claim.includes("Olive Oil"));
    expect(oliveBullet).toBeDefined();
    expect(oliveBullet?.finding).toContain("Palm Oil");
    expect(oliveBullet?.finding).not.toContain("Potato Flakes");

    // Legal disclaimer must be present
    expect(verdict.disclaimer).toContain("Regulatory & Health Notice");
    expect(verdict.disclaimer).toContain("TrueLabel is an independent algorithmic evidence verification system");
  });

  it("generates comprehensive downloadable report HTML with disclaimer and print action", () => {
    const html = generateFullReportHtml(mockResult);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("TrueLabel <span>Consumer Truth Engine</span>");
    expect(html).toContain("Print / Save as PDF");
    expect(html).toContain("Executive Audit Verdict");
    expect(html).toContain("Regulatory &amp; Consumer Advisory Notice");
  });
});

