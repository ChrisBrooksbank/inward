# CLAUDE.md

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

Inward is a Progressive Web App for interoception training - helping people recognize and describe internal body sensations. It targets people with alexithymia, anxiety, autism, ADHD, and other conditions that affect interoceptive awareness.

## Technology Stack

- **SvelteKit** - Full-stack framework with file-based routing
- **Svelte 5** - Reactive UI components (minimal bundle ~2KB)
- **TypeScript** - Strict type checking
- **Zod** - Runtime validation
- **IndexedDB** (via idb) - Local data persistence

## Development Commands

```bash
npm run dev            # Start SvelteKit dev server
npm run build          # Production build (static site)
npm run preview        # Preview production build
npm test               # Vitest watch mode
npm run test:run       # Run tests once
npm run test:coverage  # Coverage report (80% threshold)
npm run test:e2e       # Run Playwright E2E tests
npm run lint           # ESLint + svelte-check
npm run format         # Prettier format all files
npm run check          # Run ALL checks (typecheck, lint, format, knip, tests)
```

## Architecture

### SvelteKit Project Structure

```
src/
├── routes/              # File-based routing (SvelteKit)
│   ├── +page.svelte     # Home/Dashboard
│   ├── +layout.svelte   # Root layout
│   └── ...              # Additional routes
├── lib/                 # Shared code ($lib alias)
│   ├── components/      # Reusable Svelte components
│   ├── stores/          # Svelte stores for state
│   ├── core/            # Business logic
│   ├── db/              # IndexedDB operations
│   ├── utils/           # Helpers (logger, etc.)
│   └── types/           # TypeScript types
├── app.html             # HTML template
└── app.d.ts             # App-level type declarations
static/                  # Static assets (icons, etc.)
e2e/                     # Playwright E2E tests
```

### Key Patterns

**Svelte 5 Runes (reactivity):**

```svelte
<script lang="ts">
    let count = $state(0);
    let doubled = $derived(count * 2);

    function increment() {
        count++;
    }
</script>
```

**Svelte Stores (shared state):**

```typescript
import { writable } from 'svelte/store';

export const userProfile = writable<UserProfile | null>(null);
```

**Component imports use $lib alias:**

```svelte
<script lang="ts">
    import { Button } from '$lib/components';
</script>
```

## Quality Guardrails

This project has strict quality checks that run:

1. **On save** - TypeScript + svelte-check in editor
2. **On commit** - Pre-commit hook runs typecheck + lint-staged
3. **On push** - CI runs full check suite + E2E tests
4. **Periodically** - Run `npm run check` to find issues

### ESLint Rules

- `complexity: 10` - Functions should have low cyclomatic complexity
- `max-depth: 4` - Avoid deeply nested code
- `max-lines-per-function: 50` - Keep functions small
- `no-explicit-any: error` - No `any` types allowed

### Test Coverage

- Minimum 80% coverage required for statements, branches, functions, lines
- Unit tests in `*.test.ts` files in `src/lib/`
- E2E tests in `e2e/` directory using Playwright

## Domain Knowledge

### Interoception

Interoception is the sense of the internal state of the body - detecting signals like hunger, thirst, heartbeat, temperature, pain, and emotional sensations. Poor interoceptive awareness is linked to:

- Anxiety disorders
- Autism spectrum conditions
- ADHD
- Eating disorders
- Alexithymia (difficulty identifying emotions)
- Trauma/PTSD

### Training Approach

Based on research by Sarah Garfinkel and others, interoceptive accuracy is trainable. The app will help users:

1. **Notice** - Guided attention to specific body regions
2. **Describe** - Build vocabulary for internal sensations
3. **Connect** - Link physical sensations to emotional states
4. **Share** - Peer-to-peer vocabulary sharing for collective learning

### P2P Model

Users contribute descriptions of their sensations in their own words. Others can:

- Confirm "yes, I feel this too"
- Discover new vocabulary for experiences they couldn't describe
- Build collective understanding across different conditions
