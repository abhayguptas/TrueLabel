"use client";

import type { AnalyzeResult } from "@/lib/types";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export function RealityCheckTable({ result }: { result: AnalyzeResult }): React.ReactElement | null {
  if (!result.claims.length) return null;

  return (
    <div className="reality-check-table-wrap">
      <div className="section-label">
        <span>Front-of-Pack Claim vs Back-of-Pack Reality</span>
        <span>Sentence-by-Sentence Check</span>
      </div>
      <table className="reality-table">
        <thead>
          <tr>
            <th>Front Marketing Claim</th>
            <th>Back-Label Facts &amp; Scientific Findings</th>
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
                <p>
                  {claim.evidence?.text
                    ? claim.evidence.text.length > 220
                      ? `${claim.evidence.text.slice(0, 220)}...`
                      : claim.evidence.text
                    : claim.verdict === "supported"
                    ? "Confirmed by back-label ingredient disclosure."
                    : "Not explicitly confirmed or denied in packaging facts."}
                </p>
                {claim.evidence?.documentId && (
                  <span className="source-tag">Source: {claim.evidence.documentId}</span>
                )}
              </td>
              <td className="verdict-cell">
                <span className={`verdict-pill ${claim.verdict}`}>
                  {claim.verdict === "supported" ? (
                    <>
                      <CheckCircle2 size={12} className="inline-icon" /> Verified True
                    </>
                  ) : claim.verdict === "contradicted" ? (
                    <>
                      <AlertTriangle size={12} className="inline-icon" /> Contradicted
                    </>
                  ) : (
                    <>
                      <HelpCircle size={12} className="inline-icon" /> Unproven
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
