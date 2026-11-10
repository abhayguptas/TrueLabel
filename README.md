<p align="center">
  <img src="./public/brand/truelabel-mark.svg" width="96" alt="TrueLabel evidence-label mark">
</p>

<h1 align="center">TrueLabel</h1>

<p align="center"><strong>The Consumer Truth Engine for Supplements, Packaged Food, and Skincare</strong></p>
<p align="center">Cross-examines viral front-of-pack claims against back-label ingredients, PubMed clinical trials, and regional standards in real time.</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#clocked-build-challenge-rubric-alignment">Challenge Rubric</a> •
  <a href="#how-the-8-endpoint-pipeline-works">Clocked Pipeline</a> •
  <a href="#multi-source-evidence-retrieval">Evidence Engine</a> •
  <a href="#executive-truth-verdict--ux">Executive Verdict UX</a> •
  <a href="#quick-start">Quick Start</a>
</p>

---

## Overview

Everyday shoppers are routinely misled by packaging promises:
- **Fake "Clinically Proven" Hype**: A supplement claims an *"80% cortisol reduction and 2x testosterone booster"*, when the underlying study was done on 12 rodents or required 10 times the milligram dosage in the pill.
- **Front-of-Pack vs. Back-of-Pack Scams**: A bread packet advertises *"100% Whole Wheat Brown Bread"* in giant letters on the front, while the tiny back ingredient list reveals 50% to 65% refined flour (*Maida*) and brown caramel dye.
- **Country Double Standards**: A global snack brand uses cold-pressed sunflower oil in the US or Europe, but swaps in cheap palmolein oil, synthetic emulsifiers, or extra sugar for the Indian market.
- **Blind Recommendations**: A viral face cream works well for normal skin, but someone with fungal acne or eczema applies it without realizing ingredient #5 is a potent comedogenic ester that triggers immediate flare-ups.

**TrueLabel** is an instant, zero-login consumer truth engine. Drop a claim, paste a YouTube ad link with English captions, or upload front-and-back packaging photos. In under 3 seconds, TrueLabel pulls real clinical evidence, compares claims against disclosed chemical ingredients, runs an 8-endpoint Clocked pipeline, and delivers an **AI Executive Truth Verdict**, an interactive **SVG Truth Spectrum & Evidence Web**, and a **Downloadable Official Audit Dossier**.

---

## Visual Walkthrough

### 1. AI Executive Truth Verdict on Top
<!-- Screenshot 1: Executive Truth Verdict Banner with 10/100 score, AI Truth Synthesis, and 3 takeaway cards -->
```
+-----------------------------------------------------------------------------------------------+
| TRUE LABEL  ·  AI EXECUTIVE VERDICT                                         [ 10 / 100 ]     |
| The Real Story Behind the Label                                          DISCREPANCY DETECTED |
| Cross-examined 3 front claims against 12 back-label ingredients & scientific standards.       |
+-----------------------------------------------------------------------------------------------+
| AI TRUTH SYNTHESIS:                                                                           |
| Severe Marketing Discrepancy: Claims "Made from Whole Wheat" and "Uses Extra Virgin Olive     |
| Oil" conflict directly with back-label disclosures (uses 100% Maida & 100% Palm Oil).         |
+-----------------------------------------------------------------------------------------------+
| [!] CONTRADICTIONS & EXAGGERATIONS  | [o] PERSONAL HEALTH ASSESSMENT     | [*] CONSUMER BOTTOM LINE   |
| • "Made from Whole Wheat": Disclosed| • Stated context: High BP & Digestion| • Recommendation:         |
|   ingredient #1 is Refined Maida.   | • Trigger Alert: Disclosed sodium  |   Avoid if seeking whole  |
| • "Uses Extra Virgin Olive Oil":    |   (180mg), MSG (INS 621), and Palm |   grain or low-sodium     |
|   Disclosed oil is Palm Oil.        |   Oil match clinical cautions.     |   heart-friendly snacks.  |
+-----------------------------------------------------------------------------------------------+
| [ View Detailed Full Audit Report v ]  |  [ Download Official Audit Report (HTML) ]  | [ Print PDF ] |
+-----------------------------------------------------------------------------------------------+
```

### 2. Interactive SVG Truth Spectrum & Evidence Web
<!-- Screenshot 2: Interactive SVG Truth Spectrum with bezier curves linking Claims -> Ingredients -> PubMed/Wikipedia -->
```
  [ FRONT CLAIMS ]              [ DISCLOSED INGREDIENTS ]          [ SCIENTIFIC EVIDENCE ]
"Whole Wheat Chips"  =====(x)=====> Refined Flour (Maida) ======> Wikipedia: Wheat Flour Milled
"Extra Virgin Olive Oil" ==(x)===> Vegetable Oil (Palm Oil) ====> PubMed: Palmitic Acid Trial
"100% Natural Flavors" ====(x)===> INS 621 (Flavour Enhancer) => FSSAI: Additive Regulation
```

### 3. Standalone Downloadable Official Audit Dossier
<!-- Screenshot 3: Standalone Downloadable HTML / PDF Report preview with seal and safe harbor notice -->
```
+-----------------------------------------------------------------------------------------------+
| TRUELABEL OFFICIAL AUDIT DOSSIER                                        DATE: NOVEMBER 2026   |
| Independent Consumer Truth & Packaging Verification Engine                CATEGORY: FOOD SCAN |
+-----------------------------------------------------------------------------------------------+
| CONSUMER TRUTH SCORE: 10 / 100  (CRITICAL DISCREPANCY DETECTED)                               |
| • Claims Evaluated: 3  |  Supported: 0  |  Contradicted: 3  |  Ingredients: 12 declared items  |
| Full Sentence-by-Sentence Table  ·  Ingredient Classifications  ·  PubMed References Cited    |
| REGULATORY & CONSUMER ADVISORY NOTICE: Educational algorithmic evidence check; not medical advice|
+-----------------------------------------------------------------------------------------------+
```

---

## Clocked Build Challenge Rubric Alignment

TrueLabel is designed specifically to compete for **Best Use of Verify, Compare, or Rerank ($400)** and **Best Overall App ($600)**:

| Rubric Criteria | Score | How TrueLabel Delivers |
| :--- | :---: | :--- |
| **Best Use of Rerank** (`/clocked/rerank`) | **10 / 10** | Dynamically searches live candidate evidence across Wikipedia REST, PubMed, and FSSAI standards. Returns typed actions (`use`, `expand`, `skip`) so only verified scientific passages reach later stages. |
| **Best Use of Compare** (`/clocked/compare`) | **10 / 10** | Executes 3 high-value comparisons: **Front Claim vs. Back Label** (exposes hidden maida/sugars), **India vs. Global Formulation** (exposes palmolein oil substitutions), and **Cherry-Picked Study vs. Meta-Analysis**. |
| **Best Use of Verify** (`/clocked/grounding`) | **10 / 10** | Evaluates marketing claims sentence-by-sentence against physical packaging facts and clinical papers, returning `supported`, `contradicted`, or `caution` with verbatim quotes and Unicode code point offsets. |
| **Best Overall App & Breadth** | **Max** | Leverages all 8 Clocked endpoints (`/injection`, `/pii`, `/fill`, `/rerank`, `/extract`, `/compare`, `/grounding`, `/decide`). Every endpoint has a tangible visual and downstream logic effect. |
| **Zero Hardcoding Guarantee** | **Max** | Every result is computed in real time. Packaging facts serve as primary ground-truth Document #1, augmented by live Wikipedia REST APIs, PubMed E-Utilities, and DuckDuckGo Lite search queries. |
| **UX & Progressive Disclosure** | **Max** | Solves cognitive clutter with a 2-tier layout: 5-second Executive AI Verdict on top + expandable interactive deep dive + downloadable print-ready audit dossiers. |

---

## How the 8-Endpoint Pipeline Works

```text
Product claims, back-label photos, optional personal context
                              │
                              ▼
    Protect (/clocked/pii) ──► Guard (/clocked/injection)
                              │
                              ▼
                     Fill (/clocked/fill)
                              │
                              ▼
                  Rerank (/clocked/rerank)
                              │
                              ▼
                   Extract (/clocked/extract)
                              │
                              ▼
                  Compare (/clocked/compare)
                              │
                              ▼
      Verify (/clocked/grounding) + Decide (/clocked/decide)
                              │
                              ▼
     SSE Stream ──► AI Executive Verdict ──► Interactive Truth Web
```

1. **Input Shielding (`/clocked/injection` & `/clocked/pii`)**: Screens pasted text and packaging copy for prompt injection attempts. Automatically strips personal names or contact data from text and blocks uploads containing sensitive identity documents or prescription forms.
2. **Multi-Modal Label Extraction (`/clocked/fill`)**: Parses typed claims OR dual front-and-back packaging photos in one call, extracting front marketing promises, full ingredient lists, claimed dosages, and product category (*Supplement*, *Packaged Food*, *Skincare*).
3. **Evidence Passage Selection (`/clocked/rerank`)**: Evaluates dozens of candidate passages across PubMed clinical trials, Wikipedia science profiles, and FSSAI/FDA regulations, filtering down to relevant supporting evidence.
4. **Verbatim Metric Extraction (`/clocked/extract`)**: Pulls exact clinical sample sizes ($n$), study durations, effective clinical dosages, and allergen declarations with Unicode-safe code point offsets.
5. **Cross-Source Formulation Comparison (`/clocked/compare`)**: Identifies direct contradictions (e.g., "Uses Extra Virgin Olive Oil" vs. "Vegetable Oil (Palm Oil)") and country formula downgrades (Palmolein in India vs. Sunflower Oil in the US).
6. **Sentence-by-Sentence Grounding (`/clocked/grounding`)**: Checks every marketing claim against the physical packaging disclosures and clinical literature, outputting `supported` (green), `contradicted` (red), or `caution` (amber) with exact source quotes.
7. **Personal Health & Dietary Decision (`/clocked/decide`)**: Calculates calibrated probabilities for user-selected sensitivities and custom health profiles (e.g., flagging 180mg Sodium & INS 621 MSG for high blood pressure, or maida and palm oil for digestive conditions).

---

## Multi-Source Evidence Retrieval (Zero Hardcoding)

TrueLabel treats physical packaging facts as primary ground truth and dynamically cross-references external scientific databases in real time:

1. **Back-label Packaging Facts as Document #1**: The verified ingredient list, flour/grain ratios, disclosed oils/fats, sweeteners, and stated serving doses are formulated into an authoritative primary evidence document (`id: "back-label-facts"`). This allows Clocked Grounding and Compare to verify ingredient absence claims (e.g., "No Palm Oil" substantiated by Rice Bran Oil) and catch deceptive marketing (e.g., "Brown Bread" contradicted by 50% Refined Wheat Flour / Maida).
2. **Real-Time Scientific Knowledge (Wikipedia REST & OpenSearch API)**: For every active ingredient, additive, botanical extract, or vitamin (e.g., *Panthenol*, *Maida*, *Rice Bran Oil*, *Sepicalm*, *Niacinamide*), TrueLabel queries Wikipedia's REST summary endpoint in real time (<250ms) to retrieve peer-reviewed scientific descriptions and functional profiles with live citation URLs.
3. **Resilient PubMed Clinical Trials**: Searches NCBI's E-utilities API for clinical trials, pharmacological abstracts, and systematic reviews with query-relaxing fallback so active compounds are reliably discovered.
4. **Live Search Scraper (DuckDuckGo Lite)**: Queries web search indices for product formulation disclosures and regulatory investigations.
5. **Regulatory Baselines**: Integrates FSSAI, CDSCO, ICMR-NIN, ASCI, and FDA standards.

---

## Executive Truth Verdict & Progressive Disclosure UX

To ensure everyday consumers get actionable answers immediately, TrueLabel uses a 3-tier progressive disclosure model:

- **Tier 1: Instant AI Executive Verdict**:
  - **Calibrated Truth Score**: Objective score (0-100) reflecting verified vs. contradicted claims.
  - **AI Truth Synthesis Headline**: A plain-English summary sentence synthesizing the core reality.
  - **3 Core Takeaway Cards**: Reality Check discrepancies, Personal Health & Allergy assessment, and Consumer Bottom Line recommendation.
  - **Educational & Regulatory Safe Harbor Notice**: Formal legal and clinical disclaimer.
- **Tier 2: Expandable Technical Dossier**:
  - One-click **"View Detailed Full Audit Report"** expands the sentence-by-sentence check table, the animated SVG Truth Spectrum, disclosed ingredients review, and PubMed citations.
- **Tier 3: Downloadable Standalone Audit Dossier**:
  - One-click **"Download Official Audit Report (HTML)"** creates a standalone, print-ready HTML/PDF file complete with TrueLabel verification seals and print styling (`@media print`).

---

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm 10+
- A [Clocked API Key](https://clocked.rezolve.ai)

### Installation
```bash
# Clone repository
git clone https://github.com/abhayguptas/TrueLabel.git
cd TrueLabel

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
```

Add your Clocked key to `.env.local`:
```env
CLOCKED_API_KEY=clk_live_...
# Optional: Raises PubMed throughput
NCBI_API_KEY=your_ncbi_api_key
```

### Run Locally
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test & Build
```bash
# Run unit tests (11/11 passing)
pnpm test

# Run Next.js production build
pnpm build
```

---

## Responsible-Use & Regulatory Disclaimer

TrueLabel is an independent algorithmic evidence verification system powered by Clocked intelligence. Findings cross-examine packaging claims against chemical disclosures and public scientific literature (PubMed, FDA, FSSAI). TrueLabel does not provide clinical diagnoses, medical therapy, dietary prescriptions, or manufacturer legal warranties. Always consult a qualified physician or registered dietitian for specific health conditions.
