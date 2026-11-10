"use client";

import type { AnalyzeResult } from "@/lib/types";
import { synthesizeExecutiveVerdict } from "@/lib/verdict-synthesizer";
import { downloadFullReport } from "@/lib/report-exporter";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Printer,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles
} from "lucide-react";

interface TruthVerdictBannerProps {
  result: AnalyzeResult;
  onToggleFullReport?: () => void;
  isFullReportOpen?: boolean;
}

export function TruthVerdictBanner({
  result,
  onToggleFullReport,
  isFullReportOpen = false
}: TruthVerdictBannerProps): React.ReactElement {
  const verdict = synthesizeExecutiveVerdict(result);

  const statusClass =
    verdict.statusBadge === "red"
      ? "verdict-badge-red"
      : verdict.statusBadge === "green"
      ? "verdict-badge-green"
      : "verdict-badge-amber";

  return (
    <section className="verdict-banner">
      {/* Header with Title and Score Pill */}
      <div className="verdict-header">
        <div>
          <span className="eyebrow">
            <Sparkles size={12} className="inline-icon" />
            Consumer Truth Engine · AI Executive Verdict
          </span>
          <h2 className="verdict-title">The Real Story Behind the Label</h2>
          <p className="verdict-subtitle">
            Cross-examined {result.claims.length} marketing claim(s) against {result.ingredients.length} back-label
            ingredient(s), PubMed clinical trials, and regulatory standards.
          </p>
        </div>
        <div className={`verdict-score-pill ${statusClass}`}>
          <div className="score-num">
            {verdict.score}
            <span>/100</span>
          </div>
          <div className="score-desc">{verdict.statusLabel}</div>
        </div>
      </div>

      {/* AI Tailored Headline Callout */}
      <div className={`executive-headline-box ${verdict.statusBadge}`}>
        <strong>AI Truth Synthesis:</strong>
        <p>{verdict.headline}</p>
      </div>

      {/* 3 Executive Takeaway Cards */}
      <div className="verdict-highlights-grid">
        {/* Card 1: The Reality Check */}
        <div className={`highlight-card ${verdict.statusBadge === "red" ? "red-card" : "green-card"}`}>
          <div className="card-badge">
            {verdict.statusBadge === "red" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            <span>{verdict.statusBadge === "red" ? "Contradictions & Exaggerations" : "Substantiated Promises"}</span>
          </div>
          <strong>{verdict.statusBadge === "red" ? "Front claims contradicted by back label:" : "Verified packaging promises:"}</strong>
          <ul className="executive-bullets">
            {verdict.realityBullets.map((bullet, idx) => (
              <li key={idx}>
                <strong>&quot;{bullet.claim}&quot;</strong>: {bullet.finding}
              </li>
            ))}
          </ul>
        </div>

        {/* Card 2: Personal Health & Allergy Check */}
        {verdict.personalHealthAlert ? (
          <div
            className={`highlight-card ${
              verdict.personalHealthAlert.level === "high"
                ? "red-card"
                : verdict.personalHealthAlert.level === "caution"
                ? "amber-card"
                : "green-card"
            }`}
          >
            <div className="card-badge">
              {verdict.personalHealthAlert.level === "high" ? (
                <ShieldAlert size={14} />
              ) : verdict.personalHealthAlert.level === "caution" ? (
                <AlertTriangle size={14} />
              ) : (
                <ShieldCheck size={14} />
              )}
              <span>Personal Health Assessment</span>
            </div>
            <strong>{verdict.personalHealthAlert.title}</strong>
            <p style={{ marginTop: "6px" }}>{verdict.personalHealthAlert.description}</p>
          </div>
        ) : (
          <div className="highlight-card amber-card">
            <div className="card-badge">
              <ShieldCheck size={14} />
              <span>Personal Health Check</span>
            </div>
            <strong>General Dietary Guidance:</strong>
            <p style={{ marginTop: "6px" }}>
              {result.productCategory === "packaged food"
                ? "In food formulations, the first 3 ingredients represent the vast majority of net product weight."
                : result.productCategory === "skincare"
                ? "Active cosmetic ingredients work alongside emulsifiers. Check below for comedogenic ratings."
                : "Supplement benefits depend on therapeutic milligram dosage matching clinical trials."}
            </p>
          </div>
        )}

        {/* Card 3: Actionable Bottom Line */}
        <div className="highlight-card amber-card">
          <div className="card-badge">
            <FileText size={14} />
            <span>Consumer Bottom Line</span>
          </div>
          <strong>Recommendation:</strong>
          <p style={{ marginTop: "6px" }}>{verdict.bottomLine}</p>
        </div>
      </div>

      {/* Regulatory & Educational Safe Harbor Disclaimer */}
      <div className="legal-disclaimer-card">
        <div className="disclaimer-title">
          <Scale size={13} className="inline-icon" />
          <span>Educational &amp; Regulatory Safe Harbor Notice</span>
        </div>
        <p>{verdict.disclaimer}</p>
      </div>

      {/* Action CTAs */}
      <div className="verdict-action-bar">
        {onToggleFullReport && (
          <button
            type="button"
            className="action-btn-primary"
            onClick={onToggleFullReport}
          >
            {isFullReportOpen ? (
              <>
                <ChevronUp size={16} /> Hide Detailed Technical Audit
              </>
            ) : (
              <>
                <ChevronDown size={16} /> View Detailed Full Audit Report (Interactive Graph, Claims Table, Studies)
              </>
            )}
          </button>
        )}

        <button
          type="button"
          className="action-btn-secondary"
          onClick={() => downloadFullReport(result)}
        >
          <Download size={15} /> Download Official Audit Report (HTML)
        </button>

        <button
          type="button"
          className="action-btn-secondary"
          onClick={() => window.print()}
        >
          <Printer size={15} /> Print / Save as PDF
        </button>
      </div>
    </section>
  );
}
