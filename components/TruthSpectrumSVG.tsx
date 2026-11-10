"use client";

import { buildGraph } from "@/lib/graph-layout";
import type { AnalyzeResult, GraphNode, Verdict } from "@/lib/types";

const colors: Record<Verdict, string> = {
  supported: "#15803D",
  contradicted: "#B91C1C",
  caution: "#B45309",
  not_stated: "#B45309",
  unproven: "#B45309"
};

export function TruthSpectrumSVG({
  result,
  onClaimSelect
}: {
  result: AnalyzeResult;
  onClaimSelect: (id: string) => void;
}): React.ReactElement {
  const { nodes, edges } = buildGraph(result);
  const columns = [120, 410, 700];

  const nodeMap = new Map<string, { node: GraphNode; x: number; y: number }>();
  for (const node of nodes) {
    const columnNodes = nodes.filter((item) => item.column === node.column);
    const index = columnNodes.findIndex((item) => item.id === node.id);
    nodeMap.set(node.id, {
      node,
      x: columns[node.column],
      y: 74 + index * 95
    });
  }

  // Filter edges so we ONLY draw paths where BOTH source and target cards exist with valid coordinates
  const validEdges = edges.filter((edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to));

  const missing = [
    !result.claims.length ? "No testable claims" : "",
    !result.ingredients.length ? "No verified ingredients" : "",
    !result.references.length ? "No cited sources" : ""
  ].filter(Boolean);

  // Dynamically calculate height from the lowest card + generous 40px margin so no card is ever cut off
  const maxY = Math.max(
    ...Array.from(nodeMap.values()).map((item) => item.y + 40),
    420
  );
  const svgHeight = maxY + 40;

  return (
    <section className="spectrum">
      <div className="section-label">
        <span>Truth Spectrum &amp; Evidence Web</span>
        <span>Click connecting paths to inspect underlying scientific grounding</span>
      </div>

      <div className="spectrum-key">
        <span>Front Marketing Claims</span>
        <span>Back-Label Ingredients</span>
        <span>Scientific Ground Truth</span>
      </div>

      {missing.length > 0 && (
        <p className="graph-empty">
          {missing.join(" · ")}. {result.evidenceMessage}
        </p>
      )}

      <svg
        viewBox={`0 0 820 ${svgHeight}`}
        role="img"
        aria-label="Interactive graph connecting marketing claims, ingredients, and scientific literature"
        style={{ width: "100%", height: "auto" }}
      >
        {/* Render valid edges only */}
        {validEdges.map((edge, index) => {
          const from = nodeMap.get(edge.from)!;
          const to = nodeMap.get(edge.to)!;
          const color = colors[edge.verdict];
          return (
            <path
              key={`${edge.id}-${index}`}
              className={`graph-edge ${edge.verdict}`}
              d={`M ${from.x + 100} ${from.y} C ${from.x + 185} ${from.y}, ${to.x - 185} ${to.y}, ${to.x - 100} ${to.y}`}
              stroke={color}
              strokeWidth={edge.verdict === "contradicted" ? 3 : 2}
              onClick={() => onClaimSelect(edge.claimId)}
            />
          );
        })}

        {/* Render nodes */}
        {Array.from(nodeMap.values()).map(({ node, x, y }) => {
          const isSensitivityTrigger = node.column === 1 && node.verdict === "caution";
          const isContradictedClaim = node.column === 0 && node.verdict === "contradicted";
          const isSupportedClaim = node.column === 0 && node.verdict === "supported";

          let strokeColor = "var(--ink)";
          let fillColor = "#fff";
          let strokeWidth = 1.5;

          if (isSensitivityTrigger) {
            strokeColor = "#b91c1c";
            fillColor = "#fee2e2";
            strokeWidth = 2.5;
          } else if (isContradictedClaim) {
            strokeColor = "#b91c1c";
            fillColor = "#fef2f2";
            strokeWidth = 2;
          } else if (isSupportedClaim) {
            strokeColor = "#15803d";
            fillColor = "#f0fdf4";
            strokeWidth = 2;
          }

          return (
            <g
              key={node.id}
              className={`graph-node ${isSensitivityTrigger ? "triggered" : ""}`}
              onClick={() => node.id.startsWith("claim-") && onClaimSelect(node.id.replace("claim-", ""))}
              style={{ cursor: node.id.startsWith("claim-") ? "pointer" : "default" }}
            >
              <rect
                x={x - 100}
                y={y - 32}
                width="200"
                height="64"
                rx="3"
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              <text
                x={x}
                y={y - 6}
                textAnchor="middle"
                fontWeight="600"
                fontSize="12"
                fill="var(--ink)"
              >
                {node.label.length > 24 ? `${node.label.slice(0, 24)}…` : node.label}
              </text>
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                fontSize="10"
                fontWeight={isSensitivityTrigger ? "700" : "500"}
                fill={isSensitivityTrigger ? "#b91c1c" : "#625f59"}
                className="node-meta"
              >
                {isSensitivityTrigger
                  ? "⚠ SENSITIVITY TRIGGER"
                  : node.column === 0
                  ? node.verdict
                    ? node.verdict.toUpperCase().replace("_", " ")
                    : "CLAIM"
                  : node.column === 1
                  ? "LABEL INGREDIENT"
                  : "SCIENTIFIC REFERENCE"}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
