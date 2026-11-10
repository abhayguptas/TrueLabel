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

1. It screens untrusted label content for instruction injection and personal information.
2. It extracts the stated claims, ingredients, product dose, and category directly from text or label images.
3. It reranks a curated catalog of primary, regulatory, dermatology, and official manufacturer references.
4. It compares concise label clauses with selected evidence instead of treating a long document as a single claim.
5. It verifies each claim, presents supporting or conflicting passages, and displays the outcome in a connected evidence graph.
6. It evaluates selected sensitivity profiles against extracted ingredients as an educational caution, never as a diagnosis.

## Product capabilities

| Area | Behavior |
| --- | --- |
| Product intake | Paste up to 15,000 characters or upload one front and one back label image. |
| Live analysis | All eight Clocked calls run server-side with a real API key. |
| Evidence selection | Rerank determines which catalog references reach later stages. |
| Label comparison | Compare identifies direct conflicts, duplication, and regional formulation differences. |
| Claim verification | Verify returns claim-level evidence and drives the truth-spectrum status colors. |
| Personal context | Decide scores only the sensitivity filters the user selects. |
| Export | A completed scan can produce a standalone SVG truth badge and Markdown embed text. |

## Clocked integration

The route at `POST /api/analyze` streams stage results as `text/event-stream`. It uses all eight endpoints deliberately rather than treating them as a generic completion API.

| Stage | Endpoint | Product consequence |
| --- | --- | --- |
| Input safety | `/clocked/injection` | Blocks label content that tries to redirect the analysis workflow. |
| Privacy | `/clocked/pii` | Redacts personal data in text before downstream processing and blocks images with detected personal data. |
| Label structure | `/clocked/fill` | Supplies the product claims, category, ingredients, and dose shown in the interface. |
| Source selection | `/clocked/rerank` | Selects or expands catalog records; rejected records remain visible as lower-ranked evidence. |
| Exact reads | `/clocked/extract` | Supplies verbatim ingredient and dose reads plus Unicode-safe text offsets. |
| Cross-source review | `/clocked/compare` | Supplies direct conflict and overlap cards. |
| Claim verification | `/clocked/grounding` | Supplies the status and evidence used by the ledger and SVG truth spectrum. |
| Personal caution | `/clocked/decide` | Supplies the selected sensitivity probabilities and trigger explanations. |

The HTTP client generates a UUID idempotency key for every logical request. Retries reuse the same payload and key for transient failures. API keys are read only on the server and are never returned in an event payload or client bundle.

## Architecture

```text
Browser input
    |
    | POST /api/analyze with browser device ID
    v
Input validation and per-device/IP live-scan limit
    |
    v
Guard + Protect
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

## Source catalog and provenance

`data/catalog.json` currently contains 40 cited evidence records across supplements, packaged foods, skincare, and regulations. The catalog is retrieval material, not a collection of precomputed conclusions. Clocked selects the applicable records at scan time.

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
- The interface permits two source images. It compresses them client-side to Clocked's aggregate image budget before upload.
- Text that contains detected PII is transformed before later text processing. Image input that appears to contain personal data is blocked because native image analysis cannot safely redact pixels for downstream use.
- Cached data is limited to successful text-derived responses. Image-derived content is not written to the local disk cache.
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

TrueLabel is an evidence-reading aid. It does not diagnose a condition, prescribe treatment, verify product safety, or replace advice from a qualified clinician, pharmacist, dietitian, or other appropriate professional.
