<!--
SYNC IMPACT REPORT
==================
Version change: [unversioned template] → 1.0.0
Added sections:
  - I. Test-Driven Development (TDD)
  - II. Intuitive UX/UI
  - III. Clean Code
  - IV. SOLID Design Principles
  - V. Lightweight JavaScript Components
  - Tech Stack Constraints
  - Development Workflow
  - Governance
Modified principles: n/a (initial ratification from blank template)
Removed sections: none
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gates align with principles
  ✅ .specify/templates/spec-template.md — no structural changes required; acceptance
            scenarios already match TDD/UX focus
  ✅ .specify/templates/tasks-template.md — test-first task ordering matches Principle I
  ⚠  .specify/templates/commands/*.md — no agent-specific names found; no changes needed
Deferred TODOs: none
-->

# Dharma Library Constitution

## Core Principles

### I. Test-Driven Development (TDD)

All new features and bug-fixes MUST follow the Red-Green-Refactor cycle:

- Tests MUST be written and confirmed failing **before** any implementation code is written.
- End-to-end tests use Playwright (`npm test`); they MUST run against the full dev server
  with all network requests intercepted via the shared fixture in `tests/fixtures.ts`.
- No PR may be merged if it causes previously-passing tests to regress.
- New UI behaviour MUST be covered by at least one Playwright scenario.
- Unit or integration tests for pure logic (utilities, data transforms) are encouraged
  and MUST use the project's standard test runner (Playwright or Vitest if adopted).

**Rationale**: The team has a Playwright suite covering 90 tests across all major flows.
Maintaining test-first discipline is the primary defence against regressions in a
no-backend, statically-deployed SPA where manual QA cannot scale.

### II. Intuitive UX/UI

Every user-facing change MUST prioritise discoverability and accessibility:

- Interactions MUST be keyboard-accessible (focus management, ARIA roles where applicable).
- Visual feedback (hover, active, focus states) MUST be present on all interactive elements.
- New UI flows MUST be validated in a browser before the feature is marked complete;
  screenshots or Playwright headed-mode confirmation are acceptable evidence.
- CSS MUST use the project's established design tokens (`--bg`, `--surface`, `--accent`,
  `--text`) defined in `src/styles.css`; ad-hoc colour literals are not permitted.
- Light and dark themes MUST both be verified for any component that touches colour.

**Rationale**: Dharma Library serves a diverse audience exploring contemplative content.
Clarity, calm aesthetics, and barrier-free access reflect the library's mission.

### III. Clean Code

Code MUST be readable and maintainable without relying on comments to explain intent:

- Functions and components MUST do one thing and do it well (see Principle IV).
- Variable and function names MUST be intention-revealing; abbreviations are not permitted
  unless universally understood (e.g., `id`, `url`).
- Dead code, unused imports, and commented-out blocks MUST be deleted, not left in place.
- Comments are reserved for non-obvious decisions or external constraints, not narration
  of what the code does.
- TypeScript strict mode is non-negotiable; `any` casts require a justification comment.

**Rationale**: A codebase that reads as clearly as prose reduces cognitive overhead and
makes future contributors (human or AI) immediately productive.

### IV. SOLID Design Principles

Component and module design MUST adhere to SOLID:

- **Single Responsibility**: Each component/module addresses one concern. Data fetching,
  rendering, and state management MUST NOT be co-mingled in a single component unless
  the component is explicitly a container and its complexity is justified.
- **Open/Closed**: Components MUST be extendable via props/composition without modifying
  their internals. Avoid hard-coding feature-specific logic inside shared components.
- **Liskov Substitution**: Any component that wraps or extends another MUST honour the
  parent's prop contract without narrowing or breaking it.
- **Interface Segregation**: Props interfaces MUST be minimal; never force a consumer to
  pass props it doesn't use. Prefer smaller, composable interfaces over monolithic ones.
- **Dependency Inversion**: Components MUST depend on abstractions (callbacks, context
  contracts, prop shapes) rather than on concrete sibling implementations.

**Rationale**: The app uses local `useState` only (no global state library). SOLID discipline
keeps components independently testable, replaceable, and composable as the feature set grows.

### V. Lightweight JavaScript Components

Bundle size and runtime weight MUST be kept minimal:

- New external dependencies require explicit justification; prefer native browser APIs and
  React built-ins before reaching for a library.
- Components MUST NOT import large libraries for tasks achievable with a short utility
  function (e.g., date formatting, string manipulation).
- Images and media MUST be referenced via CloudFront CDN; assets MUST NOT be bundled
  into `dist/`.
- Code splitting and lazy loading MUST be considered for any component or page that is
  not on the critical render path.
- `import.meta.env.MODE` gates MUST be used to keep dev-only code out of production
  bundles.

**Rationale**: Dharma Library is a pure static SPA deployed via AWS Amplify/CloudFront.
A lean JS bundle directly improves time-to-interactive for users on slower connections.

## Tech Stack Constraints

The following constraints are non-negotiable and override convenience or habit:

- **Language/Runtime**: TypeScript 5 in strict mode. JavaScript files are not permitted
  in `src/`.
- **Build**: Vite 5. Webpack, Parcel, or other bundlers MUST NOT be introduced.
- **Styling**: Plain CSS with CSS custom properties. CSS-in-JS, Tailwind, and CSS modules
  are not permitted unless a future amendment explicitly adopts them.
- **State**: Local `useState` only. Redux, Zustand, MobX, and similar state libraries
  are not permitted without a constitutional amendment.
- **Routing**: `window.history.pushState` / `popstate` pattern in `App.tsx`. A routing
  library MUST NOT be introduced without a constitutional amendment.
- **Data**: No backend. All data is fetched from CloudFront JSON (prod) or
  `public/dev-data/` (dev). Introducing a server or database requires a constitutional
  amendment.

## Development Workflow

All contributors MUST follow this workflow for every feature or fix:

1. **Read WORKLOG.md** at session start to restore context; update it with decisions
   and open questions throughout the session.
2. **Write tests first** per Principle I before implementing any feature.
3. **Run `npm test`** (full headless suite) after any UI change; failures block merge.
4. **Run `npm run lint`** (`tsc --noEmit`) before committing; type errors block merge.
5. **Verify in browser** (`npm run dev`) for any change visible to end-users, covering
   both light and dark themes.
6. **Keep PRs focused**: one feature or fix per PR; cross-cutting refactors are a
   separate PR.

## Governance

This constitution supersedes all other coding guidance within the repository.
Any practice that conflicts with these principles MUST be brought into compliance
before merging.

**Amendment procedure**:

1. Propose the amendment in a PR that updates this file.
2. Increment `CONSTITUTION_VERSION` per semantic versioning:
   - **MAJOR** — principle removed, renamed, or incompatibly redefined.
   - **MINOR** — new principle or section added; material guidance expanded.
   - **PATCH** — clarification, wording improvement, or typo fix.
3. Update the Sync Impact Report comment at the top of this file.
4. Propagate changes to templates listed in the Sync Impact Report.
5. Merge only after all affected templates are updated.

**Compliance review**: Every PR review MUST verify that the change does not violate
any principle. If a violation is necessary (justified exception), it MUST be documented
in the PR description and the Complexity Tracking section of the plan.

Runtime development guidance lives in [CLAUDE.md](../../CLAUDE.md) and
[WORKLOG.md](../../WORKLOG.md).

**Version**: 1.0.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12
