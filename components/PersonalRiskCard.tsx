import type { AnalyzeResult, SensitivityKey } from "@/lib/types";
import { ShieldAlert, ShieldCheck, AlertCircle, Info } from "lucide-react";

const labels: Record<SensitivityKey, string> = {
  acne: "Acne & Clogged Pores",
  fungal_acne: "Fungal Acne / Malassezia",
  eczema: "Eczema & Sensitive Skin",
  diabetic: "Diabetic & Hidden Sugar",
  palm_oil_free: "Clean Oil (Palm Oil Free)"
};

export function PersonalRiskCard({ result }: { result: AnalyzeResult }): React.ReactElement {
  const hasIngredients = result.ingredients.length > 0;

  return (
    <section className="panel risk-panel">
      <p className="eyebrow">Personal Health &amp; Allergy Guard</p>
      <h2>{hasIngredients ? "Sensitivity & Allergy Assessment" : "Claim & Disclosure Review"}</h2>

      {result.personalContextCaution && (
        <div className={`risk-row personal-context-row ${result.personalContextCaution.verdict}`}>
          <div>
            <strong>
              {result.personalContextCaution.verdict === "high" ? (
                <>
                  <ShieldAlert size={14} className="risk-icon red-icon" /> Stated Allergy Alert
                </>
              ) : (
                <>
                  <ShieldCheck size={14} className="risk-icon green-icon" /> Stated Context: All Clear
                </>
              )}
            </strong>
            <span>{result.personalContextCaution.message}</span>
          </div>
          <div className={`risk-score ${result.personalContextCaution.verdict}`}>
            <i style={{ width: `${Math.round(result.personalContextCaution.probability * 100)}%` }} />
            {Math.round(result.personalContextCaution.probability * 100)}%
          </div>
        </div>
      )}

      <div className="risk-row overall-caution">
        <div>
          <strong>
            <AlertCircle size={13} className="risk-icon" />
            {hasIngredients ? "Overall Formulation Caution" : "Claim Review Flag"}
          </strong>
          <span>{result.overallCaution.message}</span>
        </div>
        <div className={`risk-score ${result.overallCaution.verdict}`}>
          <i style={{ width: `${Math.round(result.overallCaution.probability * 100)}%` }} />
          {Math.round(result.overallCaution.probability * 100)}%
        </div>
      </div>

      {result.risks.length ? (
        result.risks.map((risk) => (
          <div className="risk-row" key={risk.sensitivity}>
            <div>
              <strong>{labels[risk.sensitivity]}</strong>
              <span>
                {risk.triggers.length
                  ? `Identified triggers: ${risk.triggers.join(", ")}`
                  : "No matching triggers detected in packaging facts"}
              </span>
            </div>
            <div className={`risk-score ${risk.verdict}`}>
              <i style={{ width: `${Math.round(risk.probability * 100)}%` }} />
              {Math.round(risk.probability * 100)}%
            </div>
          </div>
        ))
      ) : hasIngredients ? (
        <p className="pill-prompt">
          <Info size={13} className="inline-icon" />
          Select profile pills above to test this product against acne, diabetes, eczema, or palm oil.
        </p>
      ) : (
        <p className="pill-prompt">
          <Info size={13} className="inline-icon" />
          Upload the back label photo to assess all disclosed ingredients.
        </p>
      )}

      <p className="disclaimer">
        Cautions are educational packaging reviews powered by /clocked/decide. They do not diagnose conditions or guarantee medical safety.
      </p>
    </section>
  );
}
