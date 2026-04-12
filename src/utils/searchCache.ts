import { EnrichedResult, SearchCacheEntry } from "../types/search";

export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cacheKey(query: string): string {
  return `dl_search_v1_${encodeURIComponent(query.trim())}`;
}

export function getCachedResults(query: string): EnrichedResult[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(query));
    if (!raw) return null;
    const entry = JSON.parse(raw) as SearchCacheEntry;
    if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(cacheKey(query));
      return null;
    }
    return entry.results;
  } catch {
    return null;
  }
}

export function cacheResults(query: string, results: EnrichedResult[]): void {
  try {
    const entry: SearchCacheEntry = { results, createdAt: Date.now() };
    sessionStorage.setItem(cacheKey(query), JSON.stringify(entry));
  } catch {
    // sessionStorage unavailable — silently skip caching
  }
}
