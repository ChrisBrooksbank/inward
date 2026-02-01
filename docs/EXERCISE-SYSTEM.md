# Exercise System Specification

Technical specification for the Inward interoception training exercise system.

---

## Table of Contents

1. [Overview](#overview)
2. [Exercise Taxonomy](#exercise-taxonomy)
3. [Type Definitions](#type-definitions)
4. [Exercise Phases](#exercise-phases)
5. [Timing Guidelines](#timing-guidelines)
6. [Difficulty Progression](#difficulty-progression)
7. [Database Schema](#database-schema)
8. [Example Exercises](#example-exercises)
9. [Store Interface](#store-interface)

---

## Overview

### Goals

The exercise system supports three core training objectives:

1. **Train Accuracy** - Improve objective detection of internal signals
2. **Build Vocabulary** - Develop personal language for sensations
3. **Progressive Difficulty** - Advance from amplified to subtle signals

### Research Foundation

Based on evidence from:

- **Garfinkel's ADIE therapy** - Feedback-based heartbeat detection training
- **Mahler's curriculum** - Single body-part focus, <60 second activities
- **Mindfulness body scan** - Systematic attention through body regions
- **Physical activity approaches** - Signal amplification through movement

---

## Exercise Taxonomy

Six exercise categories address different training mechanisms:

| Category                | Description                                 | Primary Signal Types       | Key Mechanism           |
| ----------------------- | ------------------------------------------- | -------------------------- | ----------------------- |
| **body-scan**           | Systematic attention through body regions   | All                        | Attention regulation    |
| **focused-attention**   | Sustained focus on single body part at rest | Varies                     | Signal detection        |
| **movement-integrated** | Brief movement followed by noticing         | Cardiac, muscular, thermal | Signal amplification    |
| **heartbeat-detection** | Specific cardiac awareness exercises        | Cardiac                    | Accuracy training       |
| **breath-awareness**    | Respiratory signal focus                    | Respiratory                | Attention + detection   |
| **thermal-awareness**   | Temperature and blood flow attention        | Thermal                    | Subtle signal detection |

### Category Selection Guidelines

| User State          | Recommended Categories                      |
| ------------------- | ------------------------------------------- |
| Beginner            | movement-integrated, body-scan              |
| Low accuracy        | movement-integrated, heartbeat-detection    |
| High anxiety        | breath-awareness, body-scan                 |
| Building vocabulary | focused-attention, body-scan                |
| Advanced            | thermal-awareness, focused-attention (rest) |

---

## Type Definitions

### Body Regions

Based on Mahler's curriculum body parts, organized by detectability:

```typescript
import { z } from 'zod';

export const BodyRegion = z.enum([
    // High signal regions (easier detection)
    'heart',
    'stomach',
    'lungs',
    'throat',

    // Medium signal regions
    'hands',
    'feet',
    'face',
    'shoulders',
    'chest',
    'abdomen',

    // Lower signal regions (subtle detection)
    'back',
    'arms',
    'legs',
    'neck',
    'jaw',
    'forehead',
]);

export type BodyRegion = z.infer<typeof BodyRegion>;
```

### Signal Types

Interoceptive signal categories from research:

```typescript
export const SignalType = z.enum([
    'cardiac', // Heart, blood vessels, pulse
    'respiratory', // Lungs, diaphragm, breath
    'gastric', // Stomach, intestines, hunger/fullness
    'thermal', // Temperature, sweating, flushing
    'nociceptive', // Pain, aches, discomfort
    'muscular', // Tension, fatigue, trembling
    'affective', // Emotional body sensations
]);

export type SignalType = z.infer<typeof SignalType>;
```

### Difficulty Levels

Progressive difficulty based on signal intensity:

```typescript
export const DifficultyLevel = z.enum([
    'beginner', // Post-movement amplified signals
    'intermediate', // Mixed movement and rest
    'advanced', // Resting subtle signals
]);

export type DifficultyLevel = z.infer<typeof DifficultyLevel>;
```

### Exercise Category

```typescript
export const ExerciseCategory = z.enum([
    'body-scan',
    'focused-attention',
    'movement-integrated',
    'heartbeat-detection',
    'breath-awareness',
    'thermal-awareness',
]);

export type ExerciseCategory = z.infer<typeof ExerciseCategory>;
```

### Exercise Phase

Individual phase within an exercise:

```typescript
export const PhaseType = z.enum([
    'instruction', // Text/audio guidance
    'movement', // Physical activity
    'rest', // Stillness period
    'notice', // Attention to sensations
    'describe', // Vocabulary prompt
    'reflect', // Emotion connection
]);

export type PhaseType = z.infer<typeof PhaseType>;

export const ExercisePhase = z.object({
    id: z.string(),
    type: PhaseType,
    durationSeconds: z.number().min(5).max(120),
    instruction: z.string(),
    bodyRegion: BodyRegion.optional(),
    promptForDescription: z.boolean().default(false),
    promptForEmotion: z.boolean().default(false),
});

export type ExercisePhase = z.infer<typeof ExercisePhase>;
```

### Exercise

Complete exercise definition:

```typescript
export const Exercise = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    category: ExerciseCategory,
    difficulty: DifficultyLevel,
    bodyRegions: z.array(BodyRegion).min(1),
    signalTypes: z.array(SignalType).min(1),
    phases: z.array(ExercisePhase).min(1),
    totalDurationSeconds: z.number(),

    // Metadata
    createdAt: z.date(),
    updatedAt: z.date(),
    isBuiltIn: z.boolean().default(true),

    // Unlock criteria
    requiredCompletions: z.number().default(0), // Previous exercises needed
    requiredLevel: DifficultyLevel.optional(),
});

export type Exercise = z.infer<typeof Exercise>;
```

### Session (User Attempt)

Records a single exercise completion:

```typescript
export const Session = z.object({
    id: z.string().uuid(),
    odeName: z.string(),
    startedAt: z.date(),
    completedAt: z.date().optional(),

    // Completion state
    completed: z.boolean(),
    phasesCompleted: z.number(),
    totalPhases: z.number(),

    // User responses
    descriptions: z.array(
        z.object({
            phaseId: z.string(),
            bodyRegion: BodyRegion,
            text: z.string(),
            timestamp: z.date(),
        })
    ),

    emotionConnections: z.array(
        z.object({
            phaseId: z.string(),
            emotion: z.string(),
            bodyRegion: BodyRegion,
            timestamp: z.date(),
        })
    ),

    // Optional rating
    difficultyRating: z.number().min(1).max(5).optional(),
    notes: z.string().optional(),
});

export type Session = z.infer<typeof Session>;
```

### Exercise Progress

Aggregated user progress for an exercise:

```typescript
export const ExerciseProgress = z.object({
    exerciseId: z.string().uuid(),

    // Completion stats
    totalAttempts: z.number(),
    completedAttempts: z.number(),
    lastAttemptAt: z.date().optional(),

    // Vocabulary generated
    uniqueDescriptions: z.number(),

    // Unlock state
    unlocked: z.boolean(),
    unlockedAt: z.date().optional(),
});

export type ExerciseProgress = z.infer<typeof ExerciseProgress>;
```

### MAIA Progress Measurement

Track progress using MAIA-2 subscales:

```typescript
export const MAIASubscale = z.enum([
    'noticing', // Awareness of body sensations
    'not-distracting', // Not ignoring discomfort
    'not-worrying', // Not worrying about sensations
    'attention-regulation', // Sustaining attention to body
    'emotional-awareness', // Body-emotion connection
    'self-regulation', // Using body awareness to calm
    'body-listening', // Active listening to body
    'trusting', // Body feels safe
]);

export type MAIASubscale = z.infer<typeof MAIASubscale>;

export const MAIAScore = z.object({
    subscale: MAIASubscale,
    score: z.number().min(0).max(5),
    measuredAt: z.date(),
});

export type MAIAScore = z.infer<typeof MAIAScore>;

export const MAIAAssessment = z.object({
    id: z.string().uuid(),
    scores: z.array(MAIAScore),
    completedAt: z.date(),
});

export type MAIAAssessment = z.infer<typeof MAIAAssessment>;
```

---

## Exercise Phases

### Phase Types and Purposes

| Phase Type    | Purpose                 | Typical Duration | User Action       |
| ------------- | ----------------------- | ---------------- | ----------------- |
| `instruction` | Explain what to do      | 5-15s            | Read/listen       |
| `movement`    | Amplify signals         | 10-30s           | Physical activity |
| `rest`        | Allow signals to settle | 10-30s           | Be still          |
| `notice`      | Attend to sensations    | 15-45s           | Focus attention   |
| `describe`    | Capture vocabulary      | 15-30s           | Enter description |
| `reflect`     | Connect to emotions     | 15-30s           | Consider feelings |

### Standard Phase Sequences

**Movement-Integrated Sequence:**

```
instruction → movement → rest → notice → describe → reflect
```

**Focused-Attention Sequence:**

```
instruction → notice → describe → reflect
```

**Body-Scan Sequence (per region):**

```
instruction → notice → describe
```

Repeated for each body region.

**Heartbeat-Detection Sequence:**

```
instruction → movement → rest → notice → notice → describe
```

Double notice phase: first with eyes closed, then comparing.

---

## Timing Guidelines

### Core Principles

From Mahler's curriculum:

- Core noticing activities: **under 60 seconds**
- Full exercise with all phases: **2-5 minutes**
- Daily practice more effective than long sessions

### Duration Recommendations

| Exercise Category         | Core Duration | With Reflection | Max Duration |
| ------------------------- | ------------- | --------------- | ------------ |
| focused-attention         | 30-45s        | 60-90s          | 2 min        |
| movement-integrated       | 45-60s        | 90-120s         | 3 min        |
| body-scan (single region) | 30-45s        | 60-90s          | 2 min        |
| body-scan (full)          | 3-5 min       | 5-8 min         | 10 min       |
| heartbeat-detection       | 45-60s        | 90-120s         | 3 min        |
| breath-awareness          | 30-60s        | 60-120s         | 3 min        |
| thermal-awareness         | 45-60s        | 90-120s         | 3 min        |

### Phase Duration Ranges

```typescript
const phaseDurationRanges: Record<PhaseType, { min: number; max: number }> = {
    instruction: { min: 5, max: 15 },
    movement: { min: 10, max: 30 },
    rest: { min: 10, max: 30 },
    notice: { min: 15, max: 45 },
    describe: { min: 15, max: 30 },
    reflect: { min: 15, max: 30 },
};
```

---

## Difficulty Progression

### Progression Model

```
Beginner → Intermediate → Advanced

Strong signals → Mixed signals → Subtle signals
(post-movement)   (both)         (resting)
```

### Unlock Criteria

```typescript
interface UnlockCriteria {
    beginner: {
        // Available immediately
        requirements: null;
    };
    intermediate: {
        // Requires beginner mastery
        completedBeginnerExercises: 5;
        uniqueBodyRegions: 3;
    };
    advanced: {
        // Requires intermediate mastery
        completedIntermediateExercises: 5;
        uniqueBodyRegions: 6;
        vocabularyEntries: 10;
    };
}
```

### Signal Intensity by Difficulty

| Difficulty   | Signal State              | Movement | Body Regions                 |
| ------------ | ------------------------- | -------- | ---------------------------- |
| Beginner     | Amplified (post-exercise) | Required | High-signal (heart, stomach) |
| Intermediate | Mixed                     | Optional | Medium-signal (hands, chest) |
| Advanced     | Resting/subtle            | None     | Low-signal (back, forehead)  |

### Body Region Progression

Recommended introduction order:

1. **Beginner**: heart, stomach, lungs, hands
2. **Intermediate**: feet, face, shoulders, chest, throat
3. **Advanced**: abdomen, back, arms, legs, neck, jaw, forehead

---

## Database Schema

### IndexedDB Stores

```typescript
interface ExerciseDatabase {
    // Exercise definitions (built-in + custom)
    exercises: {
        key: string; // exercise.id
        value: Exercise;
        indexes: {
            'by-category': ExerciseCategory;
            'by-difficulty': DifficultyLevel;
            'by-body-region': BodyRegion;
        };
    };

    // User sessions
    sessions: {
        key: string; // session.id
        value: Session;
        indexes: {
            'by-exercise': string;
            'by-date': Date;
            'by-completed': boolean;
        };
    };

    // Aggregated progress per exercise
    progress: {
        key: string; // exerciseId
        value: ExerciseProgress;
        indexes: {
            'by-unlocked': boolean;
        };
    };

    // MAIA assessments
    assessments: {
        key: string; // assessment.id
        value: MAIAAssessment;
        indexes: {
            'by-date': Date;
        };
    };
}
```

### Database Version

```typescript
const DB_NAME = 'inward-exercises';
const DB_VERSION = 1;
```

---

## Example Exercises

### Beginner: Heart After Movement

```typescript
const heartAfterMovement: Exercise = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Heart After Movement',
    description:
        'Notice your heartbeat after brief physical activity. Movement amplifies cardiac signals, making them easier to detect.',
    category: 'movement-integrated',
    difficulty: 'beginner',
    bodyRegions: ['heart', 'chest'],
    signalTypes: ['cardiac'],
    phases: [
        {
            id: 'p1',
            type: 'instruction',
            durationSeconds: 10,
            instruction: "In a moment, you'll do some jumping jacks, then notice your heart.",
        },
        {
            id: 'p2',
            type: 'movement',
            durationSeconds: 20,
            instruction: 'Do jumping jacks or march in place vigorously.',
        },
        {
            id: 'p3',
            type: 'rest',
            durationSeconds: 5,
            instruction: 'Stop and stand still.',
        },
        {
            id: 'p4',
            type: 'notice',
            durationSeconds: 30,
            instruction:
                'Close your eyes. Notice your heart. Where do you feel it? What does it feel like?',
            bodyRegion: 'heart',
        },
        {
            id: 'p5',
            type: 'describe',
            durationSeconds: 20,
            instruction: 'Describe what you noticed about your heartbeat in your own words.',
            bodyRegion: 'heart',
            promptForDescription: true,
        },
        {
            id: 'p6',
            type: 'reflect',
            durationSeconds: 15,
            instruction: 'Is there any emotion connected to this sensation?',
            promptForEmotion: true,
        },
    ],
    totalDurationSeconds: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    isBuiltIn: true,
    requiredCompletions: 0,
};
```

### Intermediate: Stomach at Rest

```typescript
const stomachAtRest: Exercise = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Stomach at Rest',
    description:
        'Bring attention to your stomach area without movement. Notice subtle gastric sensations like hunger, fullness, or "gut feelings."',
    category: 'focused-attention',
    difficulty: 'intermediate',
    bodyRegions: ['stomach', 'abdomen'],
    signalTypes: ['gastric', 'affective'],
    phases: [
        {
            id: 'p1',
            type: 'instruction',
            durationSeconds: 10,
            instruction:
                "Find a comfortable position. You'll bring attention to your stomach area.",
        },
        {
            id: 'p2',
            type: 'notice',
            durationSeconds: 45,
            instruction:
                'Close your eyes. Bring your attention to your stomach. Notice any sensations - hunger, fullness, tightness, movement, warmth, or nothing at all.',
            bodyRegion: 'stomach',
        },
        {
            id: 'p3',
            type: 'describe',
            durationSeconds: 25,
            instruction: 'What words describe what you noticed? There are no wrong answers.',
            bodyRegion: 'stomach',
            promptForDescription: true,
        },
        {
            id: 'p4',
            type: 'reflect',
            durationSeconds: 20,
            instruction: 'Do these stomach sensations connect to any feeling or emotion?',
            promptForEmotion: true,
        },
    ],
    totalDurationSeconds: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    isBuiltIn: true,
    requiredCompletions: 3,
    requiredLevel: 'beginner',
};
```

---

## Store Interface

### Exercise Store

```typescript
import { writable, derived } from 'svelte/store';

interface ExerciseStoreState {
    exercises: Exercise[];
    progress: Map<string, ExerciseProgress>;
    loading: boolean;
    error: string | null;
}

interface ExerciseStore {
    subscribe: Writable<ExerciseStoreState>['subscribe'];

    // Load exercises from IndexedDB
    loadExercises(): Promise<void>;

    // Get exercises filtered by criteria
    getByCategory(category: ExerciseCategory): Exercise[];
    getByDifficulty(difficulty: DifficultyLevel): Exercise[];
    getUnlocked(): Exercise[];

    // Progress tracking
    recordSession(session: Session): Promise<void>;
    getProgress(exerciseId: string): ExerciseProgress | undefined;

    // Unlock management
    checkUnlocks(): Promise<string[]>; // Returns newly unlocked exercise IDs
}

// Derived stores
export const unlockedExercises = derived(exerciseStore, $store =>
    $store.exercises.filter(e => $store.progress.get(e.id)?.unlocked ?? e.difficulty === 'beginner')
);

export const exercisesByCategory = derived(exerciseStore, $store => {
    const byCategory = new Map<ExerciseCategory, Exercise[]>();
    for (const exercise of $store.exercises) {
        const list = byCategory.get(exercise.category) ?? [];
        list.push(exercise);
        byCategory.set(exercise.category, list);
    }
    return byCategory;
});
```

### Session Store

```typescript
interface SessionStoreState {
    currentSession: Session | null;
    currentPhaseIndex: number;
    recentSessions: Session[];
}

interface SessionStore {
    subscribe: Writable<SessionStoreState>['subscribe'];

    // Session lifecycle
    startSession(exerciseId: string): Promise<Session>;
    advancePhase(): void;
    recordDescription(text: string): void;
    recordEmotion(emotion: string): void;
    completeSession(): Promise<void>;
    abandonSession(): Promise<void>;

    // History
    getRecentSessions(limit?: number): Promise<Session[]>;
    getSessionsForExercise(exerciseId: string): Promise<Session[]>;
}
```

---

## Related Specifications

- [Sensation Vocabulary](./SENSATION-VOCABULARY.md) - Vocabulary domain model and P2P sharing
- [Interoception Research](./INTEROCEPTION-RESEARCH.md) - Scientific foundation

---

_Last updated: February 2026_
