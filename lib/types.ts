export const sensitivityKeys = ["acne", "fungal_acne", "eczema", "diabetic", "palm_oil_free"] as const;

export type SensitivityKey = (typeof sensitivityKeys)[number];
export type PipelineStage = "guard_protect" | "fill" | "rerank" | "extract" | "compare" | "verify_decide" | "complete" | "error";
export type Verdict = "supported" | "contradicted" | "not_stated" | "unproven" | "caution";

export interface AnalyzeRequest {
  query: string;
  personalContext: string;
  frontImageBase64: string | null;
  backImageBase64: string | null;
  sensitivities: SensitivityKey[];
  presetId: string | null;
  forceLive: boolean;
}

export interface EvidenceSpan {
  text: string;
  start?: number;
  end?: number;
  confidence?: number;
  documentId?: string;
  sourceImage?: number;
}

export interface ClaimResult {
  id: string;
  claim: string;
  verdict: Verdict;
  confidence: number;
  evidence?: EvidenceSpan;
}

export interface IngredientResult {
  name: string;
  confidence: number;
  start?: number;
  end?: number;
  triggers: SensitivityKey[];
}

export interface ReferenceDocument {
  id: string;
  title: string;
  category: "supplement" | "food" | "skincare" | "regulation";
  sourceUrl: string;
  publisher: string;
  region?: string;
  text: string;
  tags: string[];
}

export interface RiskResult {
  sensitivity: SensitivityKey;
  probability: number;
  verdict: "low" | "caution" | "high";
  triggers: string[];
}

export interface CautionResult {
  probability: number;
  verdict: "low" | "caution" | "high";
  message: string;
}

export interface AnalyzeResult {
  inputText: string;
  sourceMode: "text" | "image" | "mixed";
  claims: ClaimResult[];
  ingredients: IngredientResult[];
  references: ReferenceDocument[];
  rejectedReferences: ReferenceDocument[];
  risks: RiskResult[];
  overallCaution: CautionResult;
  personalContextCaution?: CautionResult;
  conflicts: Array<{ left: string; right: string; detail: string; confidence: number }>;
  productDose?: { product: string; clinical: string; productValue?: number; clinicalValue?: number };
  regionalDiff?: { india: string; international: string; summary: string };
  raw: Record<string, unknown>;
}

export interface PipelineEvent {
  stage: PipelineStage;
  payload: Record<string, unknown>;
}

export interface ClockedResponse<T> {
  data: T;
  headers: Headers;
  cached: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  column: 0 | 1 | 2;
  verdict?: Verdict;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  verdict: Verdict;
  claimId: string;
}
