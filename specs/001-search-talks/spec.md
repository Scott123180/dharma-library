# Feature Specification: Search Talks

**Feature Branch**: `001-search-talks`
**Created**: 2026-04-12
**Status**: Draft
**Input**: User description — semantic vector search page for the Dharma Library talk corpus

## Clarifications

### Session 2026-04-12

- Q: When the user submits a new query while a previous search is still loading, what should happen? → A: Disable the input and submit button while loading; new submissions are blocked until the current request completes.
- Q: What caption should the "Open" button use — distinguishing audio vs. read, or neutral? → A: Always use a neutral label ("Open [title]" or "Open the talk") that makes no claim about audio or text.
- Q: When the user clicks Retry after an API error, should it check the cache first or always call the API? → A: Retry always makes a fresh API call, bypassing the cache.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Semantic Search (Priority: P1)

A practitioner wants to find Dharma talks relevant to a question or topic on their mind.
They visit the Search Talks page, type a natural-language phrase — such as "the nature of
impermanence" or "working with difficult emotions in sitting practice" — and receive a list
of matching talk passages ranked by how closely each passage addresses the query.

**Why this priority**: This is the entire reason the page exists. Without it there is
nothing to build or test.

**Independent Test**: A user can navigate to `/search-talks`, type a query of at least 3
characters, submit the search, and see a list of result cards each containing a matching
passage, the talk title, the teacher's name, and a visual relevance indicator — with no
other feature in place.

**Acceptance Scenarios**:

1. **Given** the user is on `/search-talks` with no prior query, **When** they type a phrase
   of 3–150 characters and submit, **Then** a ranked list of up to 10 result cards appears,
   each showing the matching passage, talk title, teacher name, duration, and a relevance
   indicator.

2. **Given** the user submits a query of fewer than 3 characters, **When** they attempt to
   search, **Then** an inline validation message prompts them to enter at least 3 characters
   and no API call is made.

3. **Given** the user submits a query of exactly 150 characters, **When** they search,
   **Then** the query is accepted and processed normally.

4. **Given** the user submits a query of more than 150 characters, **When** they attempt to
   submit, **Then** input beyond 150 characters is prevented (the field does not accept more)
   and an accessible character-count indicator informs the user of the limit.

5. **Given** results are returned, **When** the user reads the relevance indicators,
   **Then** each indicator uses a non-numerical label (e.g., "Excellent match", "Strong
   match", "Good match", "Partial match") accompanied by a visual icon — with no raw
   decimal score shown.

6. **Given** results are returned, **When** the user views the list,
   **Then** results are ordered from highest to lowest relevance with no visible gaps or
   reordering on the client side.

---

### User Story 2 — Jump to Matching Passage (Priority: P2)

A practitioner finds an interesting passage in a search result and wants to read the full
context within the talk, landing directly on that passage rather than at the top of a
potentially long transcript.

**Why this priority**: The primary "Open" action gets users to the talk; "Jump to text"
adds high value for engaged readers without blocking the MVP.

**Independent Test**: On a browser that supports Text Fragments, a result card shows both
an "Open" button and a "Jump to text" link. Clicking "Jump to text" navigates to the talk
detail page and the browser scrolls to and highlights the matching passage.

**Acceptance Scenarios**:

1. **Given** the user's browser supports Text Fragments, **When** they click "Jump to text"
   on a result card, **Then** they are taken to the full talk page and the browser scrolls
   to and visually highlights the matching passage.

2. **Given** the user's browser does not support Text Fragments, **When** results are
   displayed, **Then** no "Jump to text" option is shown; only the "Open" button appears.

3. **Given** the user clicks "Open" on any result card, **When** the navigation occurs,
   **Then** the full talk page opens at the top of the talk (not at a specific passage).

---

### User Story 3 — Shareable & Bookmarkable Search (Priority: P3)

A practitioner finds a useful set of results and wants to share the search with a friend or
return to it later.

**Why this priority**: URL-reflected state is standard web behaviour that supports users'
existing mental models; it does not alter the core search flow.

**Independent Test**: After performing a search for "compassion in daily life", the URL
updates to `/search-talks?q=compassion+in+daily+life`. Copying that URL and opening it in
a new browser tab reproduces the same search results without the user having to type
the query again.

**Acceptance Scenarios**:

1. **Given** the user submits a search query, **When** results appear, **Then** the page URL
   contains the query as a `q` parameter (e.g., `/search-talks?q=nature+of+mind`).

2. **Given** a user opens a URL containing a `q` parameter, **When** the page loads,
   **Then** the search input is pre-populated with the query and results are automatically
   loaded without requiring a manual submit.

3. **Given** the user clears the search input and submits an empty form (or navigates to
   `/search-talks` with no `q` parameter), **When** the page loads, **Then** the empty
   state is shown and the URL contains no `q` parameter.

4. **Given** results have been loaded for a query, **When** the user navigates away and
   returns to the same URL within 7 days, **Then** results are restored from the local
   cache without making a new API call.

---

### Edge Cases

- What happens when the search service is temporarily unavailable (503)?
- What happens when the user rapidly submits multiple queries back-to-back?
- What happens if talk metadata cannot be found for a `talk_id` returned by the search API?
- What happens when the matching passage contains special characters that affect URL encoding?
- What if the cache storage (sessionStorage) is unavailable or full?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST provide a single text input for search queries, accepting between
  3 and 150 characters. Characters beyond 150 MUST be blocked at the input level.

- **FR-002**: The system MUST reject queries fewer than 3 characters with an inline
  validation message before contacting the search service.

- **FR-003**: The system MUST display a character count or progress indicator near the
  search input to inform users of the 150-character limit.

- **FR-004**: The system MUST request the top 10 results from the search service for every
  query (the frontend always sends `top_k: 10`).

- **FR-005**: The system MUST display results as cards sorted strictly by similarity score
  in descending order (highest relevance first).

- **FR-006**: Each result card MUST display: the matching passage text, the talk title,
  the teacher name, the talk duration, the talk overview/summary (when available), a
  relevance tier indicator, and at least one primary action ("Open talk").

- **FR-007**: The relevance tier MUST be communicated using a qualitative label and a
  visual icon — never as a raw decimal number. The four tiers are:
  - **Excellent match** (similarity ≥ 0.85) — 4-unit visual indicator
  - **Strong match** (similarity 0.70–0.84) — 3-unit visual indicator
  - **Good match** (similarity 0.55–0.69) — 2-unit visual indicator
  - **Partial match** (similarity < 0.55) — 1-unit visual indicator

- **FR-008**: The system MUST detect Text Fragments browser support at runtime. If
  supported, each result card MUST also show a "Jump to text" secondary action that opens
  the talk with the browser scrolled to and highlighting the matching passage. If
  unsupported, the "Jump to text" option MUST NOT appear.

- **FR-009**: The search query MUST be reflected in the page URL as a `q` query parameter.
  Loading the page with a `q` parameter MUST trigger an automatic search and pre-populate
  the input field.

- **FR-010**: The system MUST cache search results client-side, keyed by the exact query
  string, with a 7-day TTL. Subsequent searches for the same query within the TTL MUST
  use the cached results without contacting the search service.

- **FR-011**: The system MUST display a loading indicator while a search request is
  in progress. The search input and submit button MUST be disabled for the duration of
  the request; no new submission can be initiated until the current one completes.

- **FR-012**: The system MUST display a distinct empty state when the page loads without
  a query, inviting users to enter a search term.

- **FR-013**: The system MUST display a zero-results state when the search service returns
  no matches, with a helpful message and a suggestion to try different or broader terms.

- **FR-014**: The system MUST display an error state with a user-friendly message and a
  retry option when the search request fails (network error, service unavailable, or
  rate-limited). Clicking Retry MUST make a fresh API call, bypassing any cached results.

- **FR-015**: Talk metadata (title, teacher, duration, overview) MUST be sourced from the
  existing talk catalog using the `talk_id` returned in the search result. If metadata is
  not found for a given `talk_id`, the card MUST still render with the available passage
  text and a graceful fallback for missing fields.

- **FR-016**: The page and all interactive elements MUST be fully operable via keyboard.
  The search input MUST receive focus on page load. Result cards MUST be reachable via
  Tab, with "Open" and "Jump to text" individually focusable and activatable by Enter/Space.

- **FR-017**: The relevance indicator MUST have an accessible text label readable by
  screen readers (e.g., `aria-label="Excellent match"`). The indicator MUST NOT rely on
  colour alone.

- **FR-018**: The component architecture for the results area MUST be designed so that a
  filter panel (e.g., by teacher or date) can be added as a sibling component without
  modifying the result card or search input components.

### Card Content Hierarchy & Truncation Rules

The following visual hierarchy MUST be applied within each result card:

**Priority 1 — Matching passage** (most prominent): displayed in a visually distinct block
(e.g., indented or shaded). Truncated to approximately 3 lines (~240 characters) with a
"Show more" toggle for longer passages.

**Priority 2 — Talk identity**: talk title (bold, full width, 1 line with ellipsis) and
teacher name on the same or immediately adjacent line.

**Priority 3 — Relevance indicator**: displayed as a compact badge or icon group, positioned
to be seen quickly while scanning (e.g., top-right of card or inline with title).

**Priority 4 — Actions**: "Open" button (primary, prominent) and "Jump to text" link
(secondary, less visually heavy), always visible without scrolling within the card.

**Priority 5 — Supporting metadata**: duration and talk overview, displayed below the
passage, truncated to 2 lines (~160 characters) with no expand (informational only).

### Caption Behaviour

The "Open" action MUST use a neutral label that makes no claim about audio or text
availability. The default caption is "Open the talk". When the talk title is available
from metadata, the caption MUST read "Open [title]".

### Key Entities *(include if feature involves data)*

- **Search Query**: The text the user entered; 3–150 characters; used as cache key and URL
  parameter.
- **Search Result**: A single match from the search service, comprising a talk identifier,
  a passage chunk, a chunk index, and a similarity score.
- **Talk Metadata**: The catalog entry corresponding to a talk identifier — title, teacher,
  duration, and overview/summary.
- **Enriched Result**: A Search Result combined with the corresponding Talk Metadata,
  forming the data backing one result card.
- **Search Cache Entry**: A stored set of Enriched Results keyed by query string, with a
  creation timestamp used to enforce the 7-day TTL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can perform a search and view results without requiring any page reload
  or navigation away from `/search-talks`.

- **SC-002**: Search results appear within 2 seconds for at least 95% of queries under
  normal network and service conditions (warm service; excludes cold-start edge cases).

- **SC-003**: Users who open a shared search URL see the same results as the original
  searcher without needing to re-enter the query.

- **SC-004**: Returning users who repeat the same search within 7 days experience instant
  result display (no perceptible loading delay from a cached response).

- **SC-005**: Users operating solely by keyboard can complete a full search-and-open-talk
  flow without using a mouse or touch input.

- **SC-006**: All result cards pass automated accessibility checks (no colour-only
  information, all interactive elements have accessible labels, focus order is logical).

- **SC-007**: On browsers without Text Fragments support, no broken or non-functional UI
  elements are shown to users (clean graceful degradation).

- **SC-008**: When the search service fails, users can identify the problem and retry without
  refreshing the page.

## Assumptions

- The `talk_id` values returned by the search service match the `id` field in the existing
  talk catalog that the application already loads on startup; no additional catalog endpoint
  is required.
- The talk catalog is available and fully loaded before any search result is displayed;
  metadata resolution is synchronous from the in-memory catalog.
- Talk overviews/summaries are present for most but not all talks; cards where the field is
  absent omit the overview section entirely rather than showing a placeholder.
- The search service is called once per query submission (no search-as-you-type), consistent
  with the rate limits of 2 requests/second sustained.
- `sessionStorage` is the caching mechanism; if unavailable (e.g., private browsing with
  storage blocked), the cache is silently skipped and the API is called each time.
- Text Fragments detection uses the standard `document.fragmentDirective` API check; no
  polyfill is provided.
- The minimum query length enforced by the API (3 characters) is mirrored in the frontend
  to avoid unnecessary API round-trips; the 150-character maximum is enforced by the input
  field itself.
- Future filter additions (teacher, date) will be implemented as sibling filter components
  that pass filter parameters into the existing search flow; no filtering logic is included
  in this version.
- Audio playback from the global PlayerBar is out of scope for search result cards; the
  card's primary action navigates to the talk detail page where audio is available.
