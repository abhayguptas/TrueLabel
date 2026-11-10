# TrueLabel

TrueLabel is a live product-label evidence reader for supplements, packaged foods, and skincare. It turns a pasted label or front and back label photos into an inspectable record of claims, ingredients, comparison findings, source evidence, and optional personal sensitivity cautions.

Every scan is live. TrueLabel has no replay mode, fixtures, synthetic findings, or simulated Clocked responses.

## Run locally

1. Create `.env.local` from `.env.example`.
2. Add a valid Clocked API key.
3. Install and run the app.

```bash
pnpm install
pnpm dev
```

```text
CLOCKED_API_KEY=your_key_here
```

Open `http://localhost:3000`. The interface remains locked until the server can read `CLOCKED_API_KEY`.

## What a scan does

1. Guard checks submitted product content for instruction injection.
2. Protect redacts pasted personal information before later text analysis and blocks label images that contain detected personal data.
3. Fill structures label claims, ingredients, product dose, and product category.
4. Rerank selects relevant evidence from the local catalog of real source links.
5. Extract returns exact ingredient and dose reads. Text offsets are sliced by Unicode code point.
6. Compare checks label claims, ingredients, and selected source clauses for direct conflicts.
7. Verify checks each returned marketing claim against the selected evidence.
8. Decide evaluates the user-selected sensitivity profiles against extracted ingredients.

Each endpoint output has a visible consequence in the interface. The stage inspector exposes the returned endpoint summaries, the truth spectrum visualizes Verify outcomes, and the evidence ledger links source records.

## Source catalog

`data/catalog.json` contains cited product, clinical, dermatology, regulatory, and nutrition references from sources including PubMed, NIH, FDA, FSSAI, WHO, DermNet, American Academy of Dermatology, and official product pages. It is a retrieval catalog, not a stored analysis result. Live Clocked calls determine which records are relevant to a scan.

## Safety and limits

- API keys stay on the server and are never sent to the browser.
- A live custom scan is limited to 15 requests per IP and browser device ID each hour, using in-memory instance state.
- Text is limited to 15,000 characters.
- The interface accepts a front and back label in PNG, JPEG, or WebP. Source files may be up to 4 MB each and are compressed client-side to Clocked's aggregate image budget.
- Successful text endpoint responses use a canonical SHA-256 cache. Failed responses are never cached. Image-derived content is not written to disk.
- The app is educational. It does not diagnose conditions, prescribe treatment, or replace advice from a qualified clinician.

## Deployment

Deploy as a single Next.js application on Vercel and add `CLOCKED_API_KEY` as an encrypted project environment variable. Vercel function filesystems are ephemeral, so the optional on-disk cache is a local-development optimization; memory caching remains available per active instance.
