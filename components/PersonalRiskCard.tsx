import type { AnalyzeResult, SensitivityKey } from "@/lib/types";

const labels: Record<SensitivityKey, string> = { acne: "Acne & Clogged Pores", fungal_acne: "Fungal Acne", eczema: "Eczema & Sensitive Skin", diabetic: "Diabetic & Hidden Sugar", palm_oil_free: "Clean Oil (No Palm Oil)" };

export function PersonalRiskCard({ result }: { result: AnalyzeResult }): React.ReactElement {
  return <section className="panel risk-panel"><p className="eyebrow">Personal label check</p><h2>What this label may mean for you</h2>{result.risks.length ? result.risks.map((risk) => <div className="risk-row" key={risk.sensitivity}><div><strong>{labels[risk.sensitivity]}</strong><span>{risk.triggers.length ? risk.triggers.join(", ") : "No matching trigger identified"}</span></div><div className={`risk-score ${risk.verdict}`}><i style={{ width: `${Math.round(risk.probability * 100)}%` }} />{Math.round(risk.probability * 100)}%</div></div>) : <p>Select one or more profile pills to receive a live, ingredient-based caution check.</p>}<p className="disclaimer">Educational evidence only. This is not medical advice or a diagnosis.</p></section>;
}
