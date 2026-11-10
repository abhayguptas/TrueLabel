"use client";

import type { AnalyzeResult } from "@/lib/types";

export function TruthBadgeCard({ result }: { result: AnalyzeResult }): React.ReactElement {
  const supported = result.claims.filter((claim) => claim.verdict === "supported").length;
  const score = result.claims.length ? Math.round((supported / result.claims.length) * 100) : 0;
  const directFinding = result.claims.some((claim) => claim.verdict === "supported" || claim.verdict === "contradicted" || claim.verdict === "caution");
  const inconclusive = result.evidenceStatus === "insufficient" || !directFinding;
  const display = inconclusive ? "Audit inconclusive" : `${score}/100`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><rect width="600" height="360" fill="#fff"/><rect x="16" y="16" width="568" height="328" fill="none" stroke="#141413" stroke-width="6"/><text x="42" y="72" font-family="Arial" font-size="34" font-weight="700">TRUE LABEL</text><line x1="42" x2="558" y1="92" y2="92" stroke="#141413" stroke-width="5"/><text x="42" y="150" font-family="Arial" font-size="24">${inconclusive ? "EVIDENCE STATUS" : "TRUTH SCORE"}</text><text x="42" y="230" font-family="Arial" font-size="${inconclusive ? "38" : "88"}" font-weight="700">${display}</text><text x="42" y="285" font-family="Arial" font-size="20">${inconclusive ? "No matching clinical source was returned" : `Verified claims: ${supported}/${result.claims.length}`}</text><text x="42" y="318" font-family="Arial" font-size="20">Live Clocked evidence check</text></svg>`;
  const download = () => { const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); const link = document.createElement("a"); link.href = url; link.download = "truelabel-badge.svg"; link.click(); URL.revokeObjectURL(url); };
  const copy = async () => navigator.clipboard.writeText(`![TrueLabel truth score ${score}/100](truelabel-badge.svg)`);
  return <section className="panel badge-card"><p className="eyebrow">Shareable record</p><h2>TrueLabel truth badge</h2><div className="badge-score"><span>{inconclusive ? "Evidence status" : "Truth score"}</span>{inconclusive ? <strong className="inconclusive-score">Audit inconclusive</strong> : <strong>{score}<small>/100</small></strong>}<p>{inconclusive ? (result.evidenceStatus === "insufficient" ? result.evidenceMessage : "Relevant sources were reviewed, but none directly established this label claim.") : `${supported} of ${result.claims.length} claims supported`}</p></div><div className="badge-actions"><button type="button" onClick={download}>Download SVG badge</button><button type="button" onClick={copy}>Copy Markdown embed</button></div></section>;
}
