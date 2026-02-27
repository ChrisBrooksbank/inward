# Implementation Plan

## Status

- Planning iterations: 5
- Build iterations: 0
- Last updated: 2026-02-26

## Notes

### What's Already Done

- Vocabulary + P2P types: `src/lib/types/domain.ts` (BodyRegion, SignalType, VocabularyCategory, SharingLevel, SensationDescription, SharedDescription, UserVocabularyProfile) and `src/lib/types/sync.ts`
- Type tests: `src/lib/types/sync.test.ts`
- **Missing from domain.ts**: Exercise, ExercisePhase, ExerciseSession, MAIAAssessment, UserProfile schemas (needed before db/stores tasks)
- PWA configuration (Vite, manifest, service worker)
- Dev tooling (ESLint, Prettier, Vitest, Playwright, Husky, Knip)
- Basic skeleton: `+layout.svelte`, `+page.svelte`, `app.html`

### Architectural Decisions

- Use Zod schemas from `src/lib/types/` for all runtime validation — do not redefine
- Use `idb` (already installed) for all IndexedDB operations
- Svelte 5 runes (`$state`, `$derived`, `$effect`) for component reactivity
- Svelte stores (`writable`, `readable`) for cross-component shared state
- `$lib` alias for all imports from `src/lib/`
- Functions max 50 lines, complexity max 10, no `any` types (enforced by ESLint)
- 80% test coverage required — add unit tests alongside each module

---

## Tasks

### Phase 1: Foundation

- [x] Add missing domain types to `src/lib/types/domain.ts`: ExerciseCategory enum, ExerciseDifficulty enum, ExercisePhase schema (type, durationSeconds, instruction), Exercise schema (id, title, category, difficulty, bodyRegions, phases), ExerciseSession schema (id, exerciseId, state machine: idle→playing→completed/abandoned, timestamps), MAIAAssessment schema (37 responses, 8 subscale scores), UserProfile schema (id, onboardingComplete, settings). Add unit tests in `domain.test.ts`. (spec: 02-onboarding.md, 03-exercise-system.md)
- [x] Create IndexedDB database module with stores for sessions, descriptions, confirmations, assessments, settings, and offline queue (spec: 01-foundation.md)
- [x] Create Svelte stores: userProfile, exerciseState, vocabularyStore, syncStatus — wired to IndexedDB (spec: 01-foundation.md)
- [x] Create base UI components: Button and Card (spec: 01-foundation.md)
- [x] Create BottomNav component with 4 tabs: Dashboard, Practice, Words, Progress (spec: 01-foundation.md)
- [x] Create PageShell component and integrate BottomNav into root layout (spec: 01-foundation.md)
- [x] Create SvelteKit route groups and stubs: `(app)/` dashboard, `(app)/practice`, `(app)/words`, `(app)/progress`, `(onboarding)/onboarding`, `(exercise)/exercise/[id]` — navigation hidden in `(exercise)` group layout (spec: 01-foundation.md)
- [x] Add reduced-motion CSS support, 44×44px touch target enforcement, and visible focus indicators to global styles (spec: 01-foundation.md)

### Phase 2: Onboarding

- [x] Build onboarding shell: step progress indicator (e.g. "Step 2 of 6"), skip button on every step, and persist current step index to IndexedDB so the flow resumes on page refresh (spec: 02-onboarding.md)
- [x] Build onboarding steps 1–3: Welcome, What is Interoception, Privacy & Data screens (spec: 02-onboarding.md)
- [x] Build MAIA-2 scoring logic: 37 items, 6-point Likert scale, 8 subscale score calculation (Noticing, Not-Distracting, Not-Worrying, Attention Regulation, Emotional Awareness, Self-Regulation, Body Listening, Trusting) with unit tests (spec: 02-onboarding.md)
- [x] Build MAIA-2 questionnaire UI component (step 4, optional/skippable): render items grouped by subscale, collect responses, call scoring logic, save result to IndexedDB (spec: 02-onboarding.md)
- [x] Build onboarding steps 5–6: First Exercise intro and Completion screens; save onboarding-complete flag to IndexedDB (spec: 02-onboarding.md)
- [x] Add route guard: redirect users who haven't completed onboarding to `/onboarding` on first visit (spec: 02-onboarding.md)
- [x] Build radar chart component for MAIA-2 baseline results display (spec: 02-onboarding.md)
- [x] Write Playwright E2E test: complete full onboarding flow (Welcome → MAIA-2 → First Exercise → done flag set in IndexedDB) (spec: 02-onboarding.md)

### Phase 3: Exercise System

- [x] Create seed exercise data: 6 categories × 3 difficulties with 16 body region tags (spec: 03-exercise-system.md)
- [x] Build exercise selection screen with category, difficulty, and body region filters (spec: 03-exercise-system.md)
- [x] Build exercise player state machine: idle → loading → ready → playing → paused → completed/abandoned/error (spec: 03-exercise-system.md)
- [x] Build circular countdown timer component with phase transition animations (spec: 03-exercise-system.md)
- [x] Implement all 6 phase types in player: instruction, movement, rest, notice, describe, reflect (spec: 03-exercise-system.md)
- [x] Add vocabulary capture UI during "describe" phases and emotion tagging after exercises (spec: 03-exercise-system.md)
- [x] Persist completed session data to IndexedDB; implement progressive unlock logic (spec: 03-exercise-system.md)
- [x] Write Playwright E2E test: select and complete a beginner exercise end-to-end (spec: 03-exercise-system.md)

### Phase 4: Vocabulary

- [x] Load 25 seed vocabulary terms into IndexedDB on first run (spec: 04-vocabulary.md)
- [x] Build personal vocabulary list view grouped by body region (spec: 04-vocabulary.md)
- [x] Add search and filter to vocabulary list (by region, signal type, emotion, category) (spec: 04-vocabulary.md)
- [x] Build description card component showing vocabulary term, metadata, timestamps, exercise context (spec: 04-vocabulary.md)
- [x] Implement sharing levels UI: private (default) → anonymous → attributed toggle on description card (spec: 04-vocabulary.md)
- [x] Build shared vocabulary discovery view: browse by body region, sort by confirmation count (spec: 04-vocabulary.md)
- [x] Implement "Yes, I feel this too" confirmation action with count update in local store (spec: 04-vocabulary.md)
- [x] Add contextual vocabulary suggestions panel after exercise completion (spec: 04-vocabulary.md)

### Phase 5: Progress

- [x] Build quick stats row: total sessions, unique words, streak days, body regions explored (spec: 05-progress.md)
- [x] Build practice streak calendar heatmap component (spec: 05-progress.md)
- [ ] Build body coverage map component showing practiced regions (spec: 05-progress.md)
- [ ] Add MAIA-2 radar chart to Progress tab with before/after overlay comparison when multiple assessments exist (reuse component from onboarding) (spec: 05-progress.md)
- [ ] Build insights engine: 5 insight types with 8 generation rules, max 3 shown at once (spec: 05-progress.md)
- [ ] Build sessions-per-week and vocabulary-growth-over-time charts (spec: 05-progress.md)
- [ ] Implement data export (full JSON) and delete-all-data with confirmation dialog (spec: 05-progress.md)

### Phase 6: Sync

- [ ] Build sync privacy consent UI: one-time opt-in dialog explaining what leaves the device before first sync, stored in settings (spec: 06-sync.md)
- [ ] Build REST API client for relay server: POST/GET descriptions, POST confirmations, GET sync delta (spec: 06-sync.md)
- [ ] Implement device registration: generate and persist anonymous device ID to IndexedDB (spec: 06-sync.md)
- [ ] Build offline queue: write pending operations to IndexedDB, flush on connectivity restored (spec: 06-sync.md)
- [ ] Implement delta sync with cursor-based pagination; background sync on app focus + 15-minute interval (spec: 06-sync.md)
- [ ] Add exponential backoff retry (1s, 2s, 4s, max 30s) and last-write-wins conflict resolution (spec: 06-sync.md)
- [ ] Build sync status indicator in app header: syncing / synced / offline + last-sync timestamp + manual trigger (spec: 06-sync.md)

---

## Completed

<!-- Completed tasks move here -->
