"use client";

import type { SensitivityKey } from "@/lib/types";

const choices: Array<{ key: SensitivityKey; label: string }> = [
  { key: "acne", label: "Acne & Clogged Pores" },
  { key: "fungal_acne", label: "Fungal Acne" },
  { key: "eczema", label: "Eczema & Sensitive Skin" },
  { key: "diabetic", label: "Diabetic & Hidden Sugar" },
  { key: "palm_oil_free", label: "Clean Oil (No Palm Oil)" }
];

export function SensitivityPills({ selected, onChange }: { selected: SensitivityKey[]; onChange: (value: SensitivityKey[]) => void }): React.ReactElement {
  return <section className="sensitivity" aria-label="Personal sensitivity filters"><p>My body profile</p><div className="pill-row">{choices.map((choice) => <button className={`pill ${selected.includes(choice.key) ? "selected" : ""}`} type="button" key={choice.key} aria-pressed={selected.includes(choice.key)} onClick={() => onChange(selected.includes(choice.key) ? selected.filter((item) => item !== choice.key) : [...selected, choice.key])}>{choice.label}</button>)}</div></section>;
}
