# Quickstart: Search Talks

**Feature**: `specs/001-search-talks`
**Date**: 2026-04-12

Use this guide to manually validate the Search Talks feature after implementation.

---

## Prerequisites

1. Install dependencies (first time only):
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs at `http://localhost:5173`.

---

## Validation Walkthrough

### 1. Empty state

1. Navigate to `http://localhost:5173/search-talks`.
2. **Expected**: Page loads with the search input focused and an invitation message (no
   results, no loading spinner).
3. **Expected**: The "Search" nav link in the header is highlighted as active.
4. Check in both light and dark themes (toggle via the theme button in the header).

---

### 2. Basic search — happy path

1. Type `impermanence and suffering` into the search box.
2. Press Enter or click the search button.
3. **Expected**: A loading indicator appears immediately.
4. **Expected**: Within ~2 seconds, up to 10 result cards appear, ordered from highest to
   lowest relevance.
5. Inspect the first card:
   - A matching passage is displayed in a visually distinct block.
   - The talk title and teacher name are shown.
   - A relevance indicator with a tier label (e.g., "Excellent match", "Strong match")
     is visible. No decimal scores are shown.
   - An "Open" button (primary action) is visible.
   - If your browser supports Text Fragments (Chrome/Edge), a "Jump to text" link is
     visible. On Firefox/Safari, only "Open" appears.

---

### 3. Input validation

1. Clear the search box and type just `ab` (2 characters).
2. Press Enter.
3. **Expected**: An inline validation message appears; no API call is made (check the
   Network tab in DevTools — no POST to the search endpoint).
4. Type a full sentence of exactly 150 characters. Verify the character count indicator
   reaches 150/150 and the input does not accept further characters.

---

### 4. Open a talk

1. Perform any search that returns results.
2. Click "Open" on any result card.
3. **Expected**: You are navigated to the full talk detail page (`/talk/<id>`).
4. Press the browser Back button.
5. **Expected**: You return to `/search-talks` with the previous query still in the
   search box and previous results still displayed.

---

### 5. Jump to text (Chrome/Edge only)

1. Perform a search that returns results.
2. Click "Jump to text" on a result card.
3. **Expected**: You are taken to the talk detail page and the browser scrolls to and
   highlights the matching passage text.

---

### 6. URL shareability

1. Perform a search for `sitting with difficulty`.
2. Copy the URL from the address bar — it should contain `?q=sitting+with+difficulty`.
3. Open the copied URL in a new browser tab.
4. **Expected**: The search input is pre-filled and the same results appear automatically,
   without pressing Enter.

---

### 7. Zero results state

1. Search for a nonsense string like `zzzzqqqqasdfg12345`.
2. **Expected**: A friendly zero-results message appears (e.g., "No passages found —
   try broader or different terms"). No error state.

---

### 8. Error state

1. In DevTools (Network tab), set the network to Offline.
2. Perform a search.
3. **Expected**: An error message appears with a retry button or suggestion. The app
   does not crash.
4. Re-enable the network, click retry.
5. **Expected**: The search proceeds normally.

---

### 9. Caching

1. Perform a search for `compassion`.
2. In DevTools (Network tab), note the POST request to the search endpoint.
3. Refresh the page.
4. **Expected**: The URL still contains `?q=compassion`; results reappear immediately
   (no new POST request in the Network tab — the cache was used).

---

### 10. Accessibility checks

1. With the search results loaded, press Tab from the search input.
2. **Expected**: Focus moves through each result card in order; "Open" and "Jump to
   text" within each card are individually focusable and activatable by pressing Enter.
3. Using a screen reader (or the Accessibility panel in DevTools), verify that:
   - The relevance indicator has an accessible label (e.g., "Excellent match").
   - The "Jump to text" link has a descriptive label.
   - The search input has an accessible label or `aria-label`.

---

## Running the automated test suite

```bash
npm test
```

All 90+ existing tests must continue to pass. New Playwright tests covering this feature
should also pass before the feature is considered complete.

```bash
npm run test:headed   # watch the browser during test runs
npm run test:ui       # interactive Playwright UI for debugging individual tests
```
