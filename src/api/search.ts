import { SearchResult } from "../types/search";

const SEARCH_ENDPOINT =
  import.meta.env.DEV
    ? "/api/search"
    : "https://05yjv01mbk.execute-api.us-east-1.amazonaws.com/search";
const API_KEY = "dharma-library-link";

export class SearchError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "SearchError";
  }
}

export async function searchTalks(
  query: string,
  topK = 10,
  filter?: Record<string, unknown>
): Promise<SearchResult[]> {
  let response: Response;
  try {
    response = await fetch(SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
      },
      body: JSON.stringify({ query, top_k: topK, ...(filter ? { filter } : {}) }),
    });
  } catch {
    throw new SearchError("Unable to reach the search service. Check your connection.");
  }

  if (response.status === 429) {
    throw new SearchError(
      "Too many requests — please wait a moment and try again.",
      429
    );
  }

  if (!response.ok) {
    let errorMessage = `Search failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) errorMessage = body.error;
    } catch {
      // non-JSON body — use the default message
    }
    throw new SearchError(errorMessage, response.status);
  }

  const data = (await response.json()) as { results: SearchResult[] };
  return data.results;
}
