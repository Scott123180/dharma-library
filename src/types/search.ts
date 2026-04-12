import { TalkMetadata } from "./talk";

export interface SearchResult {
  talk_id: string;
  chunk_index: number;
  chunk_text: string;
  similarity: number;
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
