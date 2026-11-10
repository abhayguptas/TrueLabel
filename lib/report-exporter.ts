import type { AnalyzeResult } from "@/lib/types";
import { synthesizeExecutiveVerdict } from "./verdict-synthesizer";

export function generateFullReportHtml(result: AnalyzeResult): string {
  const verdict = synthesizeExecutiveVerdict(result);
  const supportedCount = result.claims.filter((c) => c.verdict === "supported").length;
  const contradictedCount = result.claims.filter((c) => c.verdict === "contradicted").length;
  const scoreColor = verdict.statusBadge === "red" ? "#b91c1c" : verdict.statusBadge === "green" ? "#15803d" : "#b45309";
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TrueLabel Audit Report - Consumer Truth Engine</title>
  <style>
    @page { margin: 15mm; size: A4; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #141413; background: #fff; margin: 0; padding: 28px; font-size: 13px; line-height: 1.5; }
    .print-actions { background: #141413; color: #fff; padding: 12px 18px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .print-btn { background: #c6f135; color: #141413; border: none; padding: 8px 16px; font-weight: 700; font-size: 13px; cursor: pointer; border-radius: 2px; }
    .header { border-bottom: 3px solid #141413; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 26px; font-weight: 900; letter-spacing: -1px; }
    .brand span { color: #625f59; font-weight: 400; font-size: 15px; margin-left: 8px; }
    .meta { font-family: monospace; font-size: 11px; text-transform: uppercase; color: #625f59; text-align: right; }
    .score-card { border: 2px solid ${scoreColor}; background: ${verdict.statusBadge === "red" ? "#fee2e2" : verdict.statusBadge === "green" ? "#f0fdf4" : "#fef3c7"}; padding: 20px; border-radius: 4px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .score-title { font-size: 11px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${scoreColor}; }
    .score-val { font-size: 52px; font-weight: 900; color: ${scoreColor}; line-height: 1; margin: 4px 0; }
    .score-tag { font-size: 13px; font-weight: 700; color: ${scoreColor}; }
    .summary-box { border: 1px solid #141413; background: #fbfaf6; padding: 18px; margin-bottom: 24px; }
    .summary-box h3 { margin: 0 0 10px; font-size: 16px; }
    .headline-highlight { font-size: 14px; font-weight: 700; color: ${scoreColor}; margin-bottom: 12px; }
    .summary-box ul { margin: 0; padding-left: 20px; }
    .summary-box li { margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 12px; }
    th { border-bottom: 2px solid #141413; padding: 8px 10px; text-align: left; font-family: monospace; font-size: 10px; text-transform: uppercase; background: #efece4; }
    td { border-bottom: 1px solid #ddd; padding: 10px; vertical-align: top; }
    .pill { display: inline-block; padding: 3px 6px; font-family: monospace; font-size: 10px; font-weight: bold; text-transform: uppercase; border-radius: 2px; }
    .pill.supported { background: #dcfce7; color: #15803d; }
    .pill.contradicted { background: #fee2e2; color: #b91c1c; }
    .pill.caution, .pill.not_stated { background: #fef3c7; color: #b45309; }
    .section-title { font-size: 15px; font-weight: 800; border-bottom: 1px solid #141413; padding-bottom: 6px; margin: 28px 0 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .disclaimer { border-top: 2px solid #141413; padding-top: 14px; margin-top: 36px; font-size: 11px; color: #625f59; line-height: 1.45; }
    .ingredient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
    .ing-card { border: 1px solid #ccc; padding: 8px 10px; background: #faf8f5; font-size: 11px; }
    .ing-card strong { display: block; font-size: 12px; margin-bottom: 3px; }
    .bottom-line-callout { background: #141413; color: #fff; padding: 14px 18px; margin-bottom: 24px; border-radius: 2px; }
    .bottom-line-callout strong { color: #c6f135; display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; font-family: monospace; }
    @media print {
      .print-actions { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <div><strong>TrueLabel Official Audit Dossier</strong> &nbsp;·&nbsp; Ready for print / PDF archival</div>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="brand">TrueLabel <span>Consumer Truth Engine</span></div>
      <div style="font-size: 13px; color: #585750; margin-top: 4px;">Algorithmic Packaging &amp; Clinical Evidence Verification</div>
    </div>
    <div class="meta">
      Audit Date: ${dateStr} ${timeStr}<br>
      Category: ${result.productCategory.toUpperCase()}<br>
      Inspection Mode: LIVE PACKAGING SCAN
    </div>
  </div>

  <div class="score-card">
    <div>
      <div class="score-title">Consumer Truth Score</div>
      <div class="score-val">${verdict.score}<span style="font-size: 24px; font-weight: 500;">/100</span></div>
      <div class="score-tag">${verdict.statusLabel}</div>
    </div>
    <div style="text-align: right; font-size: 12px; line-height: 1.6;">
      <strong>Claims Evaluated:</strong> ${result.claims.length}<br>
      <span style="color: #15803d; font-weight: 700;">✓ Supported: ${supportedCount}</span> &nbsp;|&nbsp; 
      <span style="color: #b91c1c; font-weight: 700;">✗ Contradicted: ${contradictedCount}</span><br>
      <strong>Disclosed Ingredients:</strong> ${result.ingredients.length} declared items
    </div>
  </div>

  <div class="summary-box">
    <h3>Executive Audit Verdict</h3>
    <div class="headline-highlight">${verdict.headline}</div>
    <ul>
      ${verdict.realityBullets
        .map(
          (b) => `<li>
          <strong>&quot;${b.claim}&quot;</strong>: ${b.finding}
        </li>`
        )
        .join("")}
      ${
        verdict.personalHealthAlert
          ? `<li style="margin-top: 8px; color: ${verdict.personalHealthAlert.level === "high" ? "#b91c1c" : "#141413"};">
          <strong>${verdict.personalHealthAlert.title}:</strong> ${verdict.personalHealthAlert.description}
        </li>`
          : ""
      }
    </ul>
  </div>

  <div class="bottom-line-callout">
    <strong>Consumer Bottom Line:</strong>
    <div>${verdict.bottomLine}</div>
  </div>

  <div class="section-title">Front Marketing Promises vs Back Packaging Facts</div>
  <table>
    <thead>
      <tr>
        <th style="width: 28%;">Front Marketing Claim</th>
        <th style="width: 52%;">Disclosed Reality / Clinical Finding</th>
        <th style="width: 20%;">Audit Verdict</th>
      </tr>
    </thead>
    <tbody>
      ${result.claims
        .map(
          (c) => `<tr>
          <td><strong>&quot;${c.claim}&quot;</strong></td>
          <td>${c.evidence?.text ? (c.evidence.text.length > 180 ? c.evidence.text.slice(0, 180) + "..." : c.evidence.text) : (c.verdict === "supported" ? "Substantiated by packaging ingredient declaration." : "Unstated or missing from back label disclosures.")}</td>
          <td><span class="pill ${c.verdict}">${c.verdict === "supported" ? "Verified True" : c.verdict === "contradicted" ? "Contradicted" : "Unproven"}</span></td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <div class="section-title">Disclosed Ingredients &amp; Classification (${result.ingredients.length} items)</div>
  <div class="ingredient-grid">
    ${result.ingredientReviews
      .map(
        (r) => `<div class="ing-card">
        <strong>${r.ingredient}</strong>
        <div>${r.summary}</div>
        ${r.source ? `<div style="margin-top: 4px; font-size: 10px; color: #625f59;">Source: ${r.source.publisher} - ${r.source.title}</div>` : ""}
      </div>`
      )
      .join("")}
  </div>

  ${
    result.references.length > 0
      ? `<div class="section-title">Cited Scientific Literature &amp; Regulatory Standards</div>
  <ul>
    ${result.references
      .map(
        (ref) => `<li style="margin-bottom: 8px;">
        <strong>${ref.publisher}: ${ref.title}</strong><br>
        <span style="color: #555;">${ref.text.slice(0, 260)}...</span><br>
        <a href="${ref.sourceUrl}" style="color: #141413; font-size: 11px;">${ref.sourceUrl}</a>
      </li>`
      )
      .join("")}
  </ul>`
      : ""
  }

  <div class="disclaimer">
    <strong>⚖️ Regulatory &amp; Consumer Advisory Notice:</strong><br>
    ${verdict.disclaimer}
  </div>
</body>
</html>`;
}

export function downloadFullReport(result: AnalyzeResult): void {
  const html = generateFullReportHtml(result);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `TrueLabel-Audit-Report-${new Date().toISOString().slice(0, 10)}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
