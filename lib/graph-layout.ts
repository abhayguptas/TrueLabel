import type { AnalyzeResult, GraphEdge, GraphNode, IngredientResult } from "@/lib/types";

function matchIngredient(claimText: string, ingredients: IngredientResult[]): IngredientResult | undefined {
  const normClaim = claimText.toLowerCase();

  if (/b5|panthenol/i.test(normClaim)) {
    const b5 = ingredients.find((i) => /panthenol|b5/i.test(i.name));
    if (b5) return b5;
  }
  if (/cortisol|testosterone|shilajit|fulvic/i.test(normClaim)) {
    const shilajit = ingredients.find((i) => /shilajit|ashwagandha/i.test(i.name));
    if (shilajit) return shilajit;
  }
  if (/palm|oil|olive|sunflower/i.test(normClaim)) {
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
  if (/fragrance/i.test(normClaim)) {
    const frag = ingredients.find((i) => /fragrance|parfum|perfume/i.test(i.name));
    if (frag) return frag;
    // If fragrance-free, connect to the first base ingredient to show the absence check
    return ingredients[0];
  }
  if (/comedogenic/i.test(normClaim)) {
    const ester = ingredients.find((i) => /polysorbate|caprylic|ester|oil/i.test(i.name));
    if (ester) return ester;
  }

  return ingredients.find((i) => {
    const normName = i.name.toLowerCase();
    return normClaim.includes(normName) || normName.includes(normClaim);
  });
}

export function buildGraph(result: AnalyzeResult): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const claims = result.claims.slice(0, 6);
  const ingredients = result.ingredients.slice(0, 6);
  const references = result.references.slice(0, 6);

  // Collect all triggered ingredients from both selected sensitivity pills and personal context
  const activeTriggers = new Set<string>();
  for (const risk of result.risks) {
    for (const trig of risk.triggers) activeTriggers.add(trig.toLowerCase());
  }
  if (result.personalContextCaution && result.personalContextCaution.verdict === "high") {
    const msg = result.personalContextCaution.message.toLowerCase();
    for (const ing of ingredients) {
      if (msg.includes(ing.name.toLowerCase())) {
        activeTriggers.add(ing.name.toLowerCase());
      }
    }
  }

  const nodes: GraphNode[] = [
    ...claims.map((claim) => ({
      id: `claim-${claim.id}`,
      label: claim.claim,
      column: 0 as const,
      verdict: claim.verdict
    })),
    ...ingredients.map((ingredient) => {
      const isTriggered =
        activeTriggers.has(ingredient.name.toLowerCase()) ||
        ingredient.triggers.some((t) => activeTriggers.has(t.toLowerCase()));
      return {
        id: `ingredient-${ingredient.name}`,
        label: ingredient.name,
        column: 1 as const,
        verdict: isTriggered ? ("caution" as const) : undefined
      };
    }),
    ...references.map((reference) => ({
      id: `reference-${reference.id}`,
      label: reference.title,
      column: 2 as const
    }))
  ];

  const edges: GraphEdge[] = [];
  const seenEdgeKeys = new Set<string>();

  claims.forEach((claim, index) => {
    const claimId = `claim-${claim.id}`;
    const matchedIng = matchIngredient(claim.claim, ingredients) ?? ingredients[index % Math.max(ingredients.length, 1)];

    // Find best matching reference
    let matchedRef = claim.evidence?.documentId
      ? references.find((r) => r.id === claim.evidence?.documentId)
      : undefined;

    if (!matchedRef) {
      if (/cortisol|testosterone|shilajit/i.test(claim.claim)) {
        matchedRef = references.find((r) => r.id === "shilajit-trial" || /shilajit/i.test(r.title));
      } else if (/fibre|color|colours|brown bread/i.test(claim.claim)) {
        matchedRef = references.find((r) => r.id === "bread-fiber-color-standard" || /whole wheat|fibre/i.test(r.title));
      }
    }

    if (!matchedRef) {
      matchedRef = references.find((r) => r.id !== "back-label-facts") ?? references[0];
    }

    if (matchedIng) {
      const edge1Id = `edge-claim-${claim.id}-ing-${matchedIng.name}`;
      if (!seenEdgeKeys.has(edge1Id)) {
        seenEdgeKeys.add(edge1Id);
        edges.push({
          id: edge1Id,
          from: claimId,
          to: `ingredient-${matchedIng.name}`,
          verdict: claim.verdict,
          claimId: claim.id
        });
      }

      if (matchedRef) {
        const edge2Id = `edge-ing-${matchedIng.name}-ref-${matchedRef.id}`;
        if (!seenEdgeKeys.has(edge2Id)) {
          seenEdgeKeys.add(edge2Id);
          edges.push({
            id: edge2Id,
            from: `ingredient-${matchedIng.name}`,
            to: `reference-${matchedRef.id}`,
            verdict: claim.verdict,
            claimId: claim.id
          });
        }
      }
    } else if (matchedRef) {
      const edgeDirectId = `edge-direct-${claim.id}-ref-${matchedRef.id}`;
      if (!seenEdgeKeys.has(edgeDirectId)) {
        seenEdgeKeys.add(edgeDirectId);
        edges.push({
          id: edgeDirectId,
          from: claimId,
          to: `reference-${matchedRef.id}`,
          verdict: claim.verdict,
          claimId: claim.id
        });
      }
    }
  });

  return { nodes, edges };
}
