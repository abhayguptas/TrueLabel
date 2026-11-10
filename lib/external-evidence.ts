import type { ReferenceDocument } from "@/lib/types";

export interface ExternalEvidenceResult {
  sources: ReferenceDocument[];
  status: "found" | "none" | "timeout" | "unavailable";
}

function decodeXml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, "\"").replace(/\s+/g, " ").trim();
}

function compactQuery(value: string): string {
  const terms = value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((term) => term.length > 2 && !["ingredients", "claims", "product", "label", "with", "that", "this", "from"].includes(term));
  return [...new Set(terms)].slice(0, 6).join(" OR ");
}

async function limitedFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    return await fetch(url, { signal: controller.signal, headers: { "User-Agent": "TrueLabel/1.0 evidence retrieval" }, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchPubMedEvidence(input: string, category: ReferenceDocument["category"] = "supplement"): Promise<ExternalEvidenceResult> {
  const query = compactQuery(input);
  if (!query) return { sources: [], status: "none" };
  try {
    const params = new URLSearchParams({ db: "pubmed", term: `(${query}) AND (clinical trial[pt] OR review[pt] OR guideline[pt])`, retmax: "3", retmode: "json", tool: "truelabel" });
    if (process.env.NCBI_API_KEY?.trim()) params.set("api_key", process.env.NCBI_API_KEY.trim());
    const search = await limitedFetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params}`);
    if (!search.ok) return { sources: [], status: "unavailable" };
    const payload = await search.json() as { esearchresult?: { idlist?: string[] } };
    const ids = payload.esearchresult?.idlist ?? [];
    if (!ids.length) return { sources: [], status: "none" };
    const recordParams = new URLSearchParams({ db: "pubmed", id: ids.join(","), rettype: "abstract", retmode: "xml", tool: "truelabel" });
    if (process.env.NCBI_API_KEY?.trim()) recordParams.set("api_key", process.env.NCBI_API_KEY.trim());
    const records = await limitedFetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${recordParams}`);
    if (!records.ok) return { sources: [], status: "unavailable" };
    const xml = await records.text();
    const articles = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) ?? [];
    const sources = articles.flatMap((article) => {
      const pmid = article.match(/<PMID[^>]*>([^<]+)<\/PMID>/)?.[1];
      const title = article.match(/<ArticleTitle[^>]*>([\s\S]*?)<\/ArticleTitle>/)?.[1];
      const abstract = [...article.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map((entry) => decodeXml(entry[1])).join(" ");
      if (!pmid || !title || !abstract) return [];
      return [{ id: `pubmed-live-${pmid}`, title: decodeXml(title), category, publisher: "PubMed", sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, text: abstract.slice(0, 1800), tags: ["pubmed", "live search"] }];
    });
    return { sources, status: sources.length ? "found" : "none" };
  } catch (error) {
    return { sources: [], status: error instanceof DOMException && error.name === "AbortError" ? "timeout" : "unavailable" };
  }
}
