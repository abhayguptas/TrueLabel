"use client";

import type { AnalyzeResult } from "@/lib/types";

export function TruthVerdictBanner({ result }: { result: AnalyzeResult }): React.ReactElement {
  const supported = result.claims.filter((c) => c.verdict === "supported");
  const contradicted = result.claims.filter((c) => c.verdict === "contradicted");
  const cautions = result.claims.filter((c) => c.verdict === "caution" || c.verdict === "not_stated");

  // Calculate realistic score
  const totalClaims = result.claims.length;
  const rawScore = totalClaims
    ? Math.round(((supported.length * 1.0 + cautions.length * 0.4) / totalClaims) * 100)
    : result.ingredients.length ? 75 : 50;
  
  const score = Math.max(10, Math.min(100, contradicted.length > 0 ? Math.min(rawScore, 65) : rawScore));

  const statusLabel =
    contradicted.length > 0 || result.conflicts.length > 0
      ? "Discrepancy Detected"
      : score >= 80
      ? "Highly Verified"
      : "Partially Verified";

  const statusClass =
    contradicted.length > 0 || result.conflicts.length > 0
      ? "verdict-badge-red"
      : score >= 80
      ? "verdict-badge-green"
      : "verdict-badge-amber";

  return (
    <section className="verdict-banner">
      <div className="verdict-header">
        <div>
          <span className="eyebrow">Consumer Truth Engine · Scan Verdict</span>
          <h2 className="verdict-title">The Real Story Behind the Label</h2>
          <p className="verdict-subtitle">
            Cross-examined {result.claims.length} front marketing claim(s) against {result.ingredients.length} back-label
            ingredient(s) and scientific standards.
          </p>
        </div>
        <div className={`verdict-score-pill ${statusClass}`}>
          <div className="score-num">{score}<span>/100</span></div>
          <div className="score-desc">{statusLabel}</div>
        </div>
      </div>

      <div className="verdict-highlights-grid">
        {contradicted.length > 0 || result.conflicts.length > 0 ? (
          <div className="highlight-card red-card">
            <div className="card-badge">🚨 Contradiction / Exaggeration</div>
            <strong>Front promises conflict with packaging facts:</strong>
            <ul>
              {contradicted.map((c) => (
                <li key={c.id}>
                  <strong>&quot;{c.claim}&quot;</strong>: {c.evidence?.text ?? "Disproved by disclosed ingredients or composition."}
                </li>
              ))}
              {result.conflicts.slice(0, 2).map((conf, idx) => (
                <li key={idx}>
                  <strong>{conf.detail}</strong>: &quot;{conf.left}&quot; vs &quot;{conf.right}&quot;
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {supported.length > 0 ? (
          <div className="highlight-card green-card">
            <div className="card-badge">✅ Verified True</div>
            <strong>Substantiated by packaging disclosures:</strong>
            <ul>
              {supported.map((c) => (
                <li key={c.id}>
                  <strong>&quot;{c.claim}&quot;</strong>: {c.evidence?.text ? `Backed by: ${c.evidence.text}` : "Confirmed by packaging ingredient disclosure."}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="highlight-card amber-card">
          <div className="card-badge">🔍 Formulation Insight</div>
          <strong>Active Ingredients & Base Reality:</strong>
          <p>
            {result.productCategory === "packaged food"
              ? "Check the first 3 ingredients: in food labels, ingredients are declared in descending order by weight. Anything listed first constitutes the bulk of what you eat."
              : result.productCategory === "skincare"
              ? "In cosmetics, active ingredients work alongside emollients and humectants. Check comedogenic and fungal acne ratings below."
              : "Supplement effectiveness depends on therapeutic dosage vs the actual milligrams in each serving."}
          </p>
        </div>
      </div>

      {result.claims.length > 0 && (
        <div className="reality-check-table-wrap">
          <div className="section-label">
            <span>Front-of-Pack Claim vs Back-of-Pack Reality</span>
            <span>Sentence-by-Sentence Check</span>
          </div>
          <table className="reality-table">
            <thead>
              <tr>
                <th>Front Marketing Claim</th>
                <th>Back-Label Facts & Scientific Findings</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {result.claims.map((claim) => (
                <tr key={claim.id} className={`row-${claim.verdict}`}>
                  <td className="claim-cell">
                    <strong>&quot;{claim.claim}&quot;</strong>
                    {claim.claimType && <span className="claim-tag">{claim.claimType}</span>}
                  </td>
                  <td className="evidence-cell">
                    <p>{claim.evidence?.text ?? (claim.verdict === "supported" ? "Confirmed by back-label ingredient disclosure." : "Not explicitly confirmed or denied in packaging facts.")}</p>
                    {claim.evidence?.documentId && (
                      <span className="source-tag">Source: {claim.evidence.documentId}</span>
                    )}
                  </td>
                  <td className="verdict-cell">
                    <span className={`verdict-pill ${claim.verdict}`}>
                      {claim.verdict === "supported"
                        ? "Verified True"
                        : claim.verdict === "contradicted"
                        ? "Contradicted / Exaggerated"
                        : "Unproven / Unstated"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

