---
description: "Task list for Search Talks feature implementation"
---

# Tasks: Search Talks

**Input**: Design documents from `specs/001-search-talks/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Included per Constitution Principle I (TDD non-negotiable). Test tasks are
written first within each user story phase and MUST fail before implementation begins.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

## Path Conventions

- All new source files live under `src/` at repository root
- Tests live under `tests/` at repository root
- Paths reflect the component architecture in `specs/001-search-talks/data-model.md`

---

## Phase 1: Setup (Shared Types & Structure)

**Purpose**: Create the type definitions and directory structure that every subsequent
task depends on. Must complete before Phase 2.

- [ ] T001 Create `src/types/search.ts` — define `SearchResult`, `EnrichedResult`, `RelevanceTier`, `SearchCacheEntry`, and `SearchStatus` types per `specs/001-search-talks/data-model.md`
- [ ] T002 [P] Create `src/components/search/` directory with a barrel export file `src/components/search/index.ts` (empty, to be populated as components are added)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and routing scaffolding that ALL user story phases depend on.
Must complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 [P] Create `src/api/search.ts` — implement `searchTalks(query: string, topK = 10): Promise<SearchResult[]>` using the contract in `specs/001-search-talks/contracts/search-api.md`; `topK` defaults to 10 and callers MUST always pass 10 per FR-004 (parameter kept for explicitness but not varied); handle 400, 401, 429, 503 with typed error throws; include `Content-Type: application/json` and `X-Api-Key: dharma-library-link` headers
- [ ] T004 [P] Create `src/utils/relevance.ts` — implement `getRelevanceTier(similarity: number): RelevanceTier` with thresholds from FR-007 (≥0.85 excellent, ≥0.70 strong, ≥0.55 good, <0.55 partial)
- [ ] T005 [P] Create `src/utils/metadataMap.ts` — implement `buildMetadataMap(index: TalkMetadata[]): Map<string, TalkMetadata>` that maps each talk's `id` to its metadata entry
- [ ] T006 [P] Create `src/utils/enrichResults.ts` — implement `enrichResults(raw: SearchResult[], map: Map<string, TalkMetadata>): EnrichedResult[]` that joins results with metadata; sets `metadata: null` for unmatched `talk_id` values
- [ ] T007 Update `src/App.tsx` — add `"search-talks"` to the `Route` type union and add `if (path === "/search-talks") return { route: "search-talks", talkId: null }` to `parseLocation()`; add `"/search-talks"` case to the URL sync `useEffect` (pathname only — `?q=` is managed by the page component)
- [ ] T008 [P] Update `src/components/Header.tsx` — add a "Search" `<a>` nav link with `href="/search-talks"` and `className={route === "search-talks" ? "is-active" : ""}` positioned between "Home" and "Roadmap"; update `HeaderProps` to include `"search-talks"` in the `route` and `onNavigate` unions

**Checkpoint**: Foundation ready — all utilities exist, route is registered, nav link is present. User story work can now begin.

---

## Phase 3: User Story 1 — Semantic Search (Priority: P1) 🎯 MVP

**Goal**: A user can navigate to `/search-talks`, enter a query, and receive ranked result
cards with talk metadata and relevance indicators.

**Independent Test**: Navigate to `http://localhost:5173/search-talks`, type "the nature
of mind", press Enter, observe up to 10 result cards with matching passage text, talk
title, teacher name, and a relevance tier label.

### Tests for User Story 1 ⚠️ Write FIRST — confirm they FAIL before implementing

- [ ] T009 [US1] Create `tests/search-talks.spec.ts` and write US1 Playwright tests: import `test` and `expect` from `./fixtures.js`; mock the search API POST endpoint via `page.route('**/search', ...)` returning a fixture of 3 results; cover: (1) page loads at `/search-talks` with search input focused and empty state visible, (2) valid query returns result cards with passage text + title + teacher + relevance label, (3) query < 3 chars shows inline validation and makes no API call, (4) query of exactly 150 chars is accepted, (5) submit button is disabled during loading, (6) zero-results state shown when API returns empty array, (7) error state shown when API returns 500 with retry button visible, (8) **keyboard-only flow**: `page.keyboard.type(query)` → `page.keyboard.press('Enter')` → search input and button are disabled → results appear → `page.keyboard.press('Tab')` to first result card → `page.keyboard.press('Enter')` on "Open" button navigates to talk, (9) **accessibility assertions**: `expect(page.getByRole('button', { name: /Open/ }).first()).toBeVisible()`, verify relevance indicator has `aria-label` matching its tier label (e.g., `page.getByLabel('Excellent match')`), verify search input has an accessible label, verify "Show more" toggle is keyboard-reachable

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create `src/components/search/RelevanceIndicator.tsx` — renders 1–4 filled dots based on `tier: RelevanceTier` prop; includes `aria-label` equal to the tier label ("Excellent match" / "Strong match" / "Good match" / "Partial match"); does NOT use colour as the only indicator; uses CSS custom properties from `src/styles.css`
- [ ] T011 [P] [US1] Create `src/components/search/SearchBar.tsx` — controlled input accepting `value`, `onChange`, `onSubmit`, `disabled` props; enforces 150-char max via `maxLength`; displays a live character count indicator; shows inline validation message when query < 3 chars on submit attempt; submit button and input are both disabled when `disabled` prop is true; search input has `aria-label`
- [ ] T012 [US1] Create `src/components/search/SearchResultCard.tsx` — accepts `result: EnrichedResult` prop; renders matching passage (visually distinct block, truncated ~240 chars with "Show more" toggle); talk title (bold, 1 line ellipsis); teacher name displayed using `metadata.speaker ?? metadata.teacher ?? 'Unknown teacher'` (prefer `speaker` as primary field; fall back to legacy `teacher`; then static fallback); relevance indicator (via `RelevanceIndicator`); duration (omitted if null); overview truncated to ~160 chars (no expand); "Open [title]" button as primary action navigating to `/talk/<talk_id>`; graceful fallbacks per `data-model.md` when `metadata === null`; uses design tokens from `src/styles.css`
- [ ] T013 [US1] Create `src/components/search/SearchResults.tsx` — accepts `status: SearchStatus` and `results: EnrichedResult[]` props; renders appropriate state: idle (invitation prompt), loading (spinner), error (user-friendly message + Retry button that emits `onRetry` callback), zero-results (helpful message + suggestion to broaden query), success (list of `SearchResultCard` components in order received)
- [ ] T014 [US1] Create `src/pages/SearchTalksPage.tsx` — route container accepting `talksIndex: TalkMetadata[]` and `indexLoading: boolean` props; when `indexLoading` is true and a `?q=` param is present on mount, show a loading indicator and defer the auto-search until `indexLoading` becomes false (prevents enrichment running against an empty catalog); once `indexLoading` is false, build metadata map via `buildMetadataMap` and run any deferred auto-search; owns `query`, `status`, and `results` state; calls `searchTalks()` and `enrichResults()` on submit; disables input during loading per FR-011; passes `onRetry` (fresh API call, bypasses cache) to `SearchResults`; renders `SearchBar` + `SearchResults`; keyboard focus goes to `SearchBar` on mount
- [ ] T015 [US1] Update `src/App.tsx` — add render branch for `route === "search-talks"` rendering `<SearchTalksPage talksIndex={talksIndex} indexLoading={indexLoading} />`
- [ ] T016 [US1] Add CSS for search components to `src/styles.css` — style rules for `.search-bar`, `.search-results`, `.search-result-card`, `.relevance-indicator`, `.chunk-text` using existing CSS custom properties; card layout uses Flexbox; chunk text block uses `--surface` background for visual distinction; verify light and dark themes both render correctly

**Checkpoint**: User Story 1 fully functional and independently testable. T009 tests should now pass.

---

## Phase 4: User Story 2 — Jump to Matching Passage (Priority: P2)

**Goal**: On supporting browsers, each result card shows a "Jump to text" link that
opens the talk and scrolls to the exact matching passage. On unsupported browsers,
only "Open" appears.

**Independent Test**: In Chrome/Edge, a result card shows both "Open [title]" and "Jump
to text". Clicking "Jump to text" navigates to the talk and the browser scrolls to and
highlights the matching passage. In Firefox/Safari, only "Open [title]" is shown.

### Tests for User Story 2 ⚠️ Write FIRST — confirm they FAIL before implementing

- [ ] T017 [US2] Add US2 Playwright tests to `tests/search-talks.spec.ts` — cover: (1) "Jump to text" link is present in Chrome and its `href` contains `#:~:text=` with URL-encoded chunk text, (2) "Jump to text" is absent when `document.fragmentDirective` is not available (mock absence by overriding in page context), (3) clicking "Open [title]" navigates to `/talk/<id>` without a text fragment

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create `src/utils/textFragments.ts` — export `supportsTextFragments(): boolean` that returns `'fragmentDirective' in document`; computed once at module load into a `const` for reuse
- [ ] T019 [US2] Update `src/components/search/SearchResultCard.tsx` — import `supportsTextFragments`; when `true`, render a "Jump to text" secondary action `<a>` whose `href` is `/talk/<talk_id>#:~:text=<encodeURIComponent(chunk_text)>`; apply lighter visual weight than the "Open" button per FR-008; add accessible `aria-label="Jump to matching passage in [title]"` (or fallback when title absent)

**Checkpoint**: User Stories 1 and 2 both independently functional. T017 tests should now pass.

---

## Phase 5: User Story 3 — Shareable & Bookmarkable Search (Priority: P3)

**Goal**: The search query is reflected in the URL. Opening a shared URL auto-runs the
search. Results for repeat queries within 7 days are served from cache.

**Independent Test**: Search for "compassion". URL updates to `/search-talks?q=compassion`.
Copy the URL, open in a new tab — query pre-fills and results load without a new API call.
Reload within 7 days — same results appear instantly from cache.

### Tests for User Story 3 ⚠️ Write FIRST — confirm they FAIL before implementing

- [ ] T020 [US3] Add US3 Playwright tests to `tests/search-talks.spec.ts` — cover: (1) after a search, URL contains `?q=<encoded-query>`, (2) navigating to `/search-talks?q=mind` pre-fills input and auto-triggers search, (3) repeating the same query uses sessionStorage cache and makes no new POST request (verify via `page.route()` request count), (4) clearing input and submitting removes `?q=` from URL and shows empty state

### Implementation for User Story 3

- [ ] T021 [US3] Create `src/utils/searchCache.ts` — implement `getCachedResults(query: string): EnrichedResult[] | null` (returns null on cache miss or expired TTL), `cacheResults(query: string, results: EnrichedResult[]): void` (writes to sessionStorage; silently catches `SecurityError` / quota errors), and `CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000`; key format: `dl_search_v1_${encodeURIComponent(query.trim())}`; TTL check: `Date.now() - entry.createdAt > CACHE_TTL_MS`
- [ ] T022 [US3] Update `src/pages/SearchTalksPage.tsx` — (1) on mount, read `?q=` param from `window.location.search` and auto-run search if present; (2) after each successful search, call `cacheResults()`; (3) before calling API, call `getCachedResults()` — if hit, skip API call and set results directly; (4) on each query change, call `window.history.pushState({}, '', '/search-talks?q=' + encodeURIComponent(query))` or `/search-talks` when query is cleared; Retry action bypasses cache (calls API directly without cache check per FR-014)

**Checkpoint**: All three user stories independently functional. T020 tests should now pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and verification across all stories.

- [ ] T023 [P] Verify light and dark themes in browser — start `npm run dev`, toggle theme, inspect all search components for correct `--bg`, `--surface`, `--accent`, `--text` token usage; fix any hardcoded colour values in `src/styles.css`
- [ ] T024 [P] Run `npm run lint` — confirm zero TypeScript type errors (`tsc --noEmit`); fix any strict-mode violations introduced in new files
- [ ] T025 Run `npm test` — confirm all tests pass: the original 90+ Playwright tests must not regress, and the new search tests in `tests/search-talks.spec.ts` must pass; verify that accessibility assertions in T009 test cases (8) and (9) pass (keyboard flow and ARIA labels)
- [ ] T026 [P] Complete manual validation steps 1–10 in `specs/001-search-talks/quickstart.md` — confirm each step's expected outcome is met in the browser
- [ ] T027 [P] Update `WORKLOG.md` — record search feature completion, any decisions made during implementation that differ from the plan, and any open questions for future work
- [ ] T028 [P] Document lazy-loading decision — confirm that `SearchTalksPage` is imported statically in `src/App.tsx` (not via `React.lazy()`); run `npm run build` and check the Vite bundle output to confirm the search page chunk is within acceptable size; if the search route's contribution exceeds 10 KB gzip in the initial bundle, convert to `React.lazy()` with a `<Suspense>` fallback per Constitution Principle V

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001 types must exist) — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 checkpoint (SearchResultCard exists to update)
- **User Story 3 (Phase 5)**: Depends on Phase 3 checkpoint (SearchTalksPage exists to update)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### Within Each User Story Phase

- Test task (T009 / T017 / T020) MUST be written and confirmed failing before any implementation task in that phase begins
- Within implementation: RelevanceIndicator (T010) before SearchResultCard (T012); SearchResultCard (T012) before SearchResults (T013); SearchResults (T013) and SearchBar (T011) before SearchTalksPage (T014)

### Parallel Opportunities

All Phase 2 tasks T003–T006 can run in parallel (different files).
T010 and T011 can run in parallel (different files).
T018 can run while T017 tests are being written.
T023, T024, T026, T027, T028 can run in parallel in Phase 6.

---

## Parallel Example: Phase 2 Foundational

```bash
# These four utility files have no interdependencies — run together:
Task: "Create src/api/search.ts"           # T003
Task: "Create src/utils/relevance.ts"      # T004
Task: "Create src/utils/metadataMap.ts"    # T005
Task: "Create src/utils/enrichResults.ts"  # T006
```

## Parallel Example: User Story 1 Implementation Start

```bash
# After T009 tests written and confirmed failing:
Task: "Create src/components/search/RelevanceIndicator.tsx"  # T010
Task: "Create src/components/search/SearchBar.tsx"           # T011
# Then sequentially:
Task: "Create SearchResultCard.tsx"   # T012 (needs T010)
Task: "Create SearchResults.tsx"      # T013 (needs T012)
Task: "Create SearchTalksPage.tsx"    # T014 (needs T011, T013)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **CRITICAL, blocks everything**
3. Write T009 tests → confirm they FAIL → complete Phase 3 implementation
4. **STOP and VALIDATE**: Navigate to `/search-talks`, search, verify result cards
5. Run `npm test` — confirm existing tests pass and T009 tests now pass

### Incremental Delivery

1. Setup + Foundational → skeleton in place
2. User Story 1 → MVP: search works end-to-end → **shippable**
3. User Story 2 → Jump to text on supporting browsers
4. User Story 3 → URL sync + caching → shareable links
5. Polish → all gates pass

---

## Notes

- `[P]` = parallelizable (different files, no dependency on in-progress tasks)
- `[US1/2/3]` maps each task to its user story for traceability
- TDD is mandatory per Constitution Principle I: test tasks precede all implementation in each phase
- Playwright tests mock the search API via `page.route()` — no real network calls
- `src/utils/searchCache.ts` is created in US3 phase because caching is specific to the shareability/bookmarking story
- The Retry path in `SearchTalksPage` bypasses cache per FR-014 and clarification recorded in spec
- "Open" button always uses neutral label "Open [title]" per clarification in spec
- Teacher name field resolution in `SearchResultCard`: `metadata.speaker ?? metadata.teacher ?? 'Unknown teacher'`
- `SearchTalksPage` accepts `indexLoading: boolean` to defer auto-search until catalog is ready
- T028 satisfies Constitution Principle V (lazy loading MUST be considered); decision documented in plan.md Complexity Tracking
