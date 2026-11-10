"use client";

import { useRef, useState } from "react";

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

export function UnifiedInput({ disabled, scanning, onSubmit }: { disabled: boolean; scanning: boolean; onSubmit: (input: { query: string; personalContext: string; frontImageBase64: string | null; backImageBase64: string | null }) => void }): React.ReactElement {
  const [query, setQuery] = useState("");
  const [personalContext, setPersonalContext] = useState("");
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [error, setError] = useState("");
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selectImage = async (file: File | undefined, side: "front" | "back") => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 4 * 1024 * 1024) {
      setError("Use a PNG, JPEG, or WebP label image smaller than 4 MB.");
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
    if (!query.trim() && !front && !back) return setError("Add product text or at least one label photo.");
    if (front && back && ((front.length + back.length - front.indexOf(",") - back.indexOf(",") - 2) * 0.75 > 2400000)) return setError("The compressed label images are still too large. Choose smaller source images.");
    onSubmit({ query, personalContext, frontImageBase64: front, backImageBase64: back });
  };
  return <section className="input-card">
    <div className="input-heading"><div><p className="eyebrow">Live product scan</p><h1>Read the label behind the claim.</h1></div><p>Paste label copy or upload a front and back label. Results are evidence checks, not medical advice.</p></div>
    <textarea value={query} onChange={(event) => setQuery(event.target.value)} maxLength={15000} placeholder="Paste product claims, a back-label ingredient list, or a YouTube Short or video ad link." aria-label="Product text" />
    <p className="source-help">YouTube videos with public English captions are resolved live. Instagram and TikTok links require a pasted transcript.</p>
    <div className="context-field"><label htmlFor="personal-context">Optional personal context</label><textarea id="personal-context" value={personalContext} onChange={(event) => setPersonalContext(event.target.value)} maxLength={1000} placeholder="For example: fragrance allergy, acne-prone skin, diabetes, or a specific ingredient you avoid. Do not include your name, contact details, or medical records." aria-describedby="personal-context-note" /><p id="personal-context-note">Used only to check label ingredients for a potential educational caution. It cannot diagnose a condition or determine whether a product is safe for you.</p></div>
    <div className="upload-row"><input ref={frontRef} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" disabled={scanning} onChange={(event) => selectImage(event.target.files?.[0], "front")} /><input ref={backRef} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" disabled={scanning} onChange={(event) => selectImage(event.target.files?.[0], "back")} /><button type="button" className="upload-button" disabled={scanning} onClick={() => frontRef.current?.click()}>{front ? "Replace front label" : "Upload front label"}</button><button type="button" className="upload-button" disabled={scanning} onClick={() => backRef.current?.click()}>{back ? "Replace back label" : "Upload back label"}</button>{front && <span className="file-ready">Front ready</span>}{back && <span className="file-ready">Back ready</span>}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="input-footer"><span>{query.length.toLocaleString()} / 15,000 product characters · {personalContext.length.toLocaleString()} / 1,000 context characters</span><button type="button" className="scan-button" disabled={disabled || scanning} onClick={submit}>{scanning ? "Live scan running" : disabled ? "Add API key to scan" : "Run live label scan"}</button></div>
  </section>;
}
