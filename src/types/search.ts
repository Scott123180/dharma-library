import { TalkMetadata } from "./talk";

export interface SearchResult {
  talk_id: string;
  chunk_index?: number; // absent in v2 API responses
  chunk_text: string;
  similarity: number;
}

export interface SearchFilters {
  speaker: string;
  location: string;
  yearFrom: string;
  yearTo: string;
}

export const DEFAULT_FILTERS: SearchFilters = {
  speaker: "",
  location: "",
  yearFrom: "",
  yearTo: "",
};

export function hasActiveFilters(filters: SearchFilters): boolean {
  return !!(filters.speaker || filters.location || filters.yearFrom || filters.yearTo);
}

export interface EnrichedResult {
  searchResult: SearchResult;
  metadata: TalkMetadata | null;
}

export type RelevanceTier = "excellent" | "strong" | "good" | "partial";

export interface SearchCacheEntry {
  results: EnrichedResult[];
  createdAt: number;
}

export type SearchStatus = "idle" | "loading" | "success" | "error";
