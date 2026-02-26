# AGENTS.md - Operational Guide

Keep this file under 60 lines. It's loaded every iteration.

## Build Commands

```bash
npm run dev            # Start SvelteKit dev server
npm run build          # Production build (static site)
npm run preview        # Preview production build
```

## Test Commands

```bash
npm test               # Vitest watch mode
npm run test:run       # Run tests once
npm run test:coverage  # Coverage report (80% threshold)
npm run test:e2e       # Run Playwright E2E tests
```

## Validation (run before finishing)

```bash
npm run check          # Run ALL checks (typecheck, lint, format, knip, tests)
```

## Tech Stack

- SvelteKit with Svelte 5 runes (`$state`, `$derived`)
- TypeScript strict mode
- Zod for runtime validation
- IndexedDB via `idb` for persistence
- Static adapter (PWA)

## Key Patterns

- Component imports use `$lib` alias
- Routes in `src/routes/`, shared code in `src/lib/`
- Existing Zod schemas in `src/lib/types/domain.ts` and `src/lib/types/sync.ts`
- Specs in `specs/` (numbered 01-06), reference docs in `docs/`
- ESLint: max complexity 10, max depth 4, max 50 lines/function, no `any`
- Minimum 80% test coverage

## Project Notes

- Offline-first: all data in IndexedDB, sync is background
- Privacy-first: anonymous sharing, no accounts
- Accessibility: WCAG 2.2 AA, 44x44px touch targets, prefers-reduced-motion
- Target users: alexithymia, anxiety, autism, ADHD
