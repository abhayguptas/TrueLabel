import { describe, expect, it } from "vitest";
import {
  interpretPersonalContext,
  isTestableClaim,
  parseExplicitClaims,
  matchesIngredientTerm,
  evaluateNegativeAssertion,
  cleanConflictText
} from "../lib/pipeline-runner";
import { synthesizeExecutiveVerdict } from "../lib/verdict-synthesizer";
import { generateFullReportHtml } from "../lib/report-exporter";
import { buildGraph } from "../lib/graph-layout";
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

  it("handles unindexed product without dropping truth score to 0/100", () => {
    const unindexedResult: AnalyzeResult = {
      ...mockResult,
      claims: [
        { id: "1", claim: "Gentle hydration", verdict: "unproven", confidence: 0.2 },
        { id: "2", claim: "Clean formula", verdict: "not_stated", confidence: 0.1 }
      ],
      conflicts: []
    };
    const verdict = synthesizeExecutiveVerdict(unindexedResult);
    expect(verdict.score).toBeGreaterThanOrEqual(50);
    expect(verdict.statusBadge).toBe("amber");
    expect(verdict.statusLabel).toBe("Awaiting Clinical Evidence");
    expect(verdict.headline).toContain("Awaiting Clinical Evidence");
  });
});

describe("claim parsing and negative assertions", () => {
  it("keeps Non-Comedogenic and functional claims while rejecting pure buzzwords", () => {
    expect(isTestableClaim("Non-Comedogenic")).toBe(true);
    expect(isTestableClaim("Fragrance-Free")).toBe(true);
    expect(isTestableClaim("10% Vitamin B5")).toBe(true);
    expect(isTestableClaim("Delicious")).toBe(false);
    expect(isTestableClaim("Delicious Paradise")).toBe(false);
    expect(isTestableClaim("Since 1973")).toBe(false);
  });

  it("extracts all explicit claims from formatted text without dropping items", () => {
    const text = `Product: Minimalist Vitamin B5 10% Moisturizer
Front Claims: 10% Vitamin B5 (Panthenol) Moisturizer, Deeply hydrates skin & repairs skin barrier, Fragrance-Free, Non-Comedogenic
Back Label Ingredients: Aqua, Panthenol (10%), Caprylic/Capric Triglyceride, Glycerin, Betaine, Polyacrylate-13, Polysorbate 20, Phenoxyethanol, Ethylhexylglycerin.`;
    const claims = parseExplicitClaims(text);
    expect(claims).toHaveLength(4);
    expect(claims).toContain("Non-Comedogenic");
    expect(claims).toContain("Fragrance-Free");

    const shilajitText = `Product: Pure Himalayan Shilajit Booster Resin
Front Claims: Clinically proven to lower cortisol by 80% and double testosterone in 14 days, 60% Fulvic Acid
Back Label Ingredients: Purified Shilajit Resin (250mg), Ashwagandha Extract (50mg), Maltodextrin, Potassium Sorbate.`;
    const shilajitClaims = parseExplicitClaims(shilajitText);
    console.log("Extracted Shilajit claims:", shilajitClaims);
    expect(shilajitClaims.length).toBeGreaterThanOrEqual(2);
  });

  it("matches whole chemical words and prevents Glycerin matching Ethylhexylglycerin", () => {
    expect(matchesIngredientTerm("Glycerin", "Glycerin")).toBe(true);
    expect(matchesIngredientTerm("Vegetable Glycerin", "Glycerin")).toBe(true);
    expect(matchesIngredientTerm("Ethylhexylglycerin", "Glycerin")).toBe(false);
  });

  it("verifies negative assertions like Fragrance-Free and No Palm Oil", () => {
    const fragranceFreeIngredients: IngredientResult[] = [
      { name: "Aqua", triggers: [] },
      { name: "Panthenol (10%)", triggers: [] },
      { name: "Glycerin", triggers: [] }
    ];
    const res = evaluateNegativeAssertion("Fragrance-Free", fragranceFreeIngredients);
    expect(res?.verified).toBe(true);
    expect(res?.reason).toContain("zero fragrance");
  });

  it("evaluates Nature's Crunch chips claims (Natural Flavors, Whole Wheat, Olive Oil) against back label", () => {
    const chipsIngredients: IngredientResult[] = [
      { name: "Refined Wheat Flour (Maida)", triggers: [] },
      { name: "Vegetable Oil (Palm Oil)", triggers: ["palm_oil_free"] },
      { name: "Potato Flakes", triggers: [] },
      { name: "Artificial Flavours (Sour Cream & Herbs)", triggers: [] },
      { name: "Flavour Enhancers (INS 621, INS 631)", triggers: [] },
      { name: "Artificial Colours (INS 102, INS 110)", triggers: [] }
    ];

    const naturalFlavors = evaluateNegativeAssertion("100% Natural Flavors", chipsIngredients);
    expect(naturalFlavors?.verified).toBe(false);
    expect(naturalFlavors?.reason).toContain("Contradicted");
    expect(naturalFlavors?.reason).toMatch(/synthetic|Artificial Flavours/i);

    const wholeWheat = evaluateNegativeAssertion("Made from Whole Wheat", chipsIngredients);
    expect(wholeWheat?.verified).toBe(false);
    expect(wholeWheat?.reason).toContain("Contradicted");
    expect(wholeWheat?.reason).toContain("Maida");

    const oliveOil = evaluateNegativeAssertion("Uses Extra Virgin Olive Oil", chipsIngredients);
    expect(oliveOil?.verified).toBe(false);
    expect(oliveOil?.reason).toContain("Contradicted");
    expect(oliveOil?.reason).toContain("Palm Oil");
  });
});

describe("buildGraph edge and node key uniqueness", () => {
  it("never generates duplicate edge IDs or node IDs when claims share ingredients and sources", () => {
    const multiClaimResult: AnalyzeResult = {
      claims: [
        { id: "1", claim: "100% Whole Wheat Brown Bread", verdict: "contradicted", confidence: 0.95 },
        { id: "2", claim: "No Palm Oil", verdict: "supported", confidence: 0.95 },
        { id: "3", claim: "28% Daily Fibre Need", verdict: "supported", confidence: 0.95 },
        { id: "4", claim: "No Added Colours", verdict: "supported", confidence: 0.95 }
      ],
      ingredients: [
        { name: "Wheat Flour [Atta (50%)]", triggers: [] },
        { name: "Refined Wheat Flour [Maida(50%)]", triggers: [] },
        { name: "Edible Vegetable Oil (Rice Bran)", triggers: [] },
        { name: "Wheat Bran", triggers: [] }
      ],
      references: [
        { id: "web-scrape-1", title: "Web Evidence: Whole Wheat", text: "...", sourceUrl: "https://example.com" },
        { id: "bread-fiber-color-standard", title: "FSSAI Whole Wheat Standard", text: "...", sourceUrl: "https://fssai.gov.in" }
      ],
      conflicts: [],
      risks: [],
      productCategory: "packaged food",
      sourceMode: "text"
    };

    const { nodes, edges } = buildGraph(multiClaimResult);
    const nodeIds = nodes.map((n) => n.id);
    const edgeIds = edges.map((e) => e.id);

    // Assert complete uniqueness
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    expect(new Set(edgeIds).size).toBe(edgeIds.length);
  });

  it("builds complete 3-column graph for Shilajit with full card clearance and no cutoffs", () => {
    const shilajitResult: AnalyzeResult = {
      claims: [
        { id: "1", claim: "Clinically proven to lower cortisol by 80%", verdict: "contradicted", confidence: 0.95 },
        { id: "2", claim: "Double testosterone in 14 days", verdict: "contradicted", confidence: 0.95 },
        { id: "3", claim: "60% Fulvic Acid", verdict: "supported", confidence: 0.94 }
      ],
      ingredients: [
        { name: "Purified Shilajit Resin (250mg)", triggers: [] },
        { name: "Ashwagandha Extract (50mg)", triggers: [] },
        { name: "Maltodextrin", triggers: ["diabetic"] },
        { name: "Potassium Sorbate", triggers: [] }
      ],
      references: [
        { id: "shilajit-trial", title: "Randomized Trial on Shilajit", text: "...", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov" },
        { id: "back-label-facts", title: "Official Back-Label Disclosures", text: "...", sourceUrl: "#" }
      ],
      conflicts: [],
      risks: [],
      productCategory: "supplement",
      sourceMode: "text"
    };

    const { nodes, edges } = buildGraph(shilajitResult);
    const claimNodes = nodes.filter((n) => n.column === 0);
    const ingredientNodes = nodes.filter((n) => n.column === 1);
    const referenceNodes = nodes.filter((n) => n.column === 2);

    expect(claimNodes.length).toBe(3);
    expect(ingredientNodes.length).toBe(4);
    expect(referenceNodes.length).toBe(2);
    expect(edges.length).toBeGreaterThanOrEqual(3);
  });

  it("cleans raw LLM conflict prefixes and eliminates duplicate cards for the same claim", () => {
    const rawLeft1 = 'Front Marketing Claim: "100% Natural Flavors"';
    const rawRight1 = 'Back-Label Disclosed Additive: Flavour Enhancers (INS 621, INS 631).';
    const rawRight2 = 'Packaging discloses synthetic artificial flavours and flavour enhancers.';

    expect(cleanConflictText(rawLeft1)).toBe('100% Natural Flavors');
    expect(cleanConflictText(rawRight1)).toBe('Flavour Enhancers (INS 621, INS 631).');
    expect(cleanConflictText(rawRight2)).toBe('synthetic artificial flavours and flavour enhancers.');

    // Simulate grouping by claim
    const rawList = [
      { left: rawLeft1, right: rawRight1, detail: "scope", confidence: 0.95 },
      { left: rawLeft1, right: rawRight2, detail: "scope", confidence: 0.95 },
      { left: 'Front Marketing Claim: "Uses Extra Virgin Olive Oil."', right: 'Back-Label Disclosed Oil: Vegetable Oil (Palm Oil).', detail: "conflict", confidence: 0.95 }
    ];

    const conflictsByClaim = new Map<string, { left: string; right: string }>();
    for (const c of rawList) {
      const cleanLeft = cleanConflictText(c.left);
      const cleanRight = cleanConflictText(c.right);
      const normKey = cleanLeft.toLowerCase();
      if (!conflictsByClaim.has(normKey)) {
        conflictsByClaim.set(normKey, { left: cleanLeft, right: cleanRight });
      } else {
        const existing = conflictsByClaim.get(normKey)!;
        existing.right = `${existing.right} ${cleanRight}`.trim();
      }
    }

    const uniqueConflicts = Array.from(conflictsByClaim.values());
    expect(uniqueConflicts.length).toBe(2);
    expect(uniqueConflicts[0].left).toBe('100% Natural Flavors');
    expect(uniqueConflicts[0].right).toContain('Flavour Enhancers');
    expect(uniqueConflicts[0].right).toContain('synthetic artificial flavours');
    expect(uniqueConflicts[1].left).toBe('Uses Extra Virgin Olive Oil.');
  });
});

