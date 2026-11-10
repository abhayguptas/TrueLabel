# TrueLabel Launch & Social Promotion Package

## 1. Flagship LinkedIn & X Launch Post

That loaf of “100% Whole Wheat Brown Bread” on your counter? Flip it over—the first ingredient is often 50% refined white flour (*Maida*) dyed with caramel color.

A viral supplement promising an “80% cortisol drop in 14 days”? The cited study was done on 12 rodents, and the human dose required is 10 times higher than the gummy inside the bottle.

A snack from a global brand? Sunflower oil in the US or Europe, but cheap palm oil and extra sugar in India.

This gap between front-panel marketing and back-label reality is everywhere we shop. The information exists, but it’s scattered across chemical disclosures, PubMed trials, and regulator filings.

We built **TrueLabel** for the #ClockedChallenge with @Clocked.

TrueLabel is a zero-login consumer truth engine. Paste a claim, drop a product link, or upload front and back label photos. Select a health sensitivity or type your personal context (like *"high blood pressure, and digestion problem"* or *"fungal acne"*), and in seconds TrueLabel cross-examines the packaging against real clinical and ingredient databases:

- 📊 **Instant AI Executive Truth Verdict**: A 5-second plain-English answer on top with a calibrated Truth Score (`10/100 Discrepancy Detected` or `92/100 Verified Formulation`) and 3 clear takeaway cards.
- 🔬 **Multi-Source Real-Time Evidence**: Back-label packaging facts serve as primary ground truth, cross-referenced live with Wikipedia REST science summaries, PubMed clinical trials, and FSSAI/FDA regulations. Zero hardcoded results.
- ⚖️ **Front vs. Back Contradiction Detector**: Clocked Compare (`/clocked/compare`) catches direct lies (e.g., claiming Olive Oil on the front while using 100% Palm Oil on the back).
- 🛡️ **Personal Health & Allergy Guard**: Clocked Decide (`/clocked/decide`) evaluates disclosed ingredients against your stated health profile (flagging hidden sodium and MSG INS 621 for blood pressure, or maida and synthetic preservatives for digestive sensitivities).
- 🕸️ **Interactive SVG Truth Spectrum**: Bezier curves visually map Claims ➔ Ingredients ➔ PubMed Clinical Trials.
- 📄 **Downloadable Official Audit Dossier**: One click exports a print-ready HTML/PDF audit dossier complete with verification stamps and legal disclaimers.

🔗 **Live Demo**: [Vercel Deployment Link]  
💻 **Open-Source Code**: https://github.com/abhayguptas/TrueLabel  
🎥 **Full Video Walkthrough**: [YouTube / Demo Video Link]

👇 **Try It on Your Shelf**: Drop the name of one packaged food, supplement, or face cream sitting in your kitchen or bathroom in the comments. I’ll run it through TrueLabel live and reply with its full Truth Score and ingredient breakdown. 

Repost this to help your family and friends see past deceptive marketing claims! 🌿

Built with @Clocked #ClockedChallenge #AI #Nextjs #ConsumerHealth #OpenSource

---

## 2. 45-Second Native Demo Video Script

| Timestamp | Visual / Screen Recording | Voiceover / On-Screen Caption |
| :--- | :--- | :--- |
| **0s – 6s** | Fast cut: Front of bread pack ("100% Whole Wheat") vs. Back ingredient list ("Refined Flour Maida 50%"). Open TrueLabel interface. | *“Front packaging makes bold promises. But what’s actually inside the product? We built TrueLabel to find the truth in seconds.”* |
| **6s – 14s** | Drop front and back photos of Nature's Crunch Whole Wheat Chips into the scanner. In Personal Context, type *"high blood pressure, and digestion problem"*. Tap **Run live label scan**. | *“Drop two photos—front claims and back ingredients. Add your personal health concerns—no signup, no personal medical data required.”* |
| **14s – 23s** | Show the live Clocked Pipeline stepper lighting up sequentially: Guard & Protect ➔ Fill ➔ Rerank ➔ Extract ➔ Compare ➔ Verify & Decide. | *“Under the hood, Clocked runs an 8-endpoint live pipeline: reading label facts, reranking PubMed clinical trials, and comparing front claims against back reality in real time.”* |
| **23s – 33s** | **The Executive Verdict Banner loads**: Big red `10/100 DISCREPANCY DETECTED` score. Highlight the AI Truth Headline: *"Severe Marketing Discrepancy: Claims 'Made from Whole Wheat' and 'Extra Virgin Olive Oil' conflict with back label."* | *“Immediately, you get the executive verdict: 10 out of 100. Disclosed oil is 100% Palm Oil, and flour is 100% Maida. Plus, personal health flags 180mg Sodium and MSG for blood pressure.”* |
| **33s – 40s** | Click **View Detailed Full Audit Report**. The screen smoothly expands to reveal the interactive SVG Truth Spectrum with red pulsing contradiction curves and the sentence-by-sentence check table. | *“One click opens the complete audit: an interactive SVG Truth Spectrum connecting claims to ingredients to scientific literature.”* |
| **40s – 45s** | Click **Download Official Audit Report (HTML)**. The standalone dossier opens ready to print or save to PDF with the TrueLabel verification seal. | *“Download a print-ready audit dossier with one click. TrueLabel: read the label behind the claim.”* |

---

## 3. First Comment: Technical Architecture & Rubric Alignment

> **For fellow engineers and judges checking out the technical implementation:**
> 
> TrueLabel is built with Next.js 15 App Router, TypeScript, and Tailwind CSS, communicating with Clocked via a streaming `POST /api/analyze` route over Server-Sent Events (SSE).
> 
> Here is how we hit the Clocked Build Challenge rubric:
> 1. **Core Track: Best Use of Verify, Compare, or Rerank ($400)**: We use all three in a unified evidence chain. `/clocked/rerank` filters dozens of live candidate passages across PubMed and Wikipedia; `/clocked/compare` extracts direct contradictions between claims and ingredients; `/clocked/grounding` evaluates each claim sentence-by-sentence with verbatim evidence quotes and Unicode-safe code point offsets (`Array.from`).
> 2. **Best Overall App ($600)**: Features multi-modal vision extraction (`/clocked/fill`), prompt injection shielding (`/clocked/injection`), visual PII redaction (`/clocked/pii`), verbatim dosage extraction (`/clocked/extract`), and calibrated personal health risk scoring (`/clocked/decide`).
> 3. **Zero Hardcoding**: Packaging facts act as Document #1, dynamically augmented with live Wikipedia REST summaries, PubMed E-Utilities, and DuckDuckGo Lite search queries.
> 4. **Progressive Disclosure UX**: Instant 5-second Executive AI Verdict on top + expandable deep-dive dossier + standalone downloadable HTML/PDF reports.
> 
> Check out the complete source code and test suite (11/11 passing tests) on GitHub: https://github.com/abhayguptas/TrueLabel #ClockedChallenge

---

## 4. November 11 to 17 Community & Voting Playbook

1. **Submission Verification**:
   - Ensure the Vercel production deployment has `CLOCKED_API_KEY` active.
   - Test all 4 one-click demo presets ("Brown Bread", "Minimalist Face Cream", "Shilajit Booster", "Pringles India vs US") to ensure zero judge friction.
   - Verify the downloadable HTML/PDF report renders cleanly across browsers.
2. **Community Sharing (When Voting Opens)**:
   - Share the live demo and GitHub repository with developer, health-tech, nutrition, and open-source AI communities on Reddit (r/webdev, r/reactjs, r/SideProject), Hacker News ("Show HN: TrueLabel"), and Discord.
   - Focus on the real consumer problem (misleading bread and snack packaging) and open-source architecture.
3. **Interactive Comment Inquiries**:
   - Invite users to reply with specific supermarket products. Run them live through TrueLabel and share the Truth Score and downloaded audit summary in replies.
   - Always include the educational disclaimer: TrueLabel cross-examines packaging claims against scientific literature and does not substitute for clinical medical advice.
