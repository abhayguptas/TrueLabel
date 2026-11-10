"use client";

import { useEffect, useRef, useState } from "react";
import { ClaimLedger } from "@/components/ClaimLedger";
import { HeaderBar } from "@/components/HeaderBar";
import { IngredientReview } from "@/components/IngredientReview";
import { PersonalRiskCard } from "@/components/PersonalRiskCard";
import { PipelineStreamBar } from "@/components/PipelineStreamBar";
import { RegionalAndLabelDiff } from "@/components/RegionalAndLabelDiff";
import { SensitivityPills } from "@/components/SensitivityPills";
import { TruthBadgeCard } from "@/components/TruthBadgeCard";
import { TruthSpectrumSVG } from "@/components/TruthSpectrumSVG";
import { TruthVerdictBanner } from "@/components/TruthVerdictBanner";
import { UnifiedInput } from "@/components/UnifiedInput";
import type { AnalyzeResult, PipelineEvent, SensitivityKey } from "@/lib/types";

function deviceId(): string {
  const key = "truelabel_device_id";
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  const generated = crypto.randomUUID();
  localStorage.setItem(key, generated);
  return generated;
}

export default function Home(): React.ReactElement {
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [sensitivities, setSensitivities] = useState<SensitivityKey[]>([]);
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scanLock = useRef(false);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("truelabel_sensitivities");
    if (saved) setSensitivities(JSON.parse(saved) as SensitivityKey[]);
    fetch("/api/health")
      .then((response) => response.json())
      .then((data: { hasApiKey: boolean }) => setAvailable(data.hasApiKey))
      .catch(() => setAvailable(false))
      .finally(() => setReady(true));
  }, []);

  const updateSensitivities = (value: SensitivityKey[]) => {
    setSensitivities(value);
    localStorage.setItem("truelabel_sensitivities", JSON.stringify(value));
  };

  const scan = async (input: { query: string; personalContext: string; frontImageBase64: string | null; backImageBase64: string | null }) => {
    if (scanLock.current) return;
    scanLock.current = true;
    setScanning(true);
    setEvents([]);
    setResult(null);
    setError("");
    setSelectedClaim(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-device-id": deviceId() },
        body: JSON.stringify({ ...input, sensitivities, presetId: null, forceLive: true })
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({ error: "The live scan could not start." }));
        throw new Error(String(body.error));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const line = frame.split("\n").find((entry) => entry.startsWith("data: "));
          if (!line) continue;
          const event = JSON.parse(line.slice(6)) as PipelineEvent;
          setEvents((current) => [...current, event]);
          if (event.stage === "complete") {
            setResult(event.payload.result as AnalyzeResult);
          }
          if (event.stage === "error") {
            setError(String(event.payload.message ?? "The live scan could not be completed."));
          }
        }
        if (done) break;
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The live scan could not be completed.");
    } finally {
      scanLock.current = false;
      setScanning(false);
    }
  };

  const focusClaim = (id: string) => {
    setSelectedClaim(id);
    document.getElementById(`claim-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main id="top">
      <HeaderBar />
      <div className="shell">
        <SensitivityPills selected={sensitivities} onChange={updateSensitivities} />
        {ready && !available && (
          <section className="key-notice">
            <strong>Live scans are locked.</strong>
            <span>
              Create <code>.env.local</code>, add <code>CLOCKED_API_KEY</code>, then restart <code>pnpm dev</code>.
            </span>
          </section>
        )}
        <UnifiedInput disabled={!available} scanning={scanning} onSubmit={scan} />
        {error && (
          <section className="scan-error" role="alert">
            {error}
          </section>
        )}
        <PipelineStreamBar events={events} />
        {result && (
          <div className="results">
            <TruthVerdictBanner result={result} />
            <TruthSpectrumSVG result={result} onClaimSelect={focusClaim} />
            <IngredientReview result={result} />
            <div className="three-panels">
              <PersonalRiskCard result={result} />
              <RegionalAndLabelDiff result={result} />
              <TruthBadgeCard result={result} />
            </div>
            <ClaimLedger result={result} selectedClaim={selectedClaim} />
          </div>
        )}
        <footer>
          <span>TrueLabel cross-examines marketing promises against packaging disclosures, Wikipedia science, and clinical studies.</span>
          <span>Powered live by Clocked Intelligence.</span>
        </footer>
      </div>
    </main>
  );
}
