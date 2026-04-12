import { TalkMetadata } from "../types/talk";
import { EnrichedResult, SearchResult } from "../types/search";

export function enrichResults(
  raw: SearchResult[],
  map: Map<string, TalkMetadata>
): EnrichedResult[] {
  return raw.map((searchResult) => ({
    searchResult,
    metadata: map.get(searchResult.talk_id) ?? null,
  }));
}
