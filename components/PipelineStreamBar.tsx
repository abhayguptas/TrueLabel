"use client";

import { useState } from "react";
import type { PipelineEvent, PipelineStage } from "@/lib/types";

const stages: Array<{ key: PipelineStage; label: string; endpoint: string }> = [
  { key: "resolve_source", label: "Resolve source", endpoint: "YouTube captions" },
  { key: "guard_protect", label: "Sanitize input", endpoint: "/injection + /pii" },
  { key: "fill", label: "Structure label", endpoint: "/fill" },
  { key: "extract", label: "Extract facts", endpoint: "/extract" },
  { key: "rerank", label: "Match evidence", endpoint: "/rerank" },
  { key: "compare", label: "Compare sources", endpoint: "/compare" },
  { key: "verify_decide", label: "Verify and assess", endpoint: "/grounding + /decide" }
];

export function PipelineStreamBar({ events }: { events: PipelineEvent[] }): React.ReactElement | null {
  const [open, setOpen] = useState<PipelineStage | null>(null);
  if (!events.length) return null;
  const active = new Set(events.map((event) => event.stage));
  const selected = events.find((event) => event.stage === open);
  const visibleStages = active.has("resolve_source") ? stages : stages.filter((stage) => stage.key !== "resolve_source");
  return <section className="pipeline"><div className="section-label"><span>Live Clocked pipeline</span><span>{active.has("complete") ? "Complete" : "Running"}</span></div><div className="stage-grid">{visibleStages.map((stage) => <button type="button" key={stage.key} className={`stage-card ${active.has(stage.key) ? "done" : ""}`} onClick={() => setOpen(stage.key)}><strong>{stage.label}</strong><code>{stage.endpoint}</code><span>{active.has(stage.key) ? "Complete" : "Waiting"}</span></button>)}</div>{selected && <div className="inspection"><div><strong>Endpoint inspection</strong><button type="button" onClick={() => setOpen(null)}>Close</button></div><pre>{JSON.stringify(selected.payload, null, 2)}</pre></div>}</section>;
}
