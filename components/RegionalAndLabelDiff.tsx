import type { AnalyzeResult } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Globe, Scale } from "lucide-react";

export function RegionalAndLabelDiff({ result }: { result: AnalyzeResult }): React.ReactElement {
  // Only show dose block for ingestible supplements or pharmaceutical pills with stated dose
  const showsDose =
    result.productCategory === "supplement" &&
    Boolean(result.productDose?.product && result.productDose.product !== "Not disclosed");

  // Deduplicate conflict items by claim and reality text
  const cleanConflicts = Array.from(
    new Map(
      result.conflicts.map((c) => [`${c.left.trim()}::${c.right.trim()}`, c])
    ).values()
  );

  return (
    <section className="panel comparison-panel">
      <p className="eyebrow">
        <Scale size={13} className="inline-icon" />
        {showsDose ? "Dose & Clinical Reality Check" : "Formula & Cross-Source Comparison"}
      </p>
      <h2>Formula &amp; Claim Comparison</h2>

      {showsDose && (
        <div className="dose-block">
          <span>Product Dose</span>
          <strong>{result.productDose?.product || "Standard Serving"}</strong>
          <span>Clinical Benchmark</span>
          <p>{result.productDose?.clinical || "Standard dietary recommendation"}</p>
        </div>
      )}

      {result.regionalDiff && (
        <div className="regional">
          <div>
            <span>
              <Globe size={11} className="inline-icon" /> India Formulation
            </span>
            <p>{result.regionalDiff.india}</p>
          </div>
          <div>
            <span>
              <Globe size={11} className="inline-icon" /> International / US Formulation
            </span>
            <p>{result.regionalDiff.international}</p>
          </div>
          <strong>{result.regionalDiff.summary}</strong>
        </div>
      )}

      <div className="conflicts">
        {cleanConflicts.length ? (
          cleanConflicts.map((conflict, index) => {
            const rawDetail = conflict.detail.toLowerCase();
            const cleanDetail =
              rawDetail === "scope" || rawDetail === "value"
                ? "FORMULATION DISCREPANCY"
                : conflict.detail.toUpperCase();
            const cleanRight =
              conflict.right.length > 220 ? `${conflict.right.slice(0, 220)}...` : conflict.right;

            return (
              <div key={`${conflict.detail}-${index}`} className="conflict-item">
                <span className="conflict-tag">
                  <AlertTriangle size={12} className="inline-icon" /> {cleanDetail}
                </span>
                <p>
                  <strong>Claim:</strong> &quot;{conflict.left}&quot;
                </p>
                <p>
                  <strong>Packaging Reality:</strong> &quot;{cleanRight}&quot;
                </p>
              </div>
            );
          })
        ) : (
          <p className="no-conflict-note">
            <CheckCircle2 size={13} className="inline-icon" />
            No direct formulation contradiction detected between the verified statements.
          </p>
        )}
      </div>
    </section>
  );
}
