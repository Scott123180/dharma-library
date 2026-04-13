import { EnrichedResult, SearchCacheEntry } from "../types/search";

export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function cacheKey(query: string, filter?: Record<string, unknown>): string {
  const filterPart = filter ? encodeURIComponent(JSON.stringify(filter)) : "";
  return `dl_search_v2_${encodeURIComponent(query.trim())}_${filterPart}`;
}

export function getCachedResults(query: string, filter?: Record<string, unknown>): EnrichedResult[] | null {
  try {
    const key = cacheKey(query, filter);
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as SearchCacheEntry;
    if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.results;
  } catch {
    return null;
  }
}

export function cacheResults(query: string, results: EnrichedResult[], filter?: Record<string, unknown>): void {
  try {
    const entry: SearchCacheEntry = { results, createdAt: Date.now() };
    sessionStorage.setItem(cacheKey(query, filter), JSON.stringify(entry));
  } catch {
    // sessionStorage unavailable — silently skip caching
  }
}
