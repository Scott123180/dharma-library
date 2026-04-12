# Research: Search Talks

**Feature**: `specs/001-search-talks`
**Date**: 2026-04-12

---

## Decision 1 — Text Fragments: Runtime Detection Method

**Decision**: Detect Text Fragments support via `'fragmentDirective' in document` at component
mount. Store the boolean result in a module-level constant so the check runs once.

**Rationale**: This is the canonical detection idiom. `document.fragmentDirective` is a
`FragmentDirective` object in supporting browsers (Chrome 80+, Edge 80+, Opera 67+) and
`undefined` in non-supporting ones (Firefox, Safari as of mid-2025). The check is synchronous
and costs nothing.

**Alternatives considered**:
- User-agent string sniffing — brittle, banned by Principle III (clean code).
- Try/catch on a test fragment URL — asynchronous, adds complexity with no benefit.

---

## Decision 2 — Duplicate Talk Handling in Results

**Decision**: Display every chunk result as its own independent card, even if multiple chunks
originate from the same talk. No deduplication or grouping in the initial version.

**Rationale**: Each matching passage addresses a potentially distinct aspect of the query.
Collapsing duplicates hides relevant content. Semantic search tools (Perplexity, Kagi,
Typesense) universally show per-chunk results. A "N more passages from this talk" affordance
can be added in a future iteration if users find duplicate cards confusing.

**Alternatives considered**:
- Group by talk, show best chunk per talk — loses high-relevance secondary passages.
- Show all, but collapse duplicates under a toggle — adds significant complexity for v1.

---

## Decision 3 — sessionStorage Cache Schema & Fallback

**Decision**: Cache key format: `dl_search_v1_${encodeURIComponent(query.trim())}`.
Cache value: `JSON.stringify({ results: EnrichedResult[], createdAt: number })`.
TTL: 7 days (`7 * 24 * 60 * 60 * 1000` ms). If `sessionStorage` is unavailable or throws
(quota exceeded, private browsing restriction), catch the error silently and skip the cache
— the app continues to function by always calling the API.

**Rationale**: sessionStorage persists across page reloads within the same browser session
but not across tabs, which is appropriate for a search UX. The `v1` version token in the
key allows a future schema change to invalidate all old entries by bumping the version.

**Alternatives considered**:
- In-memory (Map): lost on reload, defeating the bookmarking use case.
- localStorage: persists across sessions/tabs; fine technically, but 7-day TTL means the
  store could grow stale across device restarts. sessionStorage auto-clears on tab close,
  which is a natural GC mechanism.
- IndexedDB: overkill for this use case; no structured data advantages at this volume.

---

## Decision 4 — Talk ID → Metadata Lookup Strategy

**Decision**: Use a `Map<string, TalkMetadata>` built from the loaded talks index at search
time (or passed in as a prop). Lookup by exact string equality on `talk_id` vs
`TalkMetadata.id`.

**Rationale**: The app already loads the full `TalkMetadata[]` index on startup. An
`Array.find()` over ~6,300 entries is fast (~0.1ms), but a pre-built `Map` is O(1) and
semantically clearer. The search results page can build this map once when the index is
available.

**Alternatives considered**:
- `Array.find()` on every enrichment call — correct but linear; unnecessary given the Map
  option is trivial to implement.
- Fetching individual talk metadata per search result — 10 extra API calls per search;
  violates the two-tier data model and the lightweight JS principle.

**Edge case**: If `talk_id` from the search API has no match in the local index (e.g., the
talk was indexed for search but not yet in the talk catalog), the `EnrichedResult` receives
`metadata: null` and the card renders with graceful fallbacks (title: "Untitled talk",
speaker: "Unknown teacher", duration: omitted).

---

## Decision 5 — URL + Query Parameter Routing Integration

**Decision**: Add `"search-talks"` as a new member of the `Route` union in `App.tsx`.
`parseLocation()` matches `/search-talks` and returns the new route. The URL sync
`useEffect` writes `/search-talks` (no `?q=` param) when the query is empty, and
`/search-talks?q=<encoded-query>` when a query is active. The `SearchTalksPage` reads
`window.location.search` on mount for the initial query. Subsequent searches update the
URL via `window.history.pushState` without triggering a full re-render of `App`.

**Rationale**: Consistent with the existing pushState/popstate routing pattern. The query
string is a UI concern of `SearchTalksPage`, not of `App` — keeping the `?q=` parameter
management inside the page component respects SOLID's Single Responsibility principle.

**Alternatives considered**:
- Passing query state up to `App` — couples routing to search state; every query change
  would ripple through the App re-render tree.
- A router library — violates the Tech Stack Constraints in the constitution.

---

## Decision 6 — Search Debounce / Submission Model

**Decision**: Search triggers on explicit submit (Enter key or button click), not on input
change. No debounce needed.

**Rationale**: The API enforces a 2 req/s sustained rate limit. Search-as-you-type would
burn through this for every keystroke. Explicit submit is also more appropriate for
semantic/natural-language queries (users compose a thought, then search), unlike
autocomplete-style keyword search where instant feedback is expected.

**Note from handoff doc**: The handoff doc recommends a 300–500ms debounce only if
search-as-you-type is implemented. Since we are not, this is moot.

---

## Decision 7 — Nav Placement for "Search Talks"

**Decision**: Add a "Search" nav link to the `Header` component, positioned between
"Home" and "Roadmap" in the navigation order.

**Rationale**: Search is a primary action on par with browsing — it deserves top-level
nav visibility, not a secondary entry point. Placing it second (after Home) mirrors
conventional search-centric apps where search is the second most prominent entry point.

---

## Decision 8 — Relevance Tier Thresholds

**Decision**: Use the thresholds defined in FR-007 of the spec:

| Tier | Similarity range | Visual units |
|------|-----------------|--------------|
| Excellent match | ≥ 0.85 | 4 filled dots |
| Strong match | 0.70 – 0.84 | 3 filled dots |
| Good match | 0.55 – 0.69 | 2 filled dots |
| Partial match | < 0.55 | 1 filled dot |

**Rationale**: Bedrock Titan embeddings with cosine similarity typically score:
- Highly relevant passages: 0.85–0.95
- Moderately relevant: 0.65–0.85
- Tangentially related: 0.45–0.65
- Noise (should not appear in top-10): < 0.45

These thresholds are informed by cosine similarity distributions for transformer-based
embeddings and align with published guidance on Bedrock Titan V2. They may be tuned
post-launch once real query logs are available.

**Alternatives considered**:
- Percentages (e.g., "91% match"): Research by Nielsen Norman Group shows users
  interpret percentage relevance scores as accuracy claims, leading to confusion when
  results labelled "91% match" feel subjectively poor. Qualitative labels are more
  honest about the probabilistic nature of semantic similarity.
- Star ratings: Five-point scale is finer-grained than needed and implies a user-rating
  model, not a system score.
