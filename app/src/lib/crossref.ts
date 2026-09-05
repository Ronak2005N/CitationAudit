import type { RetractionResult, CrossrefWork } from "./types";

const BASE_URL = "https://api.crossref.org";
const EMAIL = process.env.CROSSREF_EMAIL;

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") ?? "3");
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function checkRetraction(doi: string): Promise<RetractionResult> {
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, "");
  const url = `${BASE_URL}/v1/works/${cleanDoi}?mailto=${EMAIL}`;

  try {
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      return {
        doi: cleanDoi,
        isRetracted: false,
        retractionDate: null,
        retractionTimestamp: null,
        reason: null,
        source: null,
      };
    }

    const data: CrossrefWork = await response.json();
    const updateTo = data.message?.["update-to"];

    if (updateTo && Array.isArray(updateTo)) {
      const retraction = updateTo.find((u) => u.type === "retraction");
      if (retraction) {
        const reason =
          retraction.assertion?.find((a) => a.label === "retraction")?.explanation ?? null;

        return {
          doi: cleanDoi,
          isRetracted: true,
          retractionDate: retraction.created?.["date-time"] ?? null,
          retractionTimestamp: retraction.created?.timestamp ?? null,
          reason,
          source: retraction.source ?? null,
        };
      }
    }

    return {
      doi: cleanDoi,
      isRetracted: false,
      retractionDate: null,
      retractionTimestamp: null,
      reason: null,
      source: null,
    };
  } catch {
    return {
      doi: cleanDoi,
      isRetracted: false,
      retractionDate: null,
      retractionTimestamp: null,
      reason: null,
      source: null,
    };
  }
}

export async function checkRetractions(dois: string[]): Promise<RetractionResult[]> {
  const results: RetractionResult[] = [];
  const concurrency = 5;

  for (let i = 0; i < dois.length; i += concurrency) {
    const batch = dois.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((doi) => checkRetraction(doi)));
    results.push(...batchResults);
  }

  return results;
}
