import type { AnalyzeResult, GraphEdge, GraphNode } from "@/lib/types";

export function buildGraph(result: AnalyzeResult): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const claims = result.claims.slice(0, 4);
  const ingredients = result.ingredients.slice(0, 5);
  const references = result.references.slice(0, 5);
  const activeTriggers = new Set(result.risks.flatMap((risk) => risk.triggers));
  const nodes: GraphNode[] = [
    ...claims.map((claim) => ({ id: `claim-${claim.id}`, label: claim.claim, column: 0 as const, verdict: claim.verdict })),
    ...ingredients.map((ingredient) => ({ id: `ingredient-${ingredient.name}`, label: ingredient.name, column: 1 as const, verdict: activeTriggers.has(ingredient.name) ? "caution" as const : undefined })),
    ...references.map((reference) => ({ id: `reference-${reference.id}`, label: reference.title, column: 2 as const }))
  ];
  const edges = claims.flatMap((claim, index) => {
    const ingredient = ingredients[index % Math.max(ingredients.length, 1)];
    const reference = references[index % Math.max(references.length, 1)];
    const claimId = `claim-${claim.id}`;
    const links: GraphEdge[] = [];
    if (ingredient) links.push({ id: `${claimId}-${ingredient.name}`, from: claimId, to: `ingredient-${ingredient.name}`, verdict: claim.verdict, claimId: claim.id });
    if (reference) links.push({ id: `${claimId}-${reference.id}`, from: claimId, to: `reference-${reference.id}`, verdict: claim.verdict, claimId: claim.id });
    return links;
  });
  return { nodes, edges };
}
