# Data Model: Search Talks

**Feature**: `specs/001-search-talks`
**Date**: 2026-04-12

---

## New Types (`src/types/search.ts`)

### `SearchResult`

Raw result object returned by the Search API.

```typescript
export interface SearchResult {
  talk_id: string;      // matches TalkMetadata.id in the talks index
  chunk_index: number;  // 0-based paragraph index within the talk
  chunk_text: string;   // the matching passage text
  similarity: number;   // cosine similarity 0–1, higher = more relevant
}
```

### `RelevanceTier`

Qualitative label derived from `similarity`.

```typescript
export type RelevanceTier = 'excellent' | 'strong' | 'good' | 'partial';
```

**Threshold mapping** (see research.md Decision 8):

| Tier | Condition |
|------|-----------|
| `'excellent'` | `similarity >= 0.85` |
| `'strong'` | `0.70 <= similarity < 0.85` |
| `'good'` | `0.55 <= similarity < 0.70` |
| `'partial'` | `similarity < 0.55` |

### `EnrichedResult`

A `SearchResult` joined with the corresponding `TalkMetadata` from the local index.
`metadata` is `null` when no match is found in the index.

```typescript
import { TalkMetadata } from './talk';

export interface EnrichedResult {
  searchResult: SearchResult;
  metadata: TalkMetadata | null;
}
```

### `SearchCacheEntry`

Persisted in `sessionStorage`. The `createdAt` timestamp is used to enforce the 7-day TTL.

```typescript
export interface SearchCacheEntry {
  results: EnrichedResult[];
  createdAt: number; // Unix timestamp ms (Date.now())
}
```

### `SearchStatus`

Discriminated state for the search lifecycle.

```typescript
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';
```

---

## Derived / Utility Functions

### `getRelevanceTier(similarity: number): RelevanceTier`

Location: `src/utils/relevance.ts`

```typescript
export function getRelevanceTier(similarity: number): RelevanceTier {
  if (similarity >= 0.85) return 'excellent';
  if (similarity >= 0.70) return 'strong';
  if (similarity >= 0.55) return 'good';
  return 'partial';
}
```

### `buildMetadataMap(index: TalkMetadata[]): Map<string, TalkMetadata>`

Location: `src/utils/metadataMap.ts`

Converts the flat `TalkMetadata[]` array into an O(1) lookup map keyed by `id`.

```typescript
export function buildMetadataMap(index: TalkMetadata[]): Map<string, TalkMetadata> {
  return new Map(index.map(t => [t.id, t]));
}
```

### `enrichResults(raw: SearchResult[], map: Map<string, TalkMetadata>): EnrichedResult[]`

Location: `src/utils/enrichResults.ts`

Joins raw API results with talk metadata. Missing entries get `metadata: null`.

---

## Cache Schema

**Storage**: `sessionStorage`
**Key format**: `dl_search_v1_${encodeURIComponent(query.trim())}`
**Value format**: `JSON.stringify(SearchCacheEntry)`
**TTL**: 7 days = `604_800_000` ms

---

## Route Extension

### `Route` union (`src/App.tsx`)

Add `"search-talks"` to the existing union:

```typescript
// Before
type Route = "home" | "roadmap" | "talk" | "about";

// After
type Route = "home" | "roadmap" | "talk" | "about" | "search-talks";
```

### `parseLocation()` (`src/App.tsx`)

Add a case before the default `return { route: "home" }`:

```typescript
if (path === "/search-talks") return { route: "search-talks", talkId: null };
```

### URL Sync (`src/App.tsx` useEffect)

The existing URL sync effect must emit `/search-talks` when on that route. The `?q=`
parameter is managed inside `SearchTalksPage` via its own `pushState` call, keeping
App-level routing concerned only with the pathname.

---

## Component Architecture

```
src/
├── pages/
│   └── SearchTalksPage.tsx          # Route container: owns query state, cache I/O,
│                                    # API calls, URL sync for ?q= parameter
├── components/
│   └── search/
│       ├── SearchBar.tsx            # Controlled input, char count, submit
│       ├── SearchResults.tsx        # Renders idle/loading/error/zero/results states
│       ├── SearchResultCard.tsx     # Single result card
│       └── RelevanceIndicator.tsx   # Dot-based tier badge with accessible label
├── api/
│   └── search.ts                    # searchTalks(query, topK): Promise<SearchResult[]>
├── utils/
│   ├── relevance.ts                 # getRelevanceTier()
│   ├── metadataMap.ts               # buildMetadataMap()
│   ├── enrichResults.ts             # enrichResults()
│   └── searchCache.ts               # getCachedResults(), cacheResults(), isCacheValid()
└── types/
    └── search.ts                    # SearchResult, EnrichedResult, SearchCacheEntry,
                                     # RelevanceTier, SearchStatus
```

### Future Extension Point

A `SearchFilters` component can be added as a sibling to `SearchBar` inside
`SearchTalksPage` without modifying any existing component. The filter state lives in
`SearchTalksPage` and is passed as an additional parameter to the `searchTalks()` call.
`SearchResults` and `SearchResultCard` require no changes.

---

## Graceful Fallbacks for Missing Metadata

When `metadata === null` on an `EnrichedResult`:

| Field | Fallback |
|-------|---------|
| `title` | `"Untitled talk"` |
| `speaker` | `"Unknown teacher"` |
| `duration` | Omitted (the element is not rendered) |
| `summary` | Omitted |
| `audioUrl` | "Open" button still navigates to `/talk/${talk_id}` |
