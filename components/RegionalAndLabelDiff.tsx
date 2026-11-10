import type { AnalyzeResult } from "@/lib/types";

export function RegionalAndLabelDiff({ result }: { result: AnalyzeResult }): React.ReactElement {
  const showsDose = result.productCategory === "supplement";

  return (
    <section className="panel comparison-panel">
      <p className="eyebrow">{showsDose ? "Dose & Formula Reality Check" : "Cross-Source Comparison"}</p>
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
            <span>India Disclosure</span>
            <p>{result.regionalDiff.india}</p>
          </div>
          <div>
            <span>International Disclosure</span>
            <p>{result.regionalDiff.international}</p>
          </div>
          <strong>{result.regionalDiff.summary}</strong>
        </div>
      )}

      <div className="conflicts">
        {result.conflicts.length ? (
          result.conflicts.map((conflict, index) => (
            <div key={`${conflict.detail}-${index}`} className="conflict-item">
              <span className="conflict-tag">🚨 {conflict.detail.toUpperCase()}</span>
              <p>
                <strong>Claim:</strong> &quot;{conflict.left}&quot;
              </p>
              <p>
                <strong>Reality:</strong> &quot;{conflict.right}&quot;
              </p>
            </div>
          ))
        ) : (
          <p className="no-conflict-note">
            ✅ No direct formulation contradiction detected between the verified statements.
          </p>
        )}
      </div>
    </section>
  );
}
