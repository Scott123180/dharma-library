# Worklog

Tracks work-in-progress, decisions, and open questions between sessions.

**Trimming rule:** Delete anything recoverable from git history or the current code. Condense old completed work into brief summaries. Keep open questions, key decisions, and active experiments.

---

## Open Questions

_Nothing yet._

---

## Key Decisions

_Nothing yet._

---

## Active Work

_Nothing yet._

---

## Completed (condensed)

- 2026-04-05 — Created CLAUDE.md and WORKLOG.md to establish session continuity
- 2026-04-12 — Added Playwright end-to-end test suite (90 tests, all passing). Tests cover home page, navigation, talks list + filters, talk detail, theme toggle, and player bar. All network calls mocked via route interception — no real HTTP. Test instructions added to CLAUDE.md.
- 2026-04-12 — Implemented Search Talks feature (specs/001-search-talks). 16 Playwright tests pass (US1 semantic search, US2 jump-to-passage, US3 shareable URLs). Stack: POST search API + client-side sessionStorage cache (7-day TTL), Text Fragments detection, URL ?q= sync, relevance tiers (4-dot indicator), enriched result cards with talk metadata. Bundle check: 57 KB gzip total — static import confirmed acceptable.
