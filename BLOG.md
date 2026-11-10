# Why Front Labels Need Evidence: Building TrueLabel with Next.js and Clocked

By Abhay and Siddhi | Built for the Clocked Build Challenge 2026 (#clockedchallenge)

---

## 1. The Problem Started on Our Own Shelves

TrueLabel started with a familiar frustration: the front of a package makes a confident promise, while the information needed to evaluate that promise is scattered across the back label, regional chemical filings, scientific journals, and clinical trial registries.

Everyday consumers get misled in four systematic ways:
1. **Fake "Clinically Proven" Hype**: A viral supplement claims to *"lower cortisol by 80% and boost testosterone in 14 days"*, yet the underlying study was conducted on 12 rodents or required 10 times the milligram dosage present in the gummy.
2. **Front-of-Pack vs. Back-of-Pack Contradictions**: A bread loaf boasts *"100% Whole Wheat Brown Bread"* in bold typography on the front, while the tiny back ingredient list reveals 50% to 65% refined flour (*Maida*) and caramel coloring.
3. **Country Double Standards**: A multinational snack brand uses cold-pressed sunflower oil in the US or Europe, but substitutes cheap palmolein oil, extra sugar, or synthetic emulsifiers for the Indian market.
4. **Blind Recommendations ("Good for My Bestie, Bad for Me")**: A skincare cream goes viral on TikTok. A friend with normal skin loves it, but someone with fungal acne, eczema, or sensitive skin applies it without realizing ingredient #5 is a potent comedogenic ester that triggers immediate flare-ups.

<!-- SCREENSHOT: Unified Input with Front and Back Photos of Nature's Crunch Chips & Personal Health Context ("high blood pressure, and digestion problem") -->

We did not want another chatbot that hallucinates plausible-sounding wellness advice. We wanted an instant, zero-login consumer truth engine that cross-examines packaging claims against chemical disclosures and scientific literature in real time.

That is why we built **TrueLabel**. Powered by the [Clocked API](https://clocked.rezolve.ai/docs), TrueLabel takes typed claims, product URLs, or front-and-back photos, retrieves real clinical evidence, runs an 8-endpoint intelligence pipeline, and renders an **AI Executive Truth Verdict**, an interactive **SVG Truth Spectrum & Evidence Web**, and a **Downloadable Official Audit Dossier**.

---

## 2. The UX Breakthrough: Progressive Disclosure & Executive Verdict

In our initial prototypes, after scanning a product, the app displayed seven heavy technical widgets all at once: a reality table, an SVG bezier graph, chemical reviews, regional diff cards, and scientific reference ledgers. 

User testing revealed an immediate problem: **everyday shoppers were overwhelmed by cognitive clutter**. If someone scans a bag of chips in a grocery aisle, they need a clear, definitive verdict in under 5 seconds, not a thesis. Furthermore, internal comparisons were dumping 50-word ingredient lists repeatedly inside bullet points.

<!-- SCREENSHOT: Executive Truth Verdict Banner showing 10/100 Score, Red Discrepancy Badge, AI Truth Synthesis Headline, and 3 Takeaway Cards -->

We completely redesigned the UX around **Progressive Disclosure**:

### Level 1: The AI Executive Truth Verdict (Instant 5-Second Clarity)
Right on top, the consumer receives:
- **Truth Score & Status Pill**: A calibrated score (`10/100 Discrepancy Detected` or `92/100 Verified Formulation`).
- **AI Truth Synthesis Headline**: A plain-English sentence capturing the core reality (e.g., *"Severe Marketing Discrepancy: Claims 'Made from Whole Wheat' and 'Uses Extra Virgin Olive Oil' conflict directly with back-label disclosures."*).
- **Three Core Takeaway Cards**:
  1. 🚨 **The Reality Check**: Crisp, non-repetitive discrepancy bullets explaining the exact conflict without repeating entire ingredient strings.
  2. ⚠️ **Personal Health & Allergy Assessment**: Direct clinical evaluation of user-entered sensitivities (e.g., high blood pressure flags 180mg Sodium and Flavour Enhancer MSG INS 621; digestion flags Palm Oil and Maida).
  3. 💡 **Consumer Bottom Line**: Direct buying advice (e.g., *"Not recommended as a healthy whole-grain alternative. Formulated with standard ultra-processed maida and palm oil."*).
- **Legal & Regulatory Safe Harbor Notice**: An explicit advisory disclaimer emphasizing that TrueLabel is an educational evidence verification tool, not a medical diagnosis or legal warranty.

<!-- SCREENSHOT: Regulatory & Educational Safe Harbor Notice with Download and View Full Report Action Buttons -->

### Level 2: The Deep-Dive Audit Dossier (Opened on Demand)
With one click on **`[ View Detailed Full Audit Report ↓ ]`**, the complete technical evidence suite expands smoothly:
- **Sentence-by-Sentence Reality Table**: Maps every front claim directly to back-label proof.
- **Interactive SVG Truth Spectrum**: Bezier curves connecting Claims $\to$ Ingredients $\to$ PubMed/Wikipedia Sources.
- **Disclosed Ingredients Breakdown**: Functional classifications, safety ratings, and comedogenic scores.
- **Regional & Formulation Comparison**: Exposes India vs. US/EU ingredient downgrades.
- **Cited Scientific Literature**: Direct links to PubMed clinical trials and Wikipedia OpenSearch articles.

### Level 3: Downloadable Official Audit Dossier
Shoppers and regulatory researchers can click **`[ Download Official Audit Report (HTML) ]`** to save a standalone, print-ready dossier (`TrueLabel-Audit-Report-YYYY-MM-DD.html`) equipped with a print button (`@media print`) and TrueLabel verification seals.

<!-- SCREENSHOT: Downloaded Standalone Print-Ready Audit Dossier in Browser / PDF Preview -->

---

## 3. Real-Time Multi-Source Evidence: Zero Hardcoding

A strict engineering constraint of TrueLabel is **zero hardcoding**. We did not build a demo that only works on hardcoded preset strings. Whether a user uploads an artisanal face serum or a regional pack of biscuits, TrueLabel discovers the ground truth in real time:

```text
User Input (Text / Image / Video)
          |
          v
[1] Back-Label Packaging Facts (Primary Ground Truth: Document #1)
[2] Wikipedia REST & OpenSearch API (<250ms per active ingredient)
[3] PubMed E-Utilities Clinical Search (NCBI pharmacological trials)
[4] DuckDuckGo Lite Live Search Scraper (Formulation investigations)
[5] Regulatory Baselines (FSSAI, FDA, CDSCO, ICMR-NIN, ASCI)
          |
          v
Clocked Intelligence Pipeline (/rerank -> /compare -> /grounding -> /decide)
```

1. **Back-Label Packaging Facts as Document #1**: The verified ingredient list, flour ratios, and cooking oils are formulated into an authoritative primary evidence document (`id: "back-label-facts"`). This allows Clocked Grounding and Compare to verify ingredient absence claims (e.g., "No Palm Oil" substantiated by Rice Bran Oil) and catch deceptive marketing (e.g., "Whole Wheat" contradicted by 100% Maida).
2. **Wikipedia REST Summary & OpenSearch**: For every active botanical extract, vitamin, or chemical additive (*Panthenol*, *INS 621*, *Maida*, *Rice Bran Oil*), TrueLabel queries Wikipedia's REST summary endpoint live to pull peer-reviewed scientific descriptions and functional profiles.
3. **Resilient PubMed Clinical Trials**: NCBI's E-utilities API is queried for randomized controlled trials, sample sizes ($n$), and therapeutic dosages.
4. **DuckDuckGo Lite Web Search**: Live search queries identify known manufacturer formulation disclosures and regulatory alerts.

---

## 4. The Live Eight-Endpoint Clocked Pipeline

TrueLabel is architected to maximize the Clocked Build Challenge rubric, specifically targeting **Best Use of Verify, Compare, or Rerank ($400)** and **Best Overall App ($600)**:

```text
Product claims, back label, optional personal health context
                              |
                              v
   Protect (/clocked/pii) -> Guard (/clocked/injection)
                              |
                              v
                     Fill (/clocked/fill)
                              |
                              v
                  Rerank (/clocked/rerank) [10 pts]
                              |
                              v
                   Extract (/clocked/extract)
                              |
                              v
                  Compare (/clocked/compare) [10 pts]
                              |
                              v
      Verify (/clocked/grounding) [10 pts] + Decide (/clocked/decide)
                              |
                              v
     SSE Stream -> AI Executive Verdict -> Interactive Evidence Web
```

| Endpoint | Role in TrueLabel | Downstream Product Effect |
| :--- | :--- | :--- |
| `/clocked/pii` | Input anonymization & vision security | Redacts personal data in text; blocks images containing private identity documents or prescriptions. |
| `/clocked/injection` | Prompt & instruction guard | Screens untrusted packaging copy and transcripts against prompt injection attempts. |
| `/clocked/fill` | Multi-modal structure extraction | Extracts marketing promises, ingredient list, and dosages from text or dual front-and-back photos in one pass. |
| `/clocked/rerank` *(Core Track #1)* | Scientific evidence selection | Evaluates dozens of candidate passages across PubMed, Wikipedia, and FSSAI, returning `use`, `expand`, or `skip`. |
| `/clocked/extract` *(Bonus)* | Verbatim entity offsets | Pulls exact sample sizes ($n=42$), clinical trial durations, and active milligram dosages with Unicode-safe offsets. |
| `/clocked/compare` *(Core Track #2)* | Cross-source conflict detector | Detects direct contradictions: Front Claim vs. Back Label, Cherry-Picked Study vs. Meta-Analysis, and India Formula vs. US Formula. |
| `/clocked/grounding` *(Core Track #3)* | Sentence-by-sentence verification | Verifies each claim against selected evidence, outputting `supported`, `contradicted`, or `caution` with verbatim quotes. |
| `/clocked/decide` *(Bonus)* | Calibrated health risk scoring | Computes calibrated risk probabilities for personal health profiles (e.g., 94% breakout risk for acne-prone skin). |

---

## 5. Engineering Challenges & How We Solved Them

### Challenge 1: The Unicode Code Point vs. UTF-16 Offset Gap
Clocked text grounding returns Unicode code point offsets, while JavaScript `String.prototype.slice` indexes by UTF-16 code units. On product labels containing symbols like `µg`, `™`, and `®`, standard string slicing corrupts character offsets. We implemented an `Array.from` Unicode slicing helper:

```ts
export function unicodeSlice(text: string, start: number, end: number): string {
  return Array.from(text).slice(start, end).join("");
}
```

### Challenge 2: Eliminating Clocked Compare Jargon (`scope`)
When Clocked `/clocked/compare` returned comparison items, the internal `kind` attribute occasionally emitted raw tokens like `"scope"`. In early tests, this caused the UI to render awkward bullets like `• scope: Front Claim vs Back Label`. We built an intelligent sanitizer that translates internal classification kinds into human terms like `Formulation Discrepancy` and `Direct Contradiction`.

### Challenge 3: Deterministic SVG Bezier Graph Without Key Collisions
Our animated Truth Spectrum connects Claims $\to$ Ingredients $\to$ Scientific Sources via SVG cubic bezier curves. When multiple claims referenced the same ingredient and source, React threw duplicate DOM key warnings (`Wheat Flour-web-scrape-1`). We resolved this in `lib/graph-layout.ts` by generating unique deterministic compound keys prefixed by claim index, relationship type, and source ID.

<!-- SCREENSHOT: Close-up of Interactive SVG Truth Spectrum with green, red, and amber connecting curves -->

### Challenge 4: Deep Personal Health Interpretation
Users don't just have generic allergies; they enter complex real-world conditions like *"high blood pressure, and digestion problem"*. We built a clinical context interpreter in `lib/pipeline-runner.ts` that cross-examines stated conditions against chemical ingredient disclosures:
- **Blood Pressure / Hypertension**: Scans for Sodium, Iodized Salt, Monosodium Glutamate / Flavour Enhancers (*INS 621, INS 631*), and Saturated Palm Oils.
- **Digestion / IBS / Acid Reflux**: Scans for Refined Wheat Flour (*Maida*), Acidity Regulators (*INS 330*), Preservatives (*INS 211, INS 282*), and Synthetic Dyes (*INS 102, INS 110*).
- **Celiac / Gluten**: Scans for Wheat, Atta, Maida, Barley, Malt, and Gluten.

---

## 6. Real-World Case Studies

### Test 1: Nature's Crunch Whole Wheat Chips
- **Front Claims**: *"100% Natural Flavors"*, *"Made from Whole Wheat"*, *"Uses Extra Virgin Olive Oil"*.
- **User Health Context**: *"high blood pressure, and digestion problem"*.
- **Back-Label Reality**: Refined Wheat Flour (*Maida*), Vegetable Oil (*Palm Oil*), Iodized Salt (180mg Sodium), Flavour Enhancers (*INS 621, INS 631*), Artificial Colours (*INS 102, INS 110*).
- **TrueLabel Verdict**: **10/100 DISCREPANCY DETECTED**.
  - All 3 front claims contradicted by packaging facts.
  - Personal Health Alert triggered for blood pressure (Sodium, MSG INS 621) and digestion (Maida, Palm Oil).

### Test 2: English Oven Brown Bread
- **Front Claims**: *"100% Whole Wheat Brown Bread"*, *"No Palm Oil"*, *"No Added Colours"*.
- **Back-Label Reality**: Wheat Flour [Atta (50%)], Refined Wheat Flour [Maida (50%)], Edible Vegetable Oil (Rice Bran).
- **TrueLabel Verdict**: **65/100 PARTIAL VERIFICATION**.
  - *"No Palm Oil"* substantiated by Rice Bran Oil.
  - *"Whole Wheat"* contradicted by 50% Maida composition.

---

## 7. How to Run TrueLabel

TrueLabel is a zero-database, server-rendered Next.js 15 application.

```bash
# Clone the repository
git clone https://github.com/abhayguptas/TrueLabel.git
cd TrueLabel

# Install dependencies
pnpm install

# Configure API Key
cp .env.example .env.local
# Add your CLOCKED_API_KEY to .env.local

# Start development server
pnpm dev
```

Open `http://localhost:3000` to run live packaging audits. Run `pnpm test` to execute all 11 unit tests and `pnpm build` to compile the production bundle.

---

## 8. Final Thoughts

Reading a product label in a grocery aisle or scrolling through skincare claims should not require a 45-minute PubMed research session. Clocked gave us the precise building blocks—structured multi-modal reads, passage reranking, semantic comparison, grounded claim verification, and probability assessment—to build an inspectable consumer truth engine.

We hope TrueLabel empowers shoppers to look past the front-of-pack marketing hype and see the real ingredients behind the claim.
