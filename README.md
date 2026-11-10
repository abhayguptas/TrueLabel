<p align="center">
  <img src="./public/brand/truelabel-mark.svg" width="96" alt="TrueLabel evidence-label mark">
</p>

<h1 align="center">TrueLabel</h1>

<p align="center">Live evidence checks for product labels, marketing claims, ingredients, and regional formulas.</p>

TrueLabel is a zero-login Next.js application for inspecting supplements, packaged foods, and skincare labels. A user supplies product text or front and back label photos. The server runs a live Clocked pipeline, selects relevant cited evidence, and returns an inspectable record of claims, ingredients, conflicts, source passages, and optional sensitivity cautions.

TrueLabel does not contain recorded runs, fixture results, synthetic findings, or a demo fallback. Every completed scan requires a valid `CLOCKED_API_KEY` and calls Clocked from the server.

## Problem statement

Product packaging often compresses complex claims into a few persuasive words. A front label can emphasize a headline while the ingredient list, serving dose, regional formulation, or supporting study tells a more qualified story. People also need a fast way to inspect ingredients in the context of allergies, acne-prone skin, dietary needs, or ingredient preferences without creating an account or handing an API key to a browser.

The problem is not a lack of product information. It is the gap between unstructured label copy and the evidence needed to interpret it responsibly.

## Solution

TrueLabel converts a label into a structured, evidence-linked inspection flow:

1. It accepts optional personal context, such as an allergy, a condition, a symptom, or an ingredient to avoid, without turning that context into a diagnosis.
2. It screens untrusted label content for instruction injection and personal information.
3. It extracts the stated claims, ingredients, product dose, and category directly from text or label images. Text-only results are checked against the submitted text before they become label facts.
4. It searches each verified back-label ingredient against a curated catalog of primary, regulatory, dermatology, and official manufacturer references, prioritizing India-focused records where relevant.
5. It compares concise label clauses with selected evidence instead of treating a long document as a single claim.
6. It verifies each claim, presents supporting or conflicting passages, and displays the outcome in a connected evidence graph.
7. It evaluates selected sensitivity profiles and optional personal context against extracted ingredients as educational cautions, never as diagnoses or safety guarantees.

## Product capabilities

| Area | Behavior |
| --- | --- |
| Product intake | Paste up to 15,000 characters or upload one front and one back label image. |
| Live analysis | All eight Clocked calls run server-side with a real API key. |
| Evidence selection | Rerank determines which catalog references reach later stages. |
| Label comparison | Compare identifies direct conflicts, duplication, and regional formulation differences. |
| Claim verification | Verify returns claim-level evidence and drives the truth-spectrum status colors. |
| Personal context | Decide scores only the sensitivity filters the user selects. |
| Optional context | Users can state an allergy, condition, symptom, or ingredient concern for a focused, non-diagnostic ingredient caution. |
| Export | A completed scan can produce a standalone SVG truth badge and Markdown embed text. |

## Clocked integration

The route at `POST /api/analyze` streams stage results as `text/event-stream`. It uses all eight endpoints deliberately rather than treating them as a generic completion API.

| Stage | Endpoint | Product consequence |
| --- | --- | --- |
| Input safety | `/clocked/injection` | Blocks label content that tries to redirect the analysis workflow. |
| Privacy | `/clocked/pii` | Redacts personal data in text before downstream processing and blocks images with detected personal data. |
| Label structure | `/clocked/fill` | Supplies the product claims, category, ingredients, and dose shown in the interface. |
| Exact reads | `/clocked/extract` | Supplies verbatim ingredient and dose reads plus Unicode-safe text offsets. |
| Source selection | `/clocked/rerank` | Receives the verified ingredient list, selects or expands catalog records, and prioritizes applicable India-focused evidence. Rejected records remain visible as lower-ranked evidence. |
| Cross-source review | `/clocked/compare` | Supplies direct conflict and overlap cards. |
| Claim verification | `/clocked/grounding` | Supplies the status and evidence used by the ledger and SVG truth spectrum. |
| Personal caution | `/clocked/decide` | Supplies the selected sensitivity probabilities and trigger explanations. |

The HTTP client generates a UUID idempotency key for every logical request. Retries reuse the same payload and key for transient failures. API keys are read only on the server and are never returned in an event payload or client bundle.

When Rerank selects no cited catalog source, TrueLabel does not fail the scan or treat the label as proof. Verify receives an explicit no-match record and returns the affected claims as not established. The evidence ledger tells the user that an external catalog source was not selected.

## Architecture

```text
Browser input
    |
    | POST /api/analyze with browser device ID
    v
Input validation and per-device/IP live-scan limit
    |
    v
Protect -> Guard
    |
    v
Fill -> Rerank -> Extract -> Compare -> Verify + Decide
    |                                       |
    |                                       v
    +------------------------ SSE stage events and normalized result
                                            |
                                            v
Truth spectrum, evidence ledger, comparison panels, SVG badge
```

`lib/pipeline-runner.ts` owns sequencing and normalization. Calls are made sequentially, so a single user job consumes at most one Clocked request at a time. `lib/clocked-client.ts` owns authenticated transport, retry behavior, and idempotency. `lib/content-cache.ts` canonicalizes successful text payloads with sorted JSON keys and SHA-256. Failed or malformed responses are never cached.

## Judge review guide

### Product routes

| Route | Method | Purpose | Review signal |
| --- | --- | --- | --- |
| `/` | `GET` | Product interface | The pipeline inspector exposes every completed stage and the resulting evidence views. |
| `/api/health` | `GET` | Deployment readiness | Returns `hasApiKey`, the real catalog count, and `live-only` mode without exposing a secret. |
| `/api/analyze` | `POST` | Live analysis | Returns ordered SSE events for Guard and Protect, Fill, Rerank, Extract, Compare, Verify and Decide. |

### Clocked request discipline

The server sends Clocked calls only from `app/api/analyze/route.ts` through `lib/clocked-client.ts`. Each outbound request uses `Authorization: Bearer ${CLOCKED_API_KEY}`, `Content-Type: application/json`, and a fresh UUID `Idempotency-Key`. Retryable 429, recoverable 409, and 5xx responses reuse the same payload and idempotency key with bounded jittered backoff. Requests are sequential inside one scan, which keeps a user job at one in-flight Clocked call.

For text, Protect runs before downstream stages and returns a transformed copy. For image labels, Protect can identify personal data but cannot safely transform pixels, so TrueLabel blocks an image with detected identifiers. Guard evaluates sanitized text and each image source before they reach the label pipeline. The browser inspector receives redacted safety summaries rather than raw Protect entity values.

### Original product-plan verification

| Plan requirement | Implementation status |
| --- | --- |
| Next.js App Router with no external database | Complete. The repository is a single App Router project with local optional caching only. |
| Eight meaningful Clocked endpoints | Complete. Every endpoint has a downstream visual or admission-control effect. |
| SSE stage streaming and inspection | Complete. `POST /api/analyze` emits the ordered stage sequence and the interface exposes each result. |
| Live-only operation | Complete. Recorded presets and replay behavior were deliberately removed after the live-only requirement. |
| Safety, PII handling, caching, and rate limits | Complete. The implementation details are documented below and enforced in the route and pipeline. |
| Real cited catalog | Complete. The catalog contains 40 unique source records with valid HTTPS URLs. |
| Product identity and documentation | Complete. The repository includes the original SVG mark and this engineering README. |
| Type checks, tests, and production build | Complete. Run `pnpm lint`, `pnpm test`, and `pnpm build`. |

## Source catalog and provenance

`data/catalog.json` currently contains 47 cited evidence records across supplements, packaged foods, skincare, and regulations. The catalog is retrieval material, not a collection of precomputed conclusions. Clocked selects the applicable records at scan time.

The catalog includes India-focused FSSAI food-labelling, food-additives, and advertising-claims records; ICMR-NIN dietary guidance; CDSCO cosmetics rules; and ASCI truthful-claims and skin-lightening advertising guidance. The ingredient review marks whether an exact disclosed ingredient has an India-focused reference, another cited reference, or no specific catalog match. It never interprets a missing match as evidence that an ingredient is safe or harmful.

If a user provides only a marketing claim or front label, TrueLabel does not present inferred ingredients as back-label facts. It shows a clear request for the ingredient list. In that case, the claim-review flag concerns evidence and disclosure quality only, not whether the product is harmful.

Source priorities are:

1. Government and public-health bodies such as NIH, FDA, FSSAI, WHO, and NCCIH.
2. Primary-indexed clinical evidence through PubMed and PubMed Central.
3. Official brand or manufacturer ingredient disclosures for country-specific comparisons.
4. Established dermatology references for ingredient and contact-allergy context.

Each catalog record includes a stable ID, title, category, publisher, source URL, compact retrieval passage, and tags. New records should preserve that structure, cite a public canonical URL, and state only what the linked source establishes. Do not add marketing copy, uncited social posts, scraped review text, or inferred health claims.

### Adding sources

To broaden the catalog further, provide any of the following and TrueLabel can incorporate them after source review:

- Official front and back ingredient URLs for the same named product in two countries.
- PubMed IDs or stable study URLs for a compound, dose, population, and duration.
- Government or regulator URLs for a label or health-claim rule.
- Official ingredient disclosures for a specific product category or country.
- A precise use case, product name, market, and claim to evaluate.

The most valuable next additions would be dated manufacturer disclosures for India, United States, United Kingdom, and European Union versions of the same products; full supplement facts panels for common categories; and regulator-backed standards for country-specific food and cosmetic claims.

## Local development

### Prerequisites

- Node.js 22 or later
- pnpm 11 or later
- A Clocked API key

### Setup

```bash
pnpm install
cp .env.example .env.local
```

Add the key to `.env.local`:

```text
CLOCKED_API_KEY=your_clocked_api_key
```

Start the application:

```bash
pnpm dev
```

Open `http://localhost:3000`. If the key is missing, the health route reports `hasApiKey: false` and the scan control remains disabled. The application does not substitute a replay or local simulation.

### Verification commands

```bash
pnpm lint
pnpm test
pnpm build
```

## API contract

### `POST /api/analyze`

Request body:

```json
{
  "query": "Product text or marketing claim",
  "personalContext": "Optional allergy, condition, symptom, or ingredient concern",
  "frontImageBase64": "data:image/jpeg;base64,... or null",
  "backImageBase64": "data:image/jpeg;base64,... or null",
  "sensitivities": ["acne", "eczema"],
  "presetId": null,
  "forceLive": true
}
```

The response is a server-sent event stream. Completed stages use `guard_protect`, `fill`, `rerank`, `extract`, `compare`, `verify_decide`, and `complete`. A pipeline failure emits an `error` event with a user-safe message.

### `GET /api/health`

Returns the server health state, API-key availability, catalog size, and the `live-only` mode. It does not expose secret values.

## Security, privacy, and operational limits

- `CLOCKED_API_KEY` is server-only and `.env` files are ignored by Git.
- The server uses a SHA-256 hash of IP address and the browser's durable local device ID to enforce 15 live, uncached scans per hour per instance.
- Text is capped at 15,000 characters. Only PNG, JPEG, and WebP labels are accepted.
- Optional personal context is capped at 1,000 characters. The interface asks users not to enter names, contact details, medical records, or other identifying information.
- Personal context is sent only to the live analysis route for its stated educational label check. Direct identifiers returned by Protect are removed before it reaches Rerank or Decide; self-reported condition language is used only for the requested caution assessment.
- The interface permits two source images. It compresses them client-side to Clocked's aggregate image budget before upload.
- Text that contains detected PII is transformed before later text processing. Image input that appears to contain personal data is blocked because native image analysis cannot safely redact pixels for downstream use. Safety-event payloads expose types and counts, not detected identifier values.
- Cached data is limited to successful, sanitized text-derived responses. Protect requests, optional personal-context requests, and image-derived content are not written to the local disk cache.
- Vercel server filesystems are ephemeral. The in-memory cache and rate limiter are instance-local by design because this project has no external database.

## Repository layout

```text
app/                 App Router pages, global styles, and API routes
components/          Client-side label inspection interface
data/catalog.json    Cited retrieval material
lib/                 Transport, pipeline, cache, rate limit, offsets, and types
public/brand/        TrueLabel SVG brand asset
tests/               Deterministic utility tests
```

## Deployment

Deploy as one Next.js project on Vercel. Add `CLOCKED_API_KEY` as an encrypted server environment variable for the production environment, then deploy normally. No database, user account system, or client-side secret is required.

## Responsible-use note

TrueLabel is an evidence-reading aid. Its caution indicators are not a determination that a product is harmful or safe for any person. It does not diagnose a condition, prescribe treatment, verify product safety, or replace advice from a qualified clinician, pharmacist, dietitian, or other appropriate professional.
