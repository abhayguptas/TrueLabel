"use client";

import { useRef, useState } from "react";
import { Wheat, Sparkles, Zap, Package, Camera, ArrowRight, CheckCircle2 } from "lucide-react";

const presets = [
  {
    id: "bread",
    label: "Brown Bread: Front vs Back (50% Maida)",
    icon: Wheat,
    query: `Product: English Oven Brown Sliced Bread
Front Claims: 100% Whole Wheat Brown Bread, No Palm Oil, No Added Colours, 28% Daily Fibre Need
Back Label Ingredients: Wheat Flour [Atta (50%)], Refined Wheat Flour [Maida (50%)], Yeast, Sugar, Iodized Salt, Wheat Gluten, Edible Vegetable Oil (Rice Bran), Class II Preservative (282), Malt Powder, Wheat Bran, Improvers [170(i), 510, 923, 1100], Acidity Regulator (260), Emulsifiers [471, 472e, 481(i)], Antioxidant (300).`,
    context: ""
  },
  {
    id: "skincare",
    label: "Minimalist Vitamin B5 Cream (Fungal Acne)",
    icon: Sparkles,
    query: `Product: Minimalist Vitamin B5 10% Moisturizer
Front Claims: 10% Vitamin B5 (Panthenol) Moisturizer, Deeply hydrates skin & repairs skin barrier, Fragrance-Free, Non-Comedogenic
Back Label Ingredients: Aqua, Panthenol (10%), Caprylic/Capric Triglyceride, Glycerin, Betaine, Polyacrylate-13, Polysorbate 20, Phenoxyethanol, Ethylhexylglycerin.`,
    context: "Fungal acne prone skin, avoid pore-clogging esters like polysorbate"
  },
  {
    id: "shilajit",
    label: "Shilajit Booster (80% Cortisol Drop Claim)",
    icon: Zap,
    query: `Product: Pure Himalayan Shilajit Booster Resin
Front Claims: Clinically proven to lower cortisol by 80% and double testosterone in 14 days, 60% Fulvic Acid
Back Label Ingredients: Purified Shilajit Resin (250mg), Ashwagandha Extract (50mg), Maltodextrin, Potassium Sorbate.`,
    context: "Hormone sensitivity, check clinical dose vs effective dose"
  },
  {
    id: "snack",
    label: "Pringles: India Palmolein vs US Sunflower",
    icon: Package,
    query: `Product: Pringles Original Potato Crisps
Front Claims: Original Crisp Flavor, Clean Taste, No Artificial Flavors
Back Label (India Formula): Dried Potatoes, Edible Vegetable Oil (Palmolein), Rice Flour, Wheat Starch, Emulsifier (INS 471), Maltodextrin, Salt.
Back Label (US Formula): Dried potatoes, vegetable oil (corn, cottonseed, high oleic sunflower oil), degerminated corn flour, cornstarch, rice flour, maltodextrin, salt, wheat starch.`,
    context: "Clean oils only, strictly palm oil free"
  }
];

async function compressImage(file: File): Promise<string> {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("The image could not be decoded."));
    element.src = source;
  });
  let width = Math.min(image.width, 1800);
  let height = Math.round(image.height * (width / image.width));
  let quality = 0.9;
  let result = source;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) break;
    context.drawImage(image, 0, 0, width, height);
    result = canvas.toDataURL("image/jpeg", quality);
    if ((result.length - result.indexOf(",") - 1) * 0.75 < 1200000) break;
    width = Math.round(width * 0.78);
    height = Math.round(height * 0.78);
    quality -= 0.12;
  }
  return result;
}

export function UnifiedInput({
  disabled,
  scanning,
  onSubmit
}: {
  disabled: boolean;
  scanning: boolean;
  onSubmit: (input: { query: string; personalContext: string; frontImageBase64: string | null; backImageBase64: string | null }) => void;
}): React.ReactElement {
  const [query, setQuery] = useState("");
  const [personalContext, setPersonalContext] = useState("");
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [error, setError] = useState("");
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const applyPreset = (preset: (typeof presets)[number]) => {
    setQuery(preset.query);
    setPersonalContext(preset.context);
    setFront(null);
    setBack(null);
    setError("");
  };

  const selectImage = async (file: File | undefined, side: "front" | "back") => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) {
      setError("Use a PNG, JPEG, or WebP label image smaller than 8 MB.");
      return;
    }
    try {
      const image = await compressImage(file);
      side === "front" ? setFront(image) : setBack(image);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The image could not be prepared.");
    }
  };

  const submit = () => {
    if (scanning) return;
    if (!query.trim() && !front && !back) return setError("Add product text, pick a one-click preset, or upload label photos.");
    if (
      front &&
      back &&
      (front.length + back.length - front.indexOf(",") - back.indexOf(",") - 2) * 0.75 > 2400000
    ) {
      return setError("The compressed label images are still too large. Choose smaller source images.");
    }
    onSubmit({ query, personalContext, frontImageBase64: front, backImageBase64: back });
  };

  return (
    <section className="input-card">
      <div className="input-heading">
        <div>
          <p className="eyebrow">Consumer Truth Engine · Live Scan</p>
          <h1>Read the label behind the claim.</h1>
        </div>
        <p>
          Cross-examine viral marketing promises against back-label ingredients, PubMed trials, and regional formulas in real time.
        </p>
      </div>

      <div className="preset-bar">
        <span className="preset-label">One-Click Demos:</span>
        <div className="preset-pills">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                type="button"
                className="preset-pill"
                disabled={scanning}
                onClick={() => applyPreset(preset)}
              >
                <Icon size={14} className="pill-icon" />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        maxLength={15000}
        placeholder="Paste product claims, ingredient lists, or a YouTube video link. Or click a 1-click demo above or upload photos below."
        aria-label="Product text"
      />
      <p className="source-help">
        YouTube videos with public English captions are resolved live. Drop front &amp; back label photos below for instant multi-modal extraction.
      </p>

      <div className="context-field">
        <label htmlFor="personal-context">Optional personal health / allergy context</label>
        <textarea
          id="personal-context"
          value={personalContext}
          onChange={(event) => setPersonalContext(event.target.value)}
          maxLength={1000}
          placeholder="For example: gluten allergy, celiac, fragrance allergy, diabetes, high blood pressure, or strictly avoid palm oil. (Do not include names or private data)."
          aria-describedby="personal-context-note"
        />
        <p id="personal-context-note">
          Evaluated via /clocked/decide for personal allergy and health alerts. It does not replace professional medical care.
        </p>
      </div>

      <div className="upload-row">
        <input
          ref={frontRef}
          className="visually-hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={scanning}
          onChange={(event) => selectImage(event.target.files?.[0], "front")}
        />
        <input
          ref={backRef}
          className="visually-hidden"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={scanning}
          onChange={(event) => selectImage(event.target.files?.[0], "back")}
        />
        <button type="button" className="upload-button" disabled={scanning} onClick={() => frontRef.current?.click()}>
          <Camera size={14} />
          <span>{front ? "Replace front label" : "Upload front label"}</span>
        </button>
        <button type="button" className="upload-button" disabled={scanning} onClick={() => backRef.current?.click()}>
          <Camera size={14} />
          <span>{back ? "Replace back label" : "Upload back label"}</span>
        </button>
        {front && (
          <span className="file-ready">
            <CheckCircle2 size={13} /> Front photo loaded
          </span>
        )}
        {back && (
          <span className="file-ready">
            <CheckCircle2 size={13} /> Back photo loaded
          </span>
        )}
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="input-footer">
        <span>
          {query.length.toLocaleString()} / 15,000 product characters · {personalContext.length.toLocaleString()} / 1,000 context characters
        </span>
        <button type="button" className="scan-button" disabled={disabled || scanning} onClick={submit}>
          <span>{scanning ? "Analyzing with Clocked..." : disabled ? "Add API key to scan" : "Run Live Truth Scan"}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
