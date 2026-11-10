"use client";

import type { AnalyzeResult } from "@/lib/types";
import { Download, Copy, Award } from "lucide-react";

export function TruthBadgeCard({ result }: { result: AnalyzeResult }): React.ReactElement {
  const supported = result.claims.filter((claim) => claim.verdict === "supported").length;
  const contradicted = result.claims.filter((claim) => claim.verdict === "contradicted").length;
  const cautions = result.claims.filter((claim) => claim.verdict === "caution" || claim.verdict === "not_stated").length;
  
  const total = result.claims.length;
  const rawScore = total
    ? Math.round(((supported * 1.0 + cautions * 0.4) / total) * 100)
    : result.ingredients.length ? 75 : 0;
  
  const score = Math.max(10, Math.min(100, contradicted > 0 ? Math.min(rawScore, 65) : rawScore));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><rect width="600" height="360" fill="#f6f4ee"/><rect x="16" y="16" width="568" height="328" fill="#fff" stroke="#141413" stroke-width="4"/><text x="42" y="72" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" fill="#141413" letter-spacing="-1">TRUELABEL VERIFIED</text><line x1="42" x2="558" y1="92" y2="92" stroke="#141413" stroke-width="3"/><text x="42" y="140" font-family="'JetBrains Mono', monospace" font-size="14" fill="#65635d" letter-spacing="1">CONSUMER TRUTH SCORE</text><text x="42" y="230" font-family="Inter, Arial, sans-serif" font-size="88" font-weight="900" fill="#141413" letter-spacing="-3">${score}<tspan font-size="32" font-weight="500" fill="#65635d">/100</tspan></text><text x="42" y="285" font-family="Inter, Arial, sans-serif" font-size="16" fill="#141413">${supported} supported · ${contradicted} contradicted · ${result.ingredients.length} ingredients</text><text x="42" y="318" font-family="'JetBrains Mono', monospace" font-size="12" fill="#65635d">Verified with Clocked Intelligence &amp; Scientific Ground Truth</text></svg>`;

  const download = () => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "truelabel-badge.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`![TrueLabel Truth Score ${score}/100](truelabel-badge.svg)`);
  };

  return (
    <section className="panel badge-card">
      <p className="eyebrow">
        <Award size={13} className="inline-icon" /> Shareable Consumer Record
      </p>
      <h2>TrueLabel Truth Badge</h2>
      <div className="badge-score">
        <span>Truth Score</span>
        <strong>
          {score}
          <small>/100</small>
        </strong>
        <p>
          {supported} of {result.claims.length || 1} claims supported · {contradicted} contradiction(s)
        </p>
      </div>
      <div className="badge-actions">
        <button type="button" onClick={download}>
          <Download size={13} className="inline-icon" /> Download SVG Badge
        </button>
        <button type="button" onClick={copy}>
          <Copy size={13} className="inline-icon" /> Copy Markdown Embed
        </button>
      </div>
    </section>
  );
}
