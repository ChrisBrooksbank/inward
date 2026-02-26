# Foundation: App Shell, Navigation & Data Layer

## Overview

Establish the core infrastructure that all features depend on: routing, layout, IndexedDB persistence, Svelte stores, and base component patterns.

## User Stories

- As a user, I want the app to load instantly and work offline so I can practice anywhere
- As a user, I want simple bottom-tab navigation so I can move between sections without confusion
- As a developer, I want a consistent data layer so all features persist and react to state changes

## Requirements

### Routing & Layout (from APP-NAVIGATION.md)

- [ ] 4-tab bottom navigation: Dashboard, Practice, Words, Progress
- [ ] Route groups: `(onboarding)`, `(app)`, `(exercise)`
- [ ] Maximum 2 levels deep from primary destinations
- [ ] Navigation hidden during exercise playback
- [ ] Route guards: redirect to onboarding if not completed
- [ ] SvelteKit file-based routing with `+page.svelte` and `+layout.svelte`

### IndexedDB Layer (from P2P-SYNC-PROTOCOL.md, EXERCISE-SYSTEM.md)

- [ ] Database schema using `idb` wrapper
- [ ] Stores: `sessions`, `descriptions`, `confirmations`, `assessments`, `settings`
- [ ] CRUD operations for each store
- [ ] Migration support for schema changes

### Svelte Stores

- [ ] `userProfile` store - onboarding state, preferences
- [ ] `exerciseState` store - current exercise session
- [ ] `vocabularyStore` - user's personal descriptions
- [ ] `syncStatus` store - online/offline, last sync time

### Base Components

- [ ] `BottomNav` - 4-tab navigation bar (44x44px touch targets)
- [ ] `PageShell` - consistent page wrapper with header
- [ ] `Button` - accessible button with variants (primary, secondary, ghost)
- [ ] `Card` - content container component

### Accessibility Baseline (from ACCESSIBILITY.md)

- [ ] Respect `prefers-reduced-motion` and `prefers-color-scheme`
- [ ] Visible focus indicators on all interactive elements
- [ ] 44x44px minimum touch targets
- [ ] Semantic HTML throughout (landmarks, headings, labels)

## Acceptance Criteria

- [ ] All 4 tabs render stub pages and navigation works
- [ ] IndexedDB initializes on first load with correct schema
- [ ] Stores react to DB changes
- [ ] Route guards redirect unonboarded users to onboarding
- [ ] Lighthouse accessibility score >= 90
- [ ] `npm run check` passes

## Dependencies

- Existing Zod types in `src/lib/types/` (domain.ts, sync.ts)

## Reference Docs

- docs/APP-NAVIGATION.md (full route structure)
- docs/ACCESSIBILITY.md (a11y requirements)
- docs/P2P-SYNC-PROTOCOL.md (DB schema details)
