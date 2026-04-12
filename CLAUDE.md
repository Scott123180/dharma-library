# Dharma Library — CLAUDE.md

A read-first web application for browsing, reading, and listening to curated Dharma talks from Zen Mountain Monastery (~6,300 talks).

**Live site:** dharmalibrary.link  
**Repo:** github.com/Scott123180/dharma-library  
**Deployed via:** AWS Amplify → CloudFront CDN

---

## Tech Stack

- **Frontend:** React 18 + TypeScript 5 (strict mode)
- **Build:** Vite 5
- **Styling:** Plain CSS with CSS custom properties (no framework)
- **No backend:** Pure static SPA — all data served as JSON from CloudFront or local dev files

---

## Common Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Type check + Vite build → dist/
npm run preview    # Preview production build locally
npm run lint       # Type check only (tsc --noEmit)
npm test           # Run Playwright end-to-end test suite (headless)
npm run test:ui    # Run tests with the Playwright interactive UI
npm run test:headed # Run tests in a visible browser window
```

---

## Testing

### Overview

End-to-end tests are written with [Playwright](https://playwright.dev/) and live in the `tests/` directory. The dev server (`npm run dev`) is started automatically by Playwright when running tests.

**All network requests are intercepted** — tests never hit CloudFront or any external service. The shared fixture in [tests/fixtures.ts](tests/fixtures.ts) routes every `/dev-data/**` request to the local `public/dev-data/` files.

### When to run tests

Run the full suite after **any UI change**:

```bash
npm test
```

If you're actively developing, the interactive UI is more convenient:

```bash
npm run test:ui
```

### Test files

| File | What it covers |
|------|----------------|
| [tests/fixtures.ts](tests/fixtures.ts) | Shared `test` fixture — network mocking, controlled 25-talk index |
| [tests/home.spec.ts](tests/home.spec.ts) | Hero, featured talk, talks grid, feature cards, CTA |
| [tests/navigation.spec.ts](tests/navigation.spec.ts) | Nav links, active state, deep links, back/forward, back button |
| [tests/talks-list.spec.ts](tests/talks-list.spec.ts) | Search, teacher/year/month/stage filters, pagination, talk selection |
| [tests/talk-detail.spec.ts](tests/talk-detail.spec.ts) | Metadata, transcript, audio player, data-lineage tracker |
| [tests/theme.spec.ts](tests/theme.spec.ts) | Theme toggle, localStorage persistence, reload restoration |
| [tests/player-bar.spec.ts](tests/player-bar.spec.ts) | Global player bar appearance, close button, navigation survival |

### Writing tests for new features

1. **Import `test` and `expect` from `./fixtures.js`** (not from `@playwright/test` directly) so every test gets the network mocks automatically.
2. **Use `page.route()`** inside a test if you need to override the fixture for a specific scenario (see the lineage-panel test in `talk-detail.spec.ts` for an example).
3. **Do not assert specific featured-talk titles.** The featured talk rotates monthly by algorithm; assert only that the section renders something (title is non-empty, pills are visible, etc.).
4. **Add fixture data when testing new data shapes.** If a new field needs a fixture talk that has it, either add a fixture JSON file to `public/dev-data/talks/` or mock inline with `page.route()`.
5. **Group tests with `test.describe()`** and use `test.beforeEach` for shared navigation setup within a group.

### Fixture data reference

The test fixture index has **25 talks** — enough to trigger pagination (PAGE_SIZE = 24).

| Position | ID | Title | Has JSON file |
|----------|----|-------|--------------|
| 0 | 24525 | Hakuin's Song of zazen | ✓ |
| 1 | 24526 | Perfection of Giving | ✓ |
| 2 | 24769 | The Great Pearls Dana | ✓ |
| 3 | 24780 | Spiritual Fidelity (no transcript) | ✓ |
| 4 | 25342 | Stillness and Commotion | ✓ |
| 5 | 27044 | daido's shinsanshiki tape 2 | ✓ |
| 6 | 31782 | Disclosing Is Not As Good As Practice | ✓ |
| 7 | 37675 | We The People | ✓ |
| 8 | 37828 | Auspicious! Spring 2025 Ango Opening Talk | ✓ |
| 9–24 | various | Metadata-only padding entries | — (falls back to 37675) |

Any talk fetch for an ID without a fixture file is answered with a copy of talk 37675 (patched with the requested ID), so the app never 404s during tests.

---

## Architecture

### Routing
Client-side routing without a router library — uses `window.history.pushState()` and `popstate` events. Routes are parsed in `App.tsx` via `parseLocation()`.

| Route | Page |
|-------|------|
| `/` | Home (featured talk + paginated list) |
| `/talk/:id` | Individual talk detail |
| `/about` | About/mission |
| `/roadmap` | Development roadmap |

### Data Loading
Two-tier model to minimize payload:
- **TalkMetadata** — lightweight index (id, title, speaker, date, tags, etc.)
- **Talk** — full object extending metadata with `transcript: string`

The index is loaded once on app init; individual talks are lazy-loaded on navigation.

In **dev**, data is served from `public/dev-data/` (talks-index.json + per-talk JSON files).  
In **prod**, data comes from `https://d2f7aw4s8anu7j.cloudfront.net`.  
This is controlled in [src/config/talks.ts](src/config/talks.ts) via `import.meta.env.MODE`.

### State Management
Local `useState` only — no Redux, Context, or Zustand. Theme preference is stored in `localStorage`.

### Audio Playback
Two modes that must stay in sync:
1. **Inline player** — embedded `<audio>` element inside `FeaturedTalk` or `TalkDetail`
2. **Global PlayerBar** — persistent bar that survives page navigation

Position tracking is shared between both so playback can resume correctly.

### Theme System
CSS custom properties on `[data-theme="light"]` / `[data-theme="dark"]` selectors. A script in `index.html` initializes the theme before React loads to prevent flash of wrong theme (FOUC).

### Data Lineage (`ts` field)
Talks have a processing stage indicator:
1. Audio only
2. Raw transcript
3. Structured transcript
4. Cleaned transcript

Tracked via the `dataLineage` array (string | `{ stage, likeness }` objects). Shown in the `TalkDetail` component.

---

## Key Files

| File | Purpose |
|------|---------|
| [src/App.tsx](src/App.tsx) | Root component: routing, global state, audio orchestration |
| [src/api/talks.ts](src/api/talks.ts) | Fetch functions for index and individual talks |
| [src/config/talks.ts](src/config/talks.ts) | Dev/prod base URLs, reading speed constant (180 WPM) |
| [src/types/talk.ts](src/types/talk.ts) | `Talk`, `TalkMetadata`, `DataLineageEntry` interfaces |
| [src/styles.css](src/styles.css) | All global styles + CSS design tokens (light/dark) |
| [src/components/TalksList.tsx](src/components/TalksList.tsx) | Filtered, paginated talks list (24/page) |
| [src/components/TalkDetail.tsx](src/components/TalkDetail.tsx) | Full talk view: transcript, audio, metadata, lineage |
| [src/components/FeaturedTalk.tsx](src/components/FeaturedTalk.tsx) | Monthly rotating featured talk (deterministic via modulo) |
| [src/components/PlayerBar.tsx](src/components/PlayerBar.tsx) | Global persistent audio player |

---

## CSS Design Tokens

```css
/* Dark mode (default) */
--bg: #0b1021
--surface: #0f172a
--accent: #f6b73c
--text: #e8ecf5

/* Light mode */
--bg: #f8fafc
--surface: #ffffff
--accent: #f6b73c
--text: #0f172a
```

Max content width: `1120px`. Layout uses CSS Grid for cards, Flexbox for nav/components. Print support via `.no-print` / `.print-header` classes.

---

## Deployment

Pushes to GitHub trigger an AWS Amplify build:
1. `npm install`
2. `npm run build`
3. Artifacts from `dist/` deployed to Amplify + CloudFront

No environment variables are needed — config is driven by `import.meta.env.MODE`.

---

## External Dependencies

- **CloudFront CDN** — serves talks index + individual talk JSON files (prod)
- **Audio files** — hosted in `s3://dharma-library-bucket/audio/<id>.mp3`, served via CloudFront at `https://d2f7aw4s8anu7j.cloudfront.net/audio/<id>.mp3` (previously sourced directly from `media-archive.zmmapple.com`)
- **Google Fonts** — Manrope, Fraunces
- **AWS Amplify** — CI/CD and hosting

The upstream data ingestion pipeline (scraping, transcription, cleaning) lives in a separate repo/process.

---

## Worklog

Active work, open questions, and key decisions are tracked in [WORKLOG.md](WORKLOG.md).

**At the start of each session:** read WORKLOG.md to restore context.  
**During the session:** update it with decisions made, questions that come up, and work started or completed.  
**Periodically trim** by deleting anything recoverable from git history or the current code, condensing old completed entries, and keeping open questions, key decisions, and active experiments.
