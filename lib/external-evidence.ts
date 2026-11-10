import type { ReferenceDocument } from "@/lib/types";

export interface ExternalEvidenceResult {
  sources: ReferenceDocument[];
  status: "found" | "none" | "timeout" | "unavailable";
}

function decodeXml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

async function limitedFetch(url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store"
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Real-time Wikipedia Knowledge API: Fetches concise, peer-reviewed scientific / ingredient definitions
 * Works for any compound: Panthenol, Maida, Rice bran oil, Shilajit, Niacinamide, Maltodextrin, etc.
 */
export async function fetchWikipediaSummary(term: string, category: ReferenceDocument["category"] = "skincare"): Promise<ReferenceDocument | null> {
  const cleanTerm = term.trim().replace(/^refined\s+/i, "").replace(/\[.*?\]/g, "").trim();
  if (cleanTerm.length < 3) return null;

  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTerm.replace(/\s+/g, "_"))}`;
    const res = await limitedFetch(url, {
      headers: { "User-Agent": "TrueLabel/1.0 (https://truelabel.ai; contact@truelabel.ai)" }
    }, 2800);

    if (res.ok) {
      const data = await res.json() as { title?: string; extract?: string; content_urls?: { desktop?: { page?: string } } };
      if (data.extract && data.extract.length > 30) {
        return {
          id: `wiki-${cleanTerm.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          title: `${data.title || cleanTerm} (Scientific Profile)`,
          category,
          publisher: "Wikipedia / Scientific Reference",
          sourceUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTerm)}`,
          text: data.extract.slice(0, 1200),
          tags: [cleanTerm.toLowerCase(), "scientific reference", "ingredient breakdown"]
        };
      }
    }

    // Fallback: search Wikipedia for the closest article
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTerm)}&utf8=&format=json`;
    const searchRes = await limitedFetch(searchUrl, {
      headers: { "User-Agent": "TrueLabel/1.0 (https://truelabel.ai; contact@truelabel.ai)" }
    }, 2800);

    if (searchRes.ok) {
      const searchData = await searchRes.json() as { query?: { search?: Array<{ title: string; snippet: string }> } };
      const firstHit = searchData.query?.search?.[0];
      if (firstHit && firstHit.snippet) {
        const snippetText = decodeXml(firstHit.snippet);
        return {
          id: `wiki-search-${cleanTerm.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          title: `${firstHit.title} (Scientific Reference)`,
          category,
          publisher: "Wikipedia / Scientific Reference",
          sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(firstHit.title.replace(/\s+/g, "_"))}`,
          text: `${firstHit.title}: ${snippetText}`,
          tags: [cleanTerm.toLowerCase(), firstHit.title.toLowerCase(), "search result"]
        };
      }
    }
  } catch {
    // Timeout or network glitch
  }
  return null;
}

/**
 * Real-time Web Search Scraper (DuckDuckGo Lite)
 * Scrapes organic web search snippets for product marketing claims or formulation comparisons
 */
export async function scrapeWebEvidence(query: string, category: ReferenceDocument["category"] = "food"): Promise<ReferenceDocument[]> {
  const cleanQuery = query.trim().slice(0, 150);
  if (cleanQuery.length < 5) return [];

  try {
    const res = await limitedFetch("https://lite.duckduckgo.com/lite/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      body: new URLSearchParams({ q: cleanQuery })
    }, 3800);

    if (!res.ok) return [];
    const html = await res.text();
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
    const docs: ReferenceDocument[] = [];

    for (const r of rows) {
      const rowHtml = r[1];
      if (!rowHtml.includes("result-snippet")) continue;
      const text = decodeXml(rowHtml);
      // Filter out empty or sponsored-only snippets
      if (text.length > 50 && !text.includes("Free 2-day Shipping") && !text.includes("Shop Now")) {
        const linkMatch = rowHtml.match(/href="([^"]+)"/);
        const url = linkMatch ? linkMatch[1] : "https://duckduckgo.com";
        docs.push({
          id: `web-scrape-${docs.length + 1}`,
          title: `Web Evidence: ${cleanQuery.slice(0, 45)}...`,
          category,
          publisher: "Web Research / Consumer Reports",
          sourceUrl: url.startsWith("http") ? url : `https://duckduckgo.com${url}`,
          text: text.slice(0, 900),
          tags: ["web search", "real-time research", category]
        });
        if (docs.length >= 3) break;
      }
    }
    return docs;
  } catch {
    return [];
  }
}

/**
 * Real-time PubMed E-Utilities Search
 * Searches biomedical literature for active compounds and clinical trials
 */
export async function searchPubMedEvidence(input: string, category: ReferenceDocument["category"] = "supplement"): Promise<ExternalEvidenceResult> {
  const terms = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 3 && !["ingredients", "claims", "product", "label", "with", "that", "this", "from", "need", "daily"].includes(term));

  const uniqueTerms = [...new Set(terms)].slice(0, 4);
  if (!uniqueTerms.length) return { sources: [], status: "none" };

  try {
    // First try targeted query
    let query = uniqueTerms.join(" AND ");
    let params = new URLSearchParams({ db: "pubmed", term: query, retmax: "3", retmode: "json", tool: "truelabel" });
    if (process.env.NCBI_API_KEY?.trim()) params.set("api_key", process.env.NCBI_API_KEY.trim());

    let search = await limitedFetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`, {}, 3200);
    let payload = search.ok ? (await search.json() as { esearchresult?: { idlist?: string[] } }) : null;
    let ids = payload?.esearchresult?.idlist ?? [];

    // Fallback: try OR query if AND returned 0 results
    if (!ids.length && uniqueTerms.length > 1) {
      query = uniqueTerms.slice(0, 2).join(" OR ");
      params = new URLSearchParams({ db: "pubmed", term: query, retmax: "3", retmode: "json", tool: "truelabel" });
      if (process.env.NCBI_API_KEY?.trim()) params.set("api_key", process.env.NCBI_API_KEY.trim());
      search = await limitedFetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`, {}, 3200);
      payload = search.ok ? (await search.json() as { esearchresult?: { idlist?: string[] } }) : null;
      ids = payload?.esearchresult?.idlist ?? [];
    }

    if (!ids.length) return { sources: [], status: "none" };

    const recordParams = new URLSearchParams({ db: "pubmed", id: ids.join(","), rettype: "abstract", retmode: "xml", tool: "truelabel" });
    if (process.env.NCBI_API_KEY?.trim()) recordParams.set("api_key", process.env.NCBI_API_KEY.trim());
    const records = await limitedFetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${recordParams}`, {}, 3500);
    if (!records.ok) return { sources: [], status: "unavailable" };
    const xml = await records.text();
    const articles = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) ?? [];
    const sources = articles.flatMap((article) => {
      const pmid = article.match(/<PMID[^>]*>([^<]+)<\/PMID>/)?.[1];
      const title = article.match(/<ArticleTitle[^>]*>([\s\S]*?)<\/ArticleTitle>/)?.[1];
      const abstract = [...article.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map((entry) => decodeXml(entry[1])).join(" ");
      if (!pmid || !title || !abstract) return [];
      return [{
        id: `pubmed-live-${pmid}`,
        title: decodeXml(title),
        category,
        publisher: "PubMed / NIH",
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        text: abstract.slice(0, 1800),
        tags: ["pubmed", "clinical trial", "peer reviewed"]
      }];
    });

    return { sources, status: sources.length ? "found" : "none" };
  } catch (error) {
    return { sources: [], status: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "unavailable" };
  }
}
