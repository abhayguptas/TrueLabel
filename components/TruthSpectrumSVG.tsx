"use client";

import { buildGraph } from "@/lib/graph-layout";
import type { AnalyzeResult, Verdict } from "@/lib/types";

const colors: Record<Verdict, string> = { supported: "#15803D", contradicted: "#B91C1C", caution: "#B45309", not_stated: "#B45309", unproven: "#B45309" };

export function TruthSpectrumSVG({ result, onClaimSelect }: { result: AnalyzeResult; onClaimSelect: (id: string) => void }): React.ReactElement {
  const { nodes, edges } = buildGraph(result);
  const columns = [120, 410, 700];
  const position = (id: string) => {
    const node = nodes.find((item) => item.id === id);
    const index = nodes.filter((item) => item.column === node?.column).findIndex((item) => item.id === id);
    return { x: columns[node?.column ?? 0], y: 74 + index * 100 };
  };
  const missing = [!result.ingredients.length ? "No verified ingredients" : "", !result.references.length ? "No cited sources" : ""].filter(Boolean);
  return <section className="spectrum"><div className="section-label"><span>Truth spectrum</span><span>Click evidence paths to inspect claims</span></div><div className="spectrum-key"><span>Claims</span><span>Label facts</span><span>Source evidence</span></div>{missing.length > 0 && <p className="graph-empty">{missing.join(" · ")}. {result.evidenceMessage}</p>}<svg viewBox="0 0 820 560" role="img" aria-label="Connections between claims, label facts, and evidence sources">{edges.map((edge) => { const from = position(edge.from); const to = position(edge.to); const color = colors[edge.verdict]; return <path key={edge.id} className={`graph-edge ${edge.verdict}`} d={`M ${from.x + 100} ${from.y} C ${from.x + 185} ${from.y}, ${to.x - 185} ${to.y}, ${to.x - 100} ${to.y}`} stroke={color} onClick={() => onClaimSelect(edge.claimId)} />; })}{nodes.map((node) => { const point = position(node.id); return <g key={node.id} className={`graph-node ${node.column === 1 && node.verdict === "caution" ? "triggered" : ""}`} onClick={() => node.id.startsWith("claim-") && onClaimSelect(node.id.replace("claim-", ""))}><rect x={point.x - 100} y={point.y - 30} width="200" height="60" rx="2" /><text x={point.x} y={point.y - 4} textAnchor="middle">{node.label.length > 25 ? `${node.label.slice(0, 25)}…` : node.label}</text><text x={point.x} y={point.y + 16} textAnchor="middle" className="node-meta">{node.column === 1 && node.verdict === "caution" ? "selected caution" : node.verdict ? node.verdict.replace("_", " ") : node.column === 1 ? "label fact" : "reference"}</text></g>})}</svg></section>;
}
