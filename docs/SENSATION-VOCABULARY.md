# Sensation Vocabulary Specification

Technical specification for the Inward sensation vocabulary system and peer-to-peer sharing model.

---

## Table of Contents

1. [Overview](#overview)
2. [Domain Model](#domain-model)
3. [Type Definitions](#type-definitions)
4. [Body Region Mappings](#body-region-mappings)
5. [Emotional-Physical Mappings](#emotional-physical-mappings)
6. [P2P Sharing Model](#p2p-sharing-model)
7. [Database Schema](#database-schema)
8. [Seed Vocabulary](#seed-vocabulary)
9. [Store Interface](#store-interface)
10. [Search Algorithm](#search-algorithm)

---

## Overview

### Goals

The vocabulary system supports three core objectives:

1. **Personal Vocabulary** - Help users develop their own language for internal sensations
2. **P2P Discovery** - Enable users to discover vocabulary from others' descriptions
3. **Alexithymia Intervention** - Address vocabulary deficits through shared language

### Research Foundation

From the research literature:

> "Building language for internal sensations is a validated training mechanism." - INTEROCEPTION-RESEARCH.md

> "Vocabulary building interventions improve both interoception and alexithymia." - Brewer et al., 2016

The P2P model is scientifically supported:

- Personal terminology outperforms prescribed vocabulary
- "Discovering new words for experiences" aligns with alexithymia intervention research
- Confirmation mechanism ("Yes, I feel this too") validates shared vocabulary

---

## Domain Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     Vocabulary Domain Model                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────────┐                  │
│  │    User      │ creates │   Sensation      │                  │
│  │   Profile    │────────>│  Description     │                  │
│  └──────────────┘         └────────┬─────────┘                  │
│         │                          │                             │
│         │                          │ may become                  │
│         │                          ▼                             │
│         │                 ┌──────────────────┐                  │
│         │    confirms     │     Shared       │                  │
│         └────────────────>│   Description    │                  │
│                           └────────┬─────────┘                  │
│                                    │                             │
│                                    │ receives                    │
│                                    ▼                             │
│                           ┌──────────────────┐                  │
│                           │  Confirmation    │                  │
│                           │     (P2P)        │                  │
│                           └──────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Entity Relationships

- **User** creates many **SensationDescriptions**
- **SensationDescription** may be shared as **SharedDescription**
- **User** may confirm many **SharedDescriptions**
- **Confirmation** links User to SharedDescription

---

## Type Definitions

### Vocabulary Category

Categories help organize and search vocabulary:

```typescript
import { z } from 'zod';

export const VocabularyCategory = z.enum([
    'physical', // Direct physical sensations (tight, warm, heavy)
    'emotional', // Emotion-body connections (anxious flutter, calm warmth)
    'metaphorical', // Figurative descriptions (butterflies, knot, weight)
    'quality', // Sensation qualities (sharp, dull, pulsing)
    'intensity', // Intensity descriptors (slight, moderate, overwhelming)
]);

export type VocabularyCategory = z.infer<typeof VocabularyCategory>;
```

### Sharing Level

Privacy controls for vocabulary sharing:

```typescript
export const SharingLevel = z.enum([
    'private', // Only visible to creator
    'anonymous', // Shared without attribution
    'attributed', // Shared with optional username
]);

export type SharingLevel = z.infer<typeof SharingLevel>;
```

### Confirmation Status

Track how shared vocabulary is received:

```typescript
export const ConfirmationStatus = z.enum([
    'unconfirmed', // Not yet confirmed by others
    'confirmed', // At least one confirmation
    'popular', // Many confirmations (threshold: 5+)
]);

export type ConfirmationStatus = z.infer<typeof ConfirmationStatus>;
```

### Sensation Description

Core vocabulary unit - a user's description of a sensation:

```typescript
import { BodyRegion, SignalType } from './exercise-system';

export const SensationDescription = z.object({
    id: z.string().uuid(),

    // Content
    text: z.string().min(1).max(200),
    category: VocabularyCategory,

    // Context
    bodyRegion: BodyRegion,
    signalType: SignalType.optional(),
    emotionConnection: z.string().max(50).optional(),

    // Source
    exerciseId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),

    // Metadata
    createdAt: z.date(),
    updatedAt: z.date(),

    // Sharing
    sharingLevel: SharingLevel.default('private'),
    sharedAt: z.date().optional(),
});

export type SensationDescription = z.infer<typeof SensationDescription>;
```

### Shared Description

Extended schema for P2P shared vocabulary:

```typescript
export const SharedDescription = z.object({
    id: z.string().uuid(),

    // Content (from SensationDescription)
    text: z.string().min(1).max(200),
    category: VocabularyCategory,
    bodyRegion: BodyRegion,
    signalType: SignalType.optional(),
    emotionConnection: z.string().max(50).optional(),

    // Attribution
    sharingLevel: SharingLevel,
    contributorId: z.string().uuid().optional(), // null if anonymous
    contributorName: z.string().max(50).optional(),

    // P2P metrics
    confirmationCount: z.number().default(0),
    confirmationStatus: ConfirmationStatus.default('unconfirmed'),

    // Timestamps
    sharedAt: z.date(),
    lastConfirmedAt: z.date().optional(),
});

export type SharedDescription = z.infer<typeof SharedDescription>;
```

### User Vocabulary Profile

Aggregated vocabulary statistics for a user:

```typescript
export const UserVocabularyProfile = z.object({
    userId: z.string().uuid(),

    // Counts
    totalDescriptions: z.number(),
    sharedDescriptions: z.number(),
    confirmationsReceived: z.number(),
    confirmationsGiven: z.number(),

    // Coverage
    bodyRegionsCovered: z.array(BodyRegion),
    categoriesUsed: z.array(VocabularyCategory),

    // Discovery
    vocabularyDiscovered: z.number(), // Adopted from others

    // Timestamps
    firstDescriptionAt: z.date().optional(),
    lastDescriptionAt: z.date().optional(),
});

export type UserVocabularyProfile = z.infer<typeof UserVocabularyProfile>;
```

### Vocabulary Confirmation

Records when a user confirms shared vocabulary:

```typescript
export const VocabularyConfirmation = z.object({
    id: z.string().uuid(),
    sharedDescriptionId: z.string().uuid(),
    userId: z.string().uuid(),
    confirmedAt: z.date(),

    // Optional context
    bodyRegion: BodyRegion.optional(), // May differ from original
    note: z.string().max(100).optional(),
});

export type VocabularyConfirmation = z.infer<typeof VocabularyConfirmation>;
```

### Search Parameters and Results

```typescript
export const VocabularySearchParams = z.object({
    query: z.string().optional(),
    bodyRegion: BodyRegion.optional(),
    signalType: SignalType.optional(),
    category: VocabularyCategory.optional(),
    emotionConnection: z.string().optional(),
    includeShared: z.boolean().default(true),
    includePersonal: z.boolean().default(true),
    minConfirmations: z.number().optional(),
    limit: z.number().default(20),
    offset: z.number().default(0),
});

export type VocabularySearchParams = z.infer<typeof VocabularySearchParams>;

export const VocabularySearchResult = z.object({
    descriptions: z.array(z.union([SensationDescription, SharedDescription])),
    totalCount: z.number(),
    hasMore: z.boolean(),
});

export type VocabularySearchResult = z.infer<typeof VocabularySearchResult>;
```

---

## Body Region Mappings

### Common Sensations by Region

Seed vocabulary organized by body region:

| Body Region   | Common Physical Sensations                       | Common Metaphors               |
| ------------- | ------------------------------------------------ | ------------------------------ |
| **heart**     | pounding, racing, fluttering, thumping, skipping | heart in throat, heart sinking |
| **stomach**   | churning, tight, hollow, full, queasy, warm      | butterflies, pit, knot         |
| **lungs**     | tight, expanding, constricted, full, empty       | can't breathe, weight on chest |
| **throat**    | tight, lump, constricted, dry, thick             | choked up, words stuck         |
| **chest**     | tight, heavy, open, warm, pressure               | weight, expanding, caving in   |
| **hands**     | tingling, cold, warm, sweaty, trembling          | electric, buzzing              |
| **feet**      | tingling, cold, warm, heavy, light               | grounded, floating             |
| **face**      | hot, flushed, tight, tingling                    | burning, mask                  |
| **shoulders** | tight, heavy, raised, relaxed, knotted           | weight of world, dropped       |
| **jaw**       | clenched, tight, loose, aching                   | locked, set                    |
| **neck**      | stiff, tight, loose, warm                        | tension, blocked               |
| **back**      | tense, aching, warm, straight, curved            | carrying weight, supported     |
| **abdomen**   | tight, soft, churning, warm, hollow              | center, core                   |
| **forehead**  | tight, pressing, warm, cool, furrowed            | band, vice                     |

### Signal Type Associations

```typescript
const regionSignalMap: Record<BodyRegion, SignalType[]> = {
    heart: ['cardiac'],
    stomach: ['gastric', 'affective'],
    lungs: ['respiratory'],
    throat: ['muscular', 'affective'],
    chest: ['cardiac', 'respiratory', 'affective'],
    hands: ['thermal', 'muscular'],
    feet: ['thermal', 'muscular'],
    face: ['thermal', 'muscular'],
    shoulders: ['muscular', 'nociceptive'],
    jaw: ['muscular', 'nociceptive'],
    neck: ['muscular', 'nociceptive'],
    back: ['muscular', 'nociceptive'],
    abdomen: ['gastric', 'muscular'],
    forehead: ['muscular', 'thermal'],
    arms: ['muscular', 'thermal'],
    legs: ['muscular', 'thermal'],
};
```

---

## Emotional-Physical Mappings

### Common Emotion-Body Connections

Research-based mappings between emotions and typical body sensations:

#### Anxiety

| Body Region | Common Sensations                  |
| ----------- | ---------------------------------- |
| chest       | tight, constricted, pressure       |
| stomach     | churning, butterflies, nausea      |
| throat      | tight, lump, difficulty swallowing |
| hands       | cold, sweaty, trembling            |
| heart       | racing, pounding, irregular        |

#### Anger

| Body Region | Common Sensations          |
| ----------- | -------------------------- |
| face        | hot, flushed, jaw clenched |
| chest       | hot, expanding, pressure   |
| hands       | clenched, hot, trembling   |
| stomach     | tight, burning             |
| shoulders   | raised, tense              |

#### Sadness

| Body Region | Common Sensations         |
| ----------- | ------------------------- |
| chest       | heavy, aching, hollow     |
| throat      | tight, lump, choked       |
| eyes        | pressure, stinging, heavy |
| stomach     | empty, sinking            |
| whole body  | heavy, tired, drained     |

#### Joy

| Body Region | Common Sensations            |
| ----------- | ---------------------------- |
| chest       | warm, open, expanding        |
| face        | warm, smiling, relaxed       |
| stomach     | butterflies (pleasant), warm |
| whole body  | light, energized, buzzing    |

#### Fear

| Body Region | Common Sensations         |
| ----------- | ------------------------- |
| heart       | racing, pounding, stopped |
| stomach     | dropping, tight, nausea   |
| chest       | tight, frozen             |
| hands       | cold, sweaty              |
| legs        | weak, trembling, frozen   |

#### Calm

| Body Region | Common Sensations          |
| ----------- | -------------------------- |
| chest       | open, soft, warm           |
| shoulders   | dropped, relaxed           |
| stomach     | settled, soft, warm        |
| face        | relaxed, soft              |
| whole body  | heavy (pleasant), grounded |

---

## P2P Sharing Model

### Sharing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        P2P Sharing Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User A                           User B                         │
│  ───────                          ───────                        │
│     │                                │                           │
│     │ 1. Creates description         │                           │
│     │    "butterflies in stomach"    │                           │
│     │                                │                           │
│     │ 2. Shares (anonymous)          │                           │
│     │──────────────────────────────> │                           │
│     │                                │                           │
│     │                                │ 3. Discovers via search   │
│     │                                │    or browse              │
│     │                                │                           │
│     │                                │ 4. Confirms:              │
│     │ <──────────────────────────────│    "Yes, I feel this"     │
│     │                                │                           │
│     │ 5. Receives confirmation       │                           │
│     │    notification (optional)     │                           │
│     │                                │                           │
│     │                                │ 5. Adds to personal       │
│     │                                │    vocabulary (optional)  │
│     │                                │                           │
└─────────────────────────────────────────────────────────────────┘
```

### Privacy Rules

| Sharing Level | Visible to Others | Attribution       |
| ------------- | ----------------- | ----------------- |
| `private`     | No                | N/A               |
| `anonymous`   | Yes               | None              |
| `attributed`  | Yes               | Optional username |

### Confirmation Rules

1. Users cannot confirm their own descriptions
2. Each user can confirm a description only once
3. Confirmations are always anonymous
4. Confirmation count is public; confirmer identity is not

### Discovery Mechanisms

Users discover shared vocabulary through:

1. **Contextual suggestions** - After exercise, see others' words for same body region
2. **Browse by region** - Explore vocabulary organized by body part
3. **Browse by emotion** - Explore vocabulary linked to specific emotions
4. **Search** - Text search across all shared vocabulary
5. **Popular vocabulary** - Most-confirmed descriptions surface first

---

## Database Schema

### IndexedDB Stores

```typescript
interface VocabularyDatabase {
    // Personal descriptions
    descriptions: {
        key: string; // description.id
        value: SensationDescription;
        indexes: {
            'by-body-region': BodyRegion;
            'by-category': VocabularyCategory;
            'by-emotion': string;
            'by-exercise': string;
            'by-created': Date;
            'by-sharing-level': SharingLevel;
        };
    };

    // Shared descriptions (synced from P2P)
    sharedDescriptions: {
        key: string; // sharedDescription.id
        value: SharedDescription;
        indexes: {
            'by-body-region': BodyRegion;
            'by-category': VocabularyCategory;
            'by-emotion': string;
            'by-confirmations': number;
            'by-status': ConfirmationStatus;
        };
    };

    // User's confirmations
    confirmations: {
        key: string; // confirmation.id
        value: VocabularyConfirmation;
        indexes: {
            'by-description': string;
            'by-date': Date;
        };
    };

    // User profile (single record)
    profile: {
        key: 'current';
        value: UserVocabularyProfile;
    };
}
```

### Database Version

```typescript
const DB_NAME = 'inward-vocabulary';
const DB_VERSION = 1;
```

---

## Seed Vocabulary

### Initial Vocabulary Set

Pre-loaded descriptions to bootstrap discovery (~25 terms):

```typescript
const seedVocabulary: Omit<SharedDescription, 'id' | 'sharedAt'>[] = [
    // Heart/Chest - Cardiac
    {
        text: 'pounding',
        category: 'physical',
        bodyRegion: 'heart',
        signalType: 'cardiac',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'fluttering',
        category: 'physical',
        bodyRegion: 'heart',
        signalType: 'cardiac',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'racing',
        category: 'physical',
        bodyRegion: 'heart',
        signalType: 'cardiac',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Stomach - Gastric
    {
        text: 'butterflies',
        category: 'metaphorical',
        bodyRegion: 'stomach',
        signalType: 'gastric',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'churning',
        category: 'physical',
        bodyRegion: 'stomach',
        signalType: 'gastric',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'hollow',
        category: 'physical',
        bodyRegion: 'stomach',
        signalType: 'gastric',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'knot',
        category: 'metaphorical',
        bodyRegion: 'stomach',
        signalType: 'gastric',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Throat
    {
        text: 'lump',
        category: 'metaphorical',
        bodyRegion: 'throat',
        signalType: 'muscular',
        emotionConnection: 'sadness',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'tight',
        category: 'physical',
        bodyRegion: 'throat',
        signalType: 'muscular',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Chest
    {
        text: 'heavy',
        category: 'physical',
        bodyRegion: 'chest',
        signalType: 'affective',
        emotionConnection: 'sadness',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'weight',
        category: 'metaphorical',
        bodyRegion: 'chest',
        signalType: 'affective',
        emotionConnection: 'sadness',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'expanding',
        category: 'physical',
        bodyRegion: 'chest',
        signalType: 'affective',
        emotionConnection: 'joy',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Shoulders
    {
        text: 'knotted',
        category: 'metaphorical',
        bodyRegion: 'shoulders',
        signalType: 'muscular',
        emotionConnection: 'stress',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'raised',
        category: 'physical',
        bodyRegion: 'shoulders',
        signalType: 'muscular',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Hands
    {
        text: 'tingling',
        category: 'physical',
        bodyRegion: 'hands',
        signalType: 'thermal',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'cold and clammy',
        category: 'physical',
        bodyRegion: 'hands',
        signalType: 'thermal',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'trembling',
        category: 'physical',
        bodyRegion: 'hands',
        signalType: 'muscular',
        emotionConnection: 'fear',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Face
    {
        text: 'flushed',
        category: 'physical',
        bodyRegion: 'face',
        signalType: 'thermal',
        emotionConnection: 'anger',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'hot',
        category: 'physical',
        bodyRegion: 'face',
        signalType: 'thermal',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Jaw
    {
        text: 'clenched',
        category: 'physical',
        bodyRegion: 'jaw',
        signalType: 'muscular',
        emotionConnection: 'anger',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Lungs/Breath
    {
        text: 'constricted',
        category: 'physical',
        bodyRegion: 'lungs',
        signalType: 'respiratory',
        emotionConnection: 'anxiety',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'shallow',
        category: 'quality',
        bodyRegion: 'lungs',
        signalType: 'respiratory',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Intensity descriptors
    {
        text: 'subtle',
        category: 'intensity',
        bodyRegion: 'chest', // Generic, applies broadly
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
    {
        text: 'overwhelming',
        category: 'intensity',
        bodyRegion: 'chest',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },

    // Quality descriptors
    {
        text: 'pulsing',
        category: 'quality',
        bodyRegion: 'heart',
        signalType: 'cardiac',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
    },
];
```

---

## Store Interface

### Vocabulary Store

```typescript
import { writable, derived } from 'svelte/store';

interface VocabularyStoreState {
    descriptions: SensationDescription[];
    sharedDescriptions: SharedDescription[];
    confirmations: VocabularyConfirmation[];
    profile: UserVocabularyProfile | null;
    loading: boolean;
    error: string | null;
}

interface VocabularyStore {
    subscribe: Writable<VocabularyStoreState>['subscribe'];

    // Load from IndexedDB
    load(): Promise<void>;

    // Personal vocabulary
    addDescription(
        description: Omit<SensationDescription, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<SensationDescription>;
    updateDescription(id: string, updates: Partial<SensationDescription>): Promise<void>;
    deleteDescription(id: string): Promise<void>;

    // Sharing
    shareDescription(id: string, level: SharingLevel): Promise<SharedDescription>;
    unshareDescription(id: string): Promise<void>;

    // Discovery
    search(params: VocabularySearchParams): Promise<VocabularySearchResult>;
    getByBodyRegion(region: BodyRegion): Promise<SensationDescription[]>;
    getByEmotion(emotion: string): Promise<SensationDescription[]>;
    getPopular(limit?: number): Promise<SharedDescription[]>;

    // Confirmations
    confirmDescription(
        sharedDescriptionId: string,
        context?: { bodyRegion?: BodyRegion; note?: string }
    ): Promise<void>;
    hasConfirmed(sharedDescriptionId: string): boolean;

    // Profile
    getProfile(): UserVocabularyProfile;
    refreshProfile(): Promise<void>;
}

// Derived stores
export const vocabularyByRegion = derived(vocabularyStore, $store => {
    const byRegion = new Map<BodyRegion, SensationDescription[]>();
    for (const desc of $store.descriptions) {
        const list = byRegion.get(desc.bodyRegion) ?? [];
        list.push(desc);
        byRegion.set(desc.bodyRegion, list);
    }
    return byRegion;
});

export const recentVocabulary = derived(vocabularyStore, $store =>
    [...$store.descriptions]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
);

export const confirmedDescriptions = derived(vocabularyStore, $store => {
    const confirmedIds = new Set($store.confirmations.map(c => c.sharedDescriptionId));
    return $store.sharedDescriptions.filter(d => confirmedIds.has(d.id));
});
```

---

## Search Algorithm

### Search Implementation

```typescript
interface SearchContext {
    descriptions: SensationDescription[];
    sharedDescriptions: SharedDescription[];
    confirmations: Set<string>;
}

function searchVocabulary(
    params: VocabularySearchParams,
    context: SearchContext
): VocabularySearchResult {
    let results: (SensationDescription | SharedDescription)[] = [];

    // Collect candidates based on inclusion flags
    if (params.includePersonal) {
        results.push(...context.descriptions);
    }
    if (params.includeShared) {
        results.push(...context.sharedDescriptions);
    }

    // Filter by body region
    if (params.bodyRegion) {
        results = results.filter(d => d.bodyRegion === params.bodyRegion);
    }

    // Filter by signal type
    if (params.signalType) {
        results = results.filter(d => d.signalType === params.signalType);
    }

    // Filter by category
    if (params.category) {
        results = results.filter(d => d.category === params.category);
    }

    // Filter by emotion connection
    if (params.emotionConnection) {
        const emotion = params.emotionConnection.toLowerCase();
        results = results.filter(d => d.emotionConnection?.toLowerCase().includes(emotion));
    }

    // Filter by minimum confirmations (shared only)
    if (params.minConfirmations !== undefined) {
        results = results.filter(d => {
            if ('confirmationCount' in d) {
                return d.confirmationCount >= params.minConfirmations!;
            }
            return true; // Personal descriptions pass through
        });
    }

    // Text search (fuzzy matching)
    if (params.query) {
        const query = params.query.toLowerCase();
        results = results.filter(
            d =>
                d.text.toLowerCase().includes(query) ||
                d.emotionConnection?.toLowerCase().includes(query)
        );
    }

    // Sort: personal first, then by confirmations, then by date
    results.sort((a, b) => {
        // Personal descriptions first
        const aIsPersonal = !('confirmationCount' in a);
        const bIsPersonal = !('confirmationCount' in b);
        if (aIsPersonal && !bIsPersonal) return -1;
        if (!aIsPersonal && bIsPersonal) return 1;

        // Then by confirmation count (for shared)
        if ('confirmationCount' in a && 'confirmationCount' in b) {
            if (b.confirmationCount !== a.confirmationCount) {
                return b.confirmationCount - a.confirmationCount;
            }
        }

        // Then by date (newest first)
        const aDate = 'createdAt' in a ? a.createdAt : a.sharedAt;
        const bDate = 'createdAt' in b ? b.createdAt : b.sharedAt;
        return bDate.getTime() - aDate.getTime();
    });

    // Apply pagination
    const totalCount = results.length;
    const paginatedResults = results.slice(params.offset, params.offset + params.limit);

    return {
        descriptions: paginatedResults,
        totalCount,
        hasMore: params.offset + params.limit < totalCount,
    };
}
```

### Contextual Suggestions

After an exercise, suggest relevant vocabulary:

```typescript
function getSuggestionsForExercise(
    exerciseId: string,
    bodyRegion: BodyRegion,
    context: SearchContext
): SharedDescription[] {
    // Get shared descriptions for this body region
    const regionDescriptions = context.sharedDescriptions
        .filter(d => d.bodyRegion === bodyRegion)
        .filter(d => !context.confirmations.has(d.id)); // Exclude already confirmed

    // Sort by popularity
    return regionDescriptions.sort((a, b) => b.confirmationCount - a.confirmationCount).slice(0, 5);
}
```

---

## Related Specifications

- [Exercise System](./EXERCISE-SYSTEM.md) - Exercise definitions and sessions
- [Interoception Research](./INTEROCEPTION-RESEARCH.md) - Scientific foundation

---

_Last updated: February 2026_
