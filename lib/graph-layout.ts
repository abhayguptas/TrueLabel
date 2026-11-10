import type { AnalyzeResult, GraphEdge, GraphNode, IngredientResult } from "@/lib/types";

function matchIngredient(claimText: string, ingredients: IngredientResult[]): IngredientResult | undefined {
  const normClaim = claimText.toLowerCase();
  // Direct keyword matches
  if (/palm|oil/i.test(normClaim)) {
    const oil = ingredients.find((i) => /oil|fat|palmolein/i.test(i.name));
    if (oil) return oil;
  }
  if (/wheat|atta|maida|flour|bread|grain/i.test(normClaim)) {
    const flour = ingredients.find((i) => /flour|atta|maida|wheat|grain/i.test(i.name));
    if (flour) return flour;
  }
  if (/sugar|sweet/i.test(normClaim)) {
    const sugar = ingredients.find((i) => /sugar|syrup|glucose|malt/i.test(i.name));
    if (sugar) return sugar;
  }
  if (/fibre|fiber/i.test(normClaim)) {
    const bran = ingredients.find((i) => /bran|atta|wheat|fibre|fiber/i.test(i.name));
    if (bran) return bran;
  }
  if (/b5|panthenol/i.test(normClaim)) {
    const b5 = ingredients.find((i) => /panthenol|b5/i.test(i.name));
    if (b5) return b5;
  }
  // Generic keyword match
  return ingredients.find((i) => normClaim.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(normClaim));
}

export function buildGraph(result: AnalyzeResult): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const claims = result.claims.slice(0, 5);
  const ingredients = result.ingredients.slice(0, 6);
  const references = result.references.slice(0, 5);
  const activeTriggers = new Set(result.risks.flatMap((risk) => risk.triggers));

  const nodes: GraphNode[] = [
    ...claims.map((claim) => ({ id: `claim-${claim.id}`, label: claim.claim, column: 0 as const, verdict: claim.verdict })),
    ...ingredients.map((ingredient) => ({
      id: `ingredient-${ingredient.name}`,
      label: ingredient.name,
      column: 1 as const,
      verdict: activeTriggers.has(ingredient.name) ? ("caution" as const) : undefined
    })),
    ...references.map((reference) => ({ id: `reference-${reference.id}`, label: reference.title, column: 2 as const }))
  ];

  const edges: GraphEdge[] = [];

  claims.forEach((claim, index) => {
    const claimId = `claim-${claim.id}`;
    // Find best matching ingredient or fallback
    const matchedIng = matchIngredient(claim.claim, ingredients) ?? ingredients[index % Math.max(ingredients.length, 1)];

    // Find best matching reference (or back-label / science)
    const matchedRef =
      (claim.evidence?.documentId ? references.find((r) => r.id === claim.evidence?.documentId) : undefined) ??
      references.find((r) => r.id !== "back-label-facts") ??
      references[0];

    if (matchedIng) {
      edges.push({
        id: `${claimId}-${matchedIng.name}`,
        from: claimId,
        to: `ingredient-${matchedIng.name}`,
        verdict: claim.verdict,
        claimId: claim.id
      });

      if (matchedRef) {
        edges.push({
          id: `${matchedIng.name}-${matchedRef.id}`,
          from: `ingredient-${matchedIng.name}`,
          to: `reference-${matchedRef.id}`,
          verdict: claim.verdict,
          claimId: claim.id
        });
      }
    } else if (matchedRef) {
      edges.push({
        id: `${claimId}-${matchedRef.id}`,
        from: claimId,
        to: `reference-${matchedRef.id}`,
        verdict: claim.verdict,
        claimId: claim.id
      });
    }
  });

  return { nodes, edges };
}
