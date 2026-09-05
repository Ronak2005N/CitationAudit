import type { OpenAlexWork, Paper, Reference } from "./types";

const BASE_URL = "https://api.openalex.org";
const API_KEY = process.env.OPENALEX_API_KEY;

function reconstructAbstract(invertedIndex: Record<string, number[]> | null): string {
  if (!invertedIndex) return "";
  const wordPositions: Array<[number, string]> = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordPositions.push([pos, word]);
    }
  }
  wordPositions.sort((a, b) => a[0] - b[0]);
  return wordPositions.map(([, word]) => word).join(" ");
}

function transformWork(work: OpenAlexWork): Paper {
  return {
    id: work.id,
    openalexId: work.id.replace("https://openalex.org/", ""),
    doi: work.doi?.replace("https://doi.org/", "") ?? null,
    title: work.title ?? "Untitled",
    authors: (work.authorships ?? []).map((a) => a.author.display_name),
    year: work.publication_year ?? null,
    abstract: reconstructAbstract(work.abstract_inverted_index),
    citationCount: work.cited_by_count ?? 0,
    referenceCount: work.referenced_works?.length ?? 0,
    isOpenAccess: work.open_access?.is_oa ?? false,
    oaUrl: work.open_access?.oa_url ?? null,
    venue: work.primary_location?.source?.display_name ?? null,
  };
}

function transformReference(work: OpenAlexWork): Reference {
  return {
    id: work.id,
    openalexId: work.id.replace("https://openalex.org/", ""),
    doi: work.doi?.replace("https://doi.org/", "") ?? null,
    title: work.title ?? "Untitled",
    authors: (work.authorships ?? []).map((a) => a.author.display_name),
    year: work.publication_year ?? null,
    citationCount: work.cited_by_count ?? 0,
  };
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") ?? "5");
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error("Max retries exceeded");
}

function cleanDOI(input: string): string {
  let doi = input.trim();
  doi = doi.replace(/^https?:\/\/doi\.org\//, "");
  doi = doi.replace(/^https?:\/\/[^/]+\/api\/papers\//, "");
  doi = doi.replace(/^https?:\/\/[^/]+\//, "");
  return doi;
}

export async function getPaperByDOI(doi: string): Promise<{ paper: Paper; references: Reference[] }> {
  const cleanDoi = cleanDOI(doi);

  const paperUrl = `${BASE_URL}/works/doi:${cleanDoi}${API_KEY ? `?api_key=${API_KEY}` : ""}`;
  const paperRes = await fetchWithRetry(paperUrl);
  const paperData: OpenAlexWork = await paperRes.json();
  const paper = transformWork(paperData);

  const referencedWorkIds = (paperData.referenced_works ?? [])
    .map((url) => url.replace("https://openalex.org/", ""))
    .filter(Boolean);

  if (referencedWorkIds.length === 0) {
    return { paper, references: [] };
  }

  const references: Reference[] = [];
  const batchSize = 100;

  for (let i = 0; i < referencedWorkIds.length; i += batchSize) {
    const batch = referencedWorkIds.slice(i, i + batchSize);
    const filter = `ids.openalex:${batch.join("|")}`;
    const batchUrl = `${BASE_URL}/works?filter=${filter}&per_page=100${API_KEY ? `&api_key=${API_KEY}` : ""}`;
    const batchRes = await fetchWithRetry(batchUrl);
    const batchData = await batchRes.json();

    for (const work of batchData.results ?? []) {
      references.push(transformReference(work));
    }
  }

  return { paper, references };
}

export async function getWorksByDOIs(dois: string[]): Promise<Reference[]> {
  if (dois.length === 0) return [];

  const results: Reference[] = [];
  const batchSize = 50;

  for (let i = 0; i < dois.length; i += batchSize) {
    const batch = dois.slice(i, i + batchSize);
    const filter = `doi:${batch.join("|")}`;
    const url = `${BASE_URL}/works?filter=${filter}&per_page=50${API_KEY ? `&api_key=${API_KEY}` : ""}`;
    const res = await fetchWithRetry(url);
    const data = await res.json();

    for (const work of data.results ?? []) {
      results.push(transformReference(work));
    }
  }

  return results;
}
