# App Navigation & UI Flows Specification

Technical specification for the Inward app navigation structure, routing, and user flow patterns.

---

## Table of Contents

1. [Overview](#overview)
2. [Route Structure](#route-structure)
3. [Navigation Model](#navigation-model)
4. [Page Specifications](#page-specifications)
5. [Layout Components](#layout-components)
6. [User Flow Diagrams](#user-flow-diagrams)
7. [TypeScript Types](#typescript-types)
8. [Navigation State Management](#navigation-state-management)

---

## Overview

### Goals

The navigation system supports three core objectives:

1. **Simplicity** - Minimal cognitive load for users who may have attention difficulties
2. **Discoverability** - Clear paths to all features without overwhelming options
3. **Context Preservation** - Maintain state during exercise sessions and flows

### Design Principles

| Principle              | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| **Flat hierarchy**     | Maximum 2 levels deep from any primary destination       |
| **Persistent nav**     | Bottom navigation always visible except during exercises |
| **Progressive reveal** | Advanced features unlock as users progress               |
| **Offline-first**      | All navigation works without network connectivity        |

---

## Route Structure

### SvelteKit Route Groups

Routes are organized using SvelteKit route groups for shared layouts:

```
src/routes/
├── +layout.svelte              # Root layout (theme, providers)
├── +page.svelte                # Redirect to appropriate start
├── +error.svelte               # Global error page
│
├── (onboarding)/               # Onboarding flow group
│   ├── +layout.svelte          # Onboarding shell (no bottom nav)
│   ├── welcome/
│   │   └── +page.svelte
│   ├── what-is-interoception/
│   │   └── +page.svelte
│   ├── privacy/
│   │   └── +page.svelte
│   ├── assessment/
│   │   └── +page.svelte
│   ├── first-exercise/
│   │   └── +page.svelte
│   └── complete/
│       └── +page.svelte
│
├── (app)/                      # Main app group
│   ├── +layout.svelte          # App shell (with bottom nav)
│   ├── dashboard/
│   │   └── +page.svelte        # Home/Dashboard
│   ├── exercises/
│   │   ├── +page.svelte        # Exercise library
│   │   └── [category]/
│   │       └── +page.svelte    # Category view
│   ├── vocabulary/
│   │   ├── +page.svelte        # Vocabulary browser
│   │   ├── my/
│   │   │   └── +page.svelte    # Personal vocabulary
│   │   └── discover/
│   │       └── +page.svelte    # Shared vocabulary discovery
│   ├── progress/
│   │   ├── +page.svelte        # Progress overview
│   │   └── assessment/
│   │       └── +page.svelte    # MAIA-2 assessment
│   └── settings/
│       ├── +page.svelte        # Settings hub
│       ├── accessibility/
│       │   └── +page.svelte
│       ├── data/
│       │   └── +page.svelte    # Export/delete data
│       └── about/
│           └── +page.svelte
│
└── (exercise)/                 # Exercise player group
    ├── +layout.svelte          # Exercise shell (fullscreen, no nav)
    └── play/
        └── [exerciseId]/
            └── +page.svelte    # Exercise player
```

### Route Parameters

| Route Pattern                   | Parameter    | Description                 |
| ------------------------------- | ------------ | --------------------------- |
| `/(app)/exercises/[category]`   | `category`   | ExerciseCategory enum value |
| `/(exercise)/play/[exerciseId]` | `exerciseId` | UUID of exercise to play    |

### Route Guards

```typescript
// src/routes/(app)/+layout.ts
import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { onboardingComplete } from '$lib/stores/onboarding';
import { get } from 'svelte/store';

export const load: LayoutLoad = async () => {
    if (!get(onboardingComplete)) {
        throw redirect(307, '/welcome');
    }
};
```

---

## Navigation Model

### Bottom Navigation

Primary navigation uses a bottom tab bar with 4 destinations:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        [Page Content]                           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Home   │  │Practice │  │  Words  │  │Progress │            │
│  │   🏠    │  │   🧘    │  │   📝    │  │   📊    │            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

| Tab          | Route         | Icon     | Description                    |
| ------------ | ------------- | -------- | ------------------------------ |
| **Home**     | `/dashboard`  | Home     | Daily overview, quick actions  |
| **Practice** | `/exercises`  | Activity | Exercise library and player    |
| **Words**    | `/vocabulary` | BookOpen | Personal and shared vocabulary |
| **Progress** | `/progress`   | BarChart | Stats, MAIA scores, insights   |

### Navigation Visibility

| Context           | Bottom Nav | Back Button | Close Button |
| ----------------- | ---------- | ----------- | ------------ |
| Onboarding flow   | Hidden     | Shown       | Hidden       |
| Main app pages    | Shown      | Conditional | Hidden       |
| Exercise player   | Hidden     | Hidden      | Shown        |
| Settings subpages | Shown      | Shown       | Hidden       |
| Modal overlays    | Hidden     | Hidden      | Shown        |

### Navigation Transitions

```typescript
// Page transition directions
type TransitionDirection = 'forward' | 'back' | 'none';

// Determine transition based on navigation
function getTransitionDirection(from: string, to: string): TransitionDirection {
    const navOrder = ['/dashboard', '/exercises', '/vocabulary', '/progress'];
    const fromIndex = navOrder.indexOf(from);
    const toIndex = navOrder.indexOf(to);

    if (fromIndex === -1 || toIndex === -1) return 'none';
    return toIndex > fromIndex ? 'forward' : 'back';
}
```

---

## Page Specifications

### Dashboard (`/dashboard`)

**Purpose**: Daily hub showing personalized content and quick actions.

```
┌─────────────────────────────────────────────────────────────────┐
│ Good morning, [Name]                              ⚙️ Settings   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔥 5 Day Streak                                         │   │
│  │  Keep going! Practice today to maintain your streak.    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Today's Practice                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ❤️  Heart After Movement                    [Start →]   │   │
│  │  Recommended based on your progress                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Quick Stats                                                    │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                   │
│  │    12     │  │     8     │  │    3.2    │                   │
│  │ Sessions  │  │   Words   │  │   MAIA    │                   │
│  └───────────┘  └───────────┘  └───────────┘                   │
│                                                                 │
│  Recent Activity                                                │
│  • Completed "Stomach at Rest" yesterday                        │
│  • Added word "fluttery" 2 days ago                            │
│  • 3 people confirmed "butterflies"                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- `StreakCard` - Current streak with encouragement
- `RecommendedExercise` - Personalized exercise suggestion
- `QuickStats` - Key metrics at a glance
- `RecentActivity` - Timeline of recent actions

### Exercise Library (`/exercises`)

**Purpose**: Browse and select exercises by category.

```
┌─────────────────────────────────────────────────────────────────┐
│ Practice                                           🔍 Search    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Categories                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  🫀 Heartbeat       │  │  🫁 Breathing       │              │
│  │  Detection          │  │  Awareness          │              │
│  │  4 exercises        │  │  3 exercises        │              │
│  └─────────────────────┘  └─────────────────────┘              │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  🏃 Movement        │  │  🧘 Body Scan       │              │
│  │  Integrated         │  │                     │              │
│  │  5 exercises        │  │  2 exercises        │              │
│  └─────────────────────┘  └─────────────────────┘              │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  🎯 Focused         │  │  🌡️ Thermal        │              │
│  │  Attention          │  │  Awareness          │              │
│  │  3 exercises        │  │  2 exercises 🔒     │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│  All Exercises                            [Filter ▼] [Sort ▼]  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ❤️  Heart After Movement              Beginner  2 min  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  🫁  Breath Counting                   Beginner  3 min  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  🧘  Full Body Scan                    Advanced  8 min  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- `CategoryGrid` - Grid of exercise categories
- `CategoryCard` - Individual category with count and lock state
- `ExerciseList` - Scrollable list with filters
- `ExerciseCard` - Exercise preview with metadata

### Vocabulary Browser (`/vocabulary`)

**Purpose**: View and manage personal vocabulary, discover shared words.

```
┌─────────────────────────────────────────────────────────────────┐
│ Words                                              🔍 Search    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │   My Words  │  │  Discover   │                              │
│  └─────────────┘  └─────────────┘                              │
│                                                                 │
│  Filter by body region                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ All  │ │Heart │ │Stomach│ │Chest │ │Throat│ │Hands │ →      │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
│                                                                 │
│  My Words (8)                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  "fluttery"                              Heart  Private │   │
│  │  Added Jan 28 • From: Heart After Movement              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  "tight knot"                          Stomach  Shared  │   │
│  │  Added Jan 25 • 3 confirmations                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  "buzzing"                              Hands   Private │   │
│  │  Added Jan 20 • Linked to: anxiety                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Add Word]                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- `VocabularyTabs` - Switch between My Words and Discover
- `BodyRegionFilter` - Horizontal scrolling filter chips
- `WordList` - List of vocabulary entries
- `WordCard` - Individual word with metadata
- `AddWordButton` - FAB to add vocabulary manually

### Progress Dashboard (`/progress`)

**Purpose**: View progress metrics, MAIA scores, and insights.

See [PROGRESS-DASHBOARD.md](./PROGRESS-DASHBOARD.md) for detailed specification.

---

## Layout Components

### Root Layout (`+layout.svelte`)

Provides global context and theme:

```svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import { initializeStores } from '$lib/stores';
    import { ThemeProvider } from '$lib/components';

    onMount(async () => {
        await initializeStores();
    });
</script>

<ThemeProvider>
    <slot />
</ThemeProvider>
```

### App Shell (`(app)/+layout.svelte`)

Standard app layout with bottom navigation:

```svelte
<script lang="ts">
    import { page } from '$app/stores';
    import { BottomNav } from '$lib/components';
</script>

<div class="app-shell">
    <main class="app-content">
        <slot />
    </main>

    <BottomNav currentPath={$page.url.pathname} />
</div>

<style>
    .app-shell {
        display: flex;
        flex-direction: column;
        height: 100dvh;
    }

    .app-content {
        flex: 1;
        overflow-y: auto;
        padding-bottom: env(safe-area-inset-bottom);
    }
</style>
```

### Onboarding Shell (`(onboarding)/+layout.svelte`)

Minimal layout for onboarding flow:

```svelte
<script lang="ts">
    import { OnboardingProgress } from '$lib/components';
    import { onboardingStep } from '$lib/stores/onboarding';
</script>

<div class="onboarding-shell">
    <OnboardingProgress step={$onboardingStep} totalSteps={6} />

    <main class="onboarding-content">
        <slot />
    </main>
</div>

<style>
    .onboarding-shell {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        padding: var(--spacing-4);
    }

    .onboarding-content {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
</style>
```

### Exercise Shell (`(exercise)/+layout.svelte`)

Fullscreen layout for exercise player:

```svelte
<script lang="ts">
    import { ExerciseHeader } from '$lib/components';
</script>

<div class="exercise-shell">
    <ExerciseHeader />

    <main class="exercise-content">
        <slot />
    </main>
</div>

<style>
    .exercise-shell {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        background: var(--color-surface-elevated);
    }

    .exercise-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--spacing-6);
    }
</style>
```

---

## User Flow Diagrams

### First-Time User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      First-Time User Flow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [App Launch]                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────┐    Skip available    ┌─────────────┐               │
│  │ Welcome │ ──────────────────── │  Dashboard  │               │
│  └────┬────┘                      └─────────────┘               │
│       │ Continue                         ▲                       │
│       ▼                                  │                       │
│  ┌─────────────────────┐                 │                       │
│  │ What is             │                 │                       │
│  │ Interoception?      │                 │                       │
│  └──────────┬──────────┘                 │                       │
│             │                            │                       │
│             ▼                            │                       │
│  ┌─────────────────────┐                 │                       │
│  │ Privacy & Data      │                 │                       │
│  └──────────┬──────────┘                 │                       │
│             │                            │                       │
│             ▼                            │                       │
│  ┌─────────────────────┐    Skip        │                       │
│  │ Initial Assessment  │ ───────────────┤                       │
│  │ (Optional MAIA-2)   │                │                       │
│  └──────────┬──────────┘                │                       │
│             │ Complete                   │                       │
│             ▼                            │                       │
│  ┌─────────────────────┐                 │                       │
│  │ First Exercise      │                 │                       │
│  └──────────┬──────────┘                 │                       │
│             │                            │                       │
│             ▼                            │                       │
│  ┌─────────────────────┐                 │                       │
│  │ Onboarding Complete │ ────────────────┘                       │
│  └─────────────────────┘                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Exercise Session Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Exercise Session Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Dashboard/Library]                                             │
│       │                                                          │
│       │ Select exercise                                          │
│       ▼                                                          │
│  ┌─────────────────────┐                                        │
│  │ Exercise Preview    │                                        │
│  │ • Description       │                                        │
│  │ • Duration          │                                        │
│  │ • Body regions      │                                        │
│  └──────────┬──────────┘                                        │
│             │ Start                                              │
│             ▼                                                    │
│  ┌─────────────────────┐    Exit     ┌─────────────────────┐   │
│  │ Exercise Player     │ ──────────▶ │ Confirm Exit?       │   │
│  │ (Phase sequence)    │             │ • Save progress     │   │
│  └──────────┬──────────┘             │ • Discard           │   │
│             │                        └─────────────────────┘   │
│             │ Complete all phases                               │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ Session Summary     │                                        │
│  │ • Words created     │                                        │
│  │ • Emotions linked   │                                        │
│  │ • Rate difficulty   │                                        │
│  └──────────┬──────────┘                                        │
│             │ Done                                               │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ Dashboard           │                                        │
│  │ (Updated stats)     │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Vocabulary Discovery Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Vocabulary Discovery Flow                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Vocabulary Browser]                                            │
│       │                                                          │
│       │ Tap "Discover" tab                                       │
│       ▼                                                          │
│  ┌─────────────────────┐                                        │
│  │ Browse Shared Words │                                        │
│  │ • Filter by region  │                                        │
│  │ • Filter by emotion │                                        │
│  │ • Sort by popular   │                                        │
│  └──────────┬──────────┘                                        │
│             │ Tap word                                           │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ Word Detail         │                                        │
│  │ • Full description  │                                        │
│  │ • Body region       │                                        │
│  │ • Confirmation count│                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│     ┌───────┴───────┐                                           │
│     │               │                                            │
│     ▼               ▼                                            │
│  ┌─────────┐   ┌─────────────────┐                              │
│  │ "Me too"│   │ "Add to my      │                              │
│  │ Confirm │   │  vocabulary"    │                              │
│  └────┬────┘   └────────┬────────┘                              │
│       │                 │                                        │
│       ▼                 ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Success: "Your confirmation helps others find this word"    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## TypeScript Types

### Navigation Types

```typescript
import { z } from 'zod';

/**
 * Primary navigation destinations (bottom nav tabs).
 */
export const NavDestination = z.enum(['dashboard', 'exercises', 'vocabulary', 'progress']);

export type NavDestination = z.infer<typeof NavDestination>;

/**
 * Route group identifiers.
 */
export const RouteGroup = z.enum(['onboarding', 'app', 'exercise']);

export type RouteGroup = z.infer<typeof RouteGroup>;

/**
 * Navigation item configuration.
 */
export const NavItem = z.object({
    destination: NavDestination,
    path: z.string(),
    label: z.string(),
    icon: z.string(),
    badge: z.number().optional(),
});

export type NavItem = z.infer<typeof NavItem>;

/**
 * Page metadata for navigation and analytics.
 */
export const PageMeta = z.object({
    title: z.string(),
    group: RouteGroup,
    destination: NavDestination.optional(),
    requiresAuth: z.boolean().default(false),
    showBottomNav: z.boolean().default(true),
    showBackButton: z.boolean().default(false),
});

export type PageMeta = z.infer<typeof PageMeta>;
```

### Navigation State

```typescript
/**
 * Current navigation state stored in context.
 */
export const NavigationState = z.object({
    currentPath: z.string(),
    currentGroup: RouteGroup,
    currentDestination: NavDestination.optional(),
    previousPath: z.string().optional(),
    canGoBack: z.boolean(),
    isTransitioning: z.boolean(),
});

export type NavigationState = z.infer<typeof NavigationState>;

/**
 * Navigation history entry.
 */
export const HistoryEntry = z.object({
    path: z.string(),
    timestamp: z.date(),
    group: RouteGroup,
    scrollPosition: z.number().optional(),
});

export type HistoryEntry = z.infer<typeof HistoryEntry>;
```

### Deep Link Types

```typescript
/**
 * Supported deep link schemas.
 */
export const DeepLinkSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('exercise'),
        exerciseId: z.string().uuid(),
    }),
    z.object({
        type: z.literal('vocabulary'),
        descriptionId: z.string().uuid(),
    }),
    z.object({
        type: z.literal('category'),
        category: z.string(), // ExerciseCategory
    }),
]);

export type DeepLinkSchema = z.infer<typeof DeepLinkSchema>;
```

---

## Navigation State Management

### Navigation Store

```typescript
import { writable, derived } from 'svelte/store';

interface NavigationStore {
    currentPath: string;
    history: HistoryEntry[];
    isTransitioning: boolean;
}

function createNavigationStore() {
    const { subscribe, set, update } = writable<NavigationStore>({
        currentPath: '/dashboard',
        history: [],
        isTransitioning: false,
    });

    return {
        subscribe,

        navigate(path: string) {
            update(state => ({
                ...state,
                previousPath: state.currentPath,
                currentPath: path,
                history: [
                    ...state.history,
                    {
                        path: state.currentPath,
                        timestamp: new Date(),
                        group: getRouteGroup(state.currentPath),
                    },
                ],
            }));
        },

        goBack() {
            update(state => {
                const previous = state.history.pop();
                return {
                    ...state,
                    currentPath: previous?.path ?? '/dashboard',
                    history: state.history,
                };
            });
        },

        setTransitioning(isTransitioning: boolean) {
            update(state => ({ ...state, isTransitioning }));
        },
    };
}

export const navigationStore = createNavigationStore();

// Derived stores
export const currentGroup = derived(navigationStore, $nav => getRouteGroup($nav.currentPath));

export const canGoBack = derived(navigationStore, $nav => $nav.history.length > 0);
```

### Route Group Detection

```typescript
function getRouteGroup(path: string): RouteGroup {
    if (
        path.startsWith('/welcome') ||
        path.startsWith('/what-is-interoception') ||
        path.startsWith('/privacy') ||
        path.startsWith('/assessment') ||
        path.startsWith('/first-exercise') ||
        path.startsWith('/complete')
    ) {
        return 'onboarding';
    }

    if (path.startsWith('/play/')) {
        return 'exercise';
    }

    return 'app';
}

function getNavDestination(path: string): NavDestination | undefined {
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/exercises')) return 'exercises';
    if (path.startsWith('/vocabulary')) return 'vocabulary';
    if (path.startsWith('/progress')) return 'progress';
    return undefined;
}
```

---

## Related Specifications

- [ONBOARDING-FLOW.md](./ONBOARDING-FLOW.md) - First-time user experience
- [EXERCISE-PLAYER-UI.md](./EXERCISE-PLAYER-UI.md) - Exercise player interface
- [PROGRESS-DASHBOARD.md](./PROGRESS-DASHBOARD.md) - Progress visualization
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Navigation accessibility requirements

---

_Last updated: February 2026_
