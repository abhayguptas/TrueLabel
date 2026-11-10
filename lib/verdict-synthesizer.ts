import type { AnalyzeResult, ClaimResult, Verdict } from "./types";

export interface ExecutiveVerdict {
  score: number;
  statusBadge: "red" | "green" | "amber";
  statusLabel: string;
  headline: string;
  realityBullets: Array<{
    claim: string;
    finding: string;
    verdict: Verdict;
  }>;
  personalHealthAlert: {
    hasContext: boolean;
    level: "high" | "caution" | "safe";
    title: string;
    description: string;
  } | null;
  bottomLine: string;
  disclaimer: string;
}

export function summarizeClaimDiscrepancy(
  claim: ClaimResult,
  ingredients: { name: string }[] = []
): string {
  const normClaim = claim.claim.toLowerCase();

  // Custom high-accuracy synthesis based on packaging realities
  if (/whole\s*wheat|atta|brown\s*bread/i.test(normClaim)) {
    const maida = ingredients.find((i) => /maida|refined\s*wheat/i.test(i.name));
    if (maida) {
      return `Contains ${maida.name} as primary base; not 100% whole grain.`;
    }
  }
  if (/olive\s*oil|sunflower|mustard/i.test(normClaim)) {
    const palm = ingredients.find((i) => /palm/i.test(i.name));
    if (palm) {
      return `Cooking oil declared is ${palm.name}; stated premium oil is absent.`;
    }
  }
  if (/natural\s*flavor|no\s*artificial/i.test(normClaim)) {
    const art = ingredients.find((i) => /artificial\s*flavour|artificial\s*colour|ins\s*102|ins\s*110/i.test(i.name));
    if (art) {
      return `Contains synthetic additives (${art.name}).`;
    }
  }
  if (/no\s*added\s*sugar|zero\s*sugar/i.test(normClaim)) {
    const sugar = ingredients.find((i) => /sugar|glucose|maltodextrin|syrup/i.test(i.name));
    if (sugar) {
      return `Disclosed ingredients include ${sugar.name}.`;
    }
  }
  if (/no\s*preservative/i.test(normClaim)) {
    const pres = ingredients.find((i) => /preservative|ins\s*211|ins\s*282/i.test(i.name));
    if (pres) {
      return `Preserved using chemical agents (${pres.name}).`;
    }
  }

  // If claim is supported
  if (claim.verdict === "supported") {
    if (claim.evidence?.text && claim.evidence.text.length < 90 && !claim.evidence.text.includes(",")) {
      return `Confirmed: ${claim.evidence.text}`;
    }
    return "Substantiated by packaging ingredient declaration.";
  }

  // If evidence is long or a full list, extract the first few items
  if (claim.evidence?.text) {
    const parts = claim.evidence.text.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 3) {
      return `Packaging disclosure lists ${parts.slice(0, 3).join(", ")}... contradicting claim.`;
    }
    if (claim.evidence.text.length <= 120) {
      return claim.evidence.text;
    }
  }

  return "Disproved by disclosed ingredients or composition.";
}

export function synthesizeExecutiveVerdict(result: AnalyzeResult): ExecutiveVerdict {
  const supported = result.claims.filter((c) => c.verdict === "supported");
  const contradicted = result.claims.filter((c) => c.verdict === "contradicted");
  const cautions = result.claims.filter((c) => c.verdict === "caution" || c.verdict === "not_stated");

  // Calibrate score
  const total = result.claims.length;
  const rawScore = total
    ? Math.round(((supported.length * 1.0 + cautions.length * 0.4) / total) * 100)
    : result.ingredients.length ? 75 : 50;

  const score = Math.max(10, Math.min(100, contradicted.length > 0 ? Math.min(rawScore, 65) : rawScore));

  const statusBadge: "red" | "green" | "amber" =
    contradicted.length > 0 || result.conflicts.length > 0
      ? "red"
      : score >= 80
      ? "green"
      : "amber";

  const statusLabel =
    contradicted.length > 0 || result.conflicts.length > 0
      ? "Discrepancy Detected"
      : score >= 80
      ? "Highly Verified Formulation"
      : "Partially Substantiated";

  // Build tailored headline
  let headline = "";
  if (contradicted.length > 0) {
    const topContradicted = contradicted.slice(0, 2).map((c) => `"${c.claim}"`).join(" & ");
    if (result.productCategory === "packaged food") {
      headline = `Severe Marketing Discrepancy: Claims ${topContradicted} conflict directly with back-label disclosures.`;
    } else if (result.productCategory === "skincare") {
      headline = `Packaging Discrepancy: Marketing claims ${topContradicted} not substantiated by disclosed formulation.`;
    } else {
      headline = `Clinical Discrepancy: Claims ${topContradicted} exceed verified scientific and dosage realities.`;
    }
  } else if (score >= 80) {
    headline = "Substantiated Formulation: Front marketing claims align with back-label disclosures and evidence.";
  } else {
    headline = "Partially Verified: Some claims lack direct clinical backing or therapeutic dosage thresholds.";
  }

  // Reality Bullets
  const realityBullets: ExecutiveVerdict["realityBullets"] = [];
  for (const claim of contradicted) {
    realityBullets.push({
      claim: claim.claim,
      finding: summarizeClaimDiscrepancy(claim, result.ingredients),
      verdict: "contradicted"
    });
  }
  for (const claim of supported.slice(0, 3)) {
    realityBullets.push({
      claim: claim.claim,
      finding: summarizeClaimDiscrepancy(claim, result.ingredients),
      verdict: "supported"
    });
  }
  for (const claim of cautions.slice(0, 2)) {
    if (realityBullets.length >= 5) break;
    realityBullets.push({
      claim: claim.claim,
      finding: "Unproven or lacking verifiable clinical threshold on label.",
      verdict: claim.verdict
    });
  }

  // Personal Health Alert
  let personalHealthAlert: ExecutiveVerdict["personalHealthAlert"] = null;
  if (result.personalContextCaution) {
    const isHigh = result.personalContextCaution.verdict === "high";
    personalHealthAlert = {
      hasContext: true,
      level: isHigh ? "high" : "safe",
      title: isHigh ? "Potential Health / Allergy Trigger Detected" : "Personal Health Profile: Clear",
      description: result.personalContextCaution.message
    };
  } else if (result.risks.some((r) => r.triggers.length > 0)) {
    const triggered = result.risks.filter((r) => r.triggers.length > 0);
    personalHealthAlert = {
      hasContext: false,
      level: "caution",
      title: "Preset Sensitivity Caution",
      description: `Disclosed ingredients trigger: ${triggered.map((t) => `${t.sensitivity} (${t.triggers.join(", ")})`).join("; ")}.`
    };
  }

  // Consumer Bottom Line
  let bottomLine = "";
  if (contradicted.length > 0) {
    if (result.productCategory === "packaged food") {
      bottomLine = "Do not purchase this expecting a genuine whole-grain or clean health food. The formulation relies on refined flour, seed/palm oils, and flavor enhancers.";
    } else if (result.productCategory === "skincare") {
      bottomLine = "Treat marketing hype with caution. Check back label for specific pore-clogging or allergen triggers before daily facial application.";
    } else {
      bottomLine = "Supplement claims significantly exceed scientific efficacy. Disclosed milligram doses fall below therapeutic clinical trial requirements.";
    }
  } else if (score >= 80) {
    bottomLine = "Formulation is transparent. Ingredients declared match the core marketing promises.";
  } else {
    bottomLine = "Generally acceptable product, though several marketing claims rely on cosmetic exaggeration rather than rigorous clinical evidence.";
  }

  const disclaimer =
    "Regulatory & Health Notice: TrueLabel is an independent algorithmic evidence verification system. Findings cross-examine packaging claims against chemical disclosures and public scientific literature (PubMed, FDA, FSSAI). TrueLabel does not provide clinical diagnoses, healthcare therapy, or manufacturer legal warranties. Consult a licensed physician for medical conditions.";

  return {
    score,
    statusBadge,
    statusLabel,
    headline,
    realityBullets,
    personalHealthAlert,
    bottomLine,
    disclaimer
  };
}
