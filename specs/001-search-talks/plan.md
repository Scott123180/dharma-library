# Implementation Plan: Search Talks

**Branch**: `001-search-talks` | **Date**: 2026-04-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-search-talks/spec.md`

## Summary

Add a `/search-talks` page that lets users query 461,106 semantic passage chunks across
the Dharma Library corpus via an existing Amazon Bedrock + S3 Vectors API. Results are
shown as ranked cards with talk metadata, relevance tier labels, and direct links into the
matching passage (Text Fragments). Results are cached in sessionStorage with a 7-day TTL.
The implementation extends the existing pushState/popstate routing, stays entirely within
the current tech stack, and introduces no new npm dependencies.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode) + React 18
**Primary Dependencies**: React (existing), Vite 5, Playwright (tests). No new packages.
**Storage**: sessionStorage (client-side cache); no backend
**Testing**: Playwright e2e — written before implementation per Principle I
**Target Platform**: Static SPA — AWS Amplify + CloudFront CDN
**Project Type**: Web application — adding one new route to an existing SPA
**Performance Goals**: Results visible within 2s (warm Lambda ~300–500ms); cached results
  load instantly; API rate limit 2 req/s sustained, 10 burst
**Constraints**: No new npm dependencies; no backend; TypeScript strict; plain CSS design
  tokens; pushState routing only; no search-as-you-type (rate-limit constraint)
**Scale/Scope**: ~6,300 talks; 461,106 chunks indexed; top-10 results per search

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. TDD | Playwright tests written and confirmed failing before any implementation | ✅ Required |
| II. Intuitive UX/UI | Design tokens only; keyboard accessible; both themes verified | ✅ Required |
| III. Clean Code | Single-responsibility components; no dead code; `any` banned | ✅ Required |
| IV. SOLID | Filter panel can be added as sibling without modifying existing components | ✅ Required |
| V. Lightweight JS | No new npm dependencies; native fetch, sessionStorage, Web APIs only | ✅ Required |
| Tech Stack | TypeScript strict; Vite; plain CSS; local state; pushState routing | ✅ Required |

**No violations.** All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-search-talks/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Phase 1 type and component design
├── quickstart.md        # Manual validation walkthrough
├── contracts/
│   └── search-api.md    # Search API contract (external)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code Changes

```text
src/
├── App.tsx                          # MODIFY: add "search-talks" route + URL sync
├── components/
│   ├── Header.tsx                   # MODIFY: add "Search" nav link
│   └── search/                      # NEW directory
│       ├── SearchBar.tsx            # NEW: query input, char count, submit
│       ├── SearchResults.tsx        # NEW: idle/loading/error/zero/results states
│       ├── SearchResultCard.tsx     # NEW: single result card
│       └── RelevanceIndicator.tsx   # NEW: dot-badge + tier label
├── pages/
│   └── SearchTalksPage.tsx          # NEW: route container
├── api/
│   └── search.ts                    # NEW: searchTalks() fetch wrapper
├── utils/
│   ├── relevance.ts                 # NEW: getRelevanceTier()
│   ├── metadataMap.ts               # NEW: buildMetadataMap()
│   ├── enrichResults.ts             # NEW: enrichResults()
│   └── searchCache.ts               # NEW: get/set cache with TTL
└── types/
    └── search.ts                    # NEW: SearchResult, EnrichedResult, etc.

tests/
└── search-talks.spec.ts             # NEW: Playwright e2e tests (written FIRST)

public/dev-data/
└── (no new fixture files needed — search tests mock the API endpoint directly)
```

**Structure Decision**: Single project (Option 1). All new files are additive to existing
`src/` and `tests/` trees. The `search/` component subdirectory groups the feature's
components under Principle IV (Interface Segregation / Single Responsibility).

## Complexity Tracking

> One constitution note addressed below (Principle V — lazy loading).

| Item | Decision | Rationale |
|------|----------|-----------|
| Two new utility directories (`utils/`) | Accepted | Cache, enrichment, relevance logic must not live in components — would violate Principles III and IV if inlined |
| Lazy loading `SearchTalksPage` (Principle V MUST consider) | **Not lazy-loaded in v1** | `SearchTalksPage` is a non-critical-path route. `React.lazy()` would add an async boundary and a suspense fallback. Current bundle impact is one additional page-sized component; at the Dharma Library's traffic scale this is acceptable. Revisit if bundle analysis shows the route contributes >10 KB gzip to the initial chunk. Task T028 tracks this decision. |

---

## Phase 0 Findings Summary (see research.md for full rationale)

| Topic | Decision |
|-------|----------|
| Text Fragments detection | `'fragmentDirective' in document` — synchronous, canonical |
| Duplicate chunks per talk | Show all as independent cards; no grouping in v1 |
| Cache storage | sessionStorage; key `dl_search_v1_<encoded-query>`; 7-day TTL; silent fallback |
| Metadata lookup | `Map<string, TalkMetadata>` built from loaded index; O(1) lookup |
| URL integration | `SearchTalksPage` owns `?q=` param via its own pushState calls |
| Submission model | Explicit submit only (no debounce needed); rate limit safe |
| Nav placement | "Search" added second in Header nav (after "Home") |
| Relevance tiers | ≥0.85 excellent / ≥0.70 strong / ≥0.55 good / <0.55 partial |

---

## Phase 1 Design Summary (see data-model.md for full detail)

### New Types (`src/types/search.ts`)

- `SearchResult` — raw API response shape
- `EnrichedResult` — `SearchResult` + `TalkMetadata | null`
- `RelevanceTier` — `'excellent' | 'strong' | 'good' | 'partial'`
- `SearchCacheEntry` — `{ results: EnrichedResult[], createdAt: number }`
- `SearchStatus` — `'idle' | 'loading' | 'success' | 'error'`

### Component Responsibilities

| Component | Single Responsibility |
|-----------|----------------------|
| `SearchTalksPage` | Route container: URL sync, query state, cache I/O, API orchestration |
| `SearchBar` | Controlled input with validation, char count display, submit trigger |
| `SearchResults` | Renders the correct state (idle/loading/error/zero/results) |
| `SearchResultCard` | Displays one `EnrichedResult`; composes indicator + actions |
| `RelevanceIndicator` | Visual dot group + tier label with `aria-label` |

### API Contract

See [contracts/search-api.md](contracts/search-api.md).
Wrapper: `src/api/search.ts` — `searchTalks(query: string, topK: number = 10)`.
Handles 400, 401, 429, 503 with typed error throws.

### App.tsx Routing Changes

1. `Route` union: add `"search-talks"`
2. `parseLocation()`: add `if (path === "/search-talks") return { route: "search-talks", talkId: null }`
3. URL sync `useEffect`: add `case "search-talks"` → `"/search-talks"` (no `?q=` — managed by page)
4. Render branch: add `route === "search-talks"` → `<SearchTalksPage talksIndex={talksIndex} />`

### Header.tsx Changes

Add "Search" `<a>` element between "Home" and "Roadmap", with `href="/search-talks"` and
`className={route === "search-talks" ? "is-active" : ""}`.

---

## Post-Phase 1 Constitution Re-Check

| Principle | Status after design |
|-----------|-------------------|
| I. TDD | ✅ `tests/search-talks.spec.ts` is the first artifact created |
| II. UX/UI | ✅ `RelevanceIndicator` uses CSS tokens; both themes work with existing variables |
| III. Clean Code | ✅ Each file has one purpose; no `any`; graceful fallbacks documented |
| IV. SOLID | ✅ `SearchFilters` can be added as sibling to `SearchBar` in `SearchTalksPage` without touching any other component |
| V. Lightweight JS | ✅ Zero new dependencies; `sessionStorage`, `fetch`, `Map`, `document.fragmentDirective` are all native |

All gates continue to pass.
