# Exercise Player UI Specification

Technical specification for the Inward exercise player interface, including component hierarchy, state management, and phase-specific displays.

---

## Table of Contents

1. [Overview](#overview)
2. [Component Hierarchy](#component-hierarchy)
3. [Player State Machine](#player-state-machine)
4. [Phase Display Specifications](#phase-display-specifications)
5. [Timer & Progress UI](#timer--progress-ui)
6. [Input Collection](#input-collection)
7. [Vocabulary Suggestions](#vocabulary-suggestions)
8. [Interruption Handling](#interruption-handling)
9. [Accessibility Features](#accessibility-features)
10. [TypeScript Types](#typescript-types)
11. [Store Interface](#store-interface)

---

## Overview

### Goals

The exercise player supports three core objectives:

1. **Guidance** - Clear instructions that guide users through each phase
2. **Collection** - Capture vocabulary and emotion connections during practice
3. **Focus** - Distraction-free interface that supports interoceptive attention

### Design Principles

| Principle              | Description                                        |
| ---------------------- | -------------------------------------------------- |
| **Minimal UI**         | Remove distractions during attention phases        |
| **Clear timing**       | Always show remaining time for current phase       |
| **Gentle transitions** | Smooth phase changes without jarring interruptions |
| **Safe exit**          | Easy to pause or exit at any time                  |
| **Offline support**    | Full functionality without network connection      |

### Research Alignment

From [INTEROCEPTION-RESEARCH.md](./INTEROCEPTION-RESEARCH.md):

- **Short duration**: Core activities under 60 seconds (Mahler curriculum)
- **Single focus**: One body region per exercise
- **Progressive**: Movement amplifies signals for beginners
- **Non-judgmental**: Notice without trying to change

---

## Component Hierarchy

### Component Tree

```
ExercisePlayer
├── ExerciseHeader
│   ├── CloseButton
│   ├── ExerciseTitle
│   └── PauseButton
│
├── PhaseContent (renders based on phase type)
│   ├── InstructionPhase
│   │   └── PhaseInstruction
│   │
│   ├── MovementPhase
│   │   ├── PhaseInstruction
│   │   └── MovementAnimation
│   │
│   ├── RestPhase
│   │   └── PhaseInstruction
│   │
│   ├── NoticePhase
│   │   ├── PhaseInstruction
│   │   └── BodyRegionIndicator
│   │
│   ├── DescribePhase
│   │   ├── PhaseInstruction
│   │   ├── DescriptionInput
│   │   └── VocabularySuggestions
│   │
│   └── ReflectPhase
│       ├── PhaseInstruction
│       └── EmotionInput
│
├── ProgressBar
│   ├── PhaseProgress
│   └── OverallProgress
│
├── TimerDisplay
│   └── CircularTimer
│
└── PhaseControls
    ├── SkipButton (when applicable)
    └── ContinueButton (for input phases)
```

### Component Responsibilities

| Component               | Responsibility                                   |
| ----------------------- | ------------------------------------------------ |
| `ExercisePlayer`        | Orchestrates state, renders appropriate phase    |
| `ExerciseHeader`        | Title, close/pause controls, always visible      |
| `PhaseContent`          | Renders phase-specific content                   |
| `ProgressBar`           | Shows phase and overall progress                 |
| `TimerDisplay`          | Countdown for timed phases                       |
| `PhaseControls`         | Skip/continue buttons when applicable            |
| `VocabularySuggestions` | Shows relevant shared vocabulary during describe |

---

## Player State Machine

### State Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Exercise Player States                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         ┌──────────┐                            │
│                         │  IDLE    │                            │
│                         └────┬─────┘                            │
│                              │ load exercise                     │
│                              ▼                                   │
│                         ┌──────────┐                            │
│        load error ◄─────│ LOADING  │                            │
│             │           └────┬─────┘                            │
│             ▼                │ loaded                            │
│       ┌──────────┐          ▼                                   │
│       │  ERROR   │     ┌──────────┐                             │
│       └──────────┘     │  READY   │                             │
│                        └────┬─────┘                             │
│                             │ start                              │
│                             ▼                                    │
│       ┌──────────┐     ┌──────────┐                             │
│       │  PAUSED  │◄────│ PLAYING  │                             │
│       └────┬─────┘     └────┬─────┘                             │
│            │                │                                    │
│            │ resume         │ complete all phases                │
│            └───────────────►│                                    │
│                             ▼                                    │
│  ┌──────────┐          ┌──────────┐                             │
│  │ ABANDONED│◄─────────│ COMPLETED│                             │
│  └──────────┘  exit    └──────────┘                             │
│       ▲                                                          │
│       │ exit without completing                                  │
│       │                                                          │
│  PLAYING or PAUSED ────────────────────────────────────────────▶│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### State Definitions

```typescript
type PlayerState =
    | 'idle' // No exercise loaded
    | 'loading' // Exercise being loaded
    | 'ready' // Exercise loaded, ready to start
    | 'playing' // Exercise in progress
    | 'paused' // Exercise paused by user
    | 'completed' // All phases finished
    | 'abandoned' // User exited early
    | 'error'; // Error loading or playing
```

### State Transitions

| Current State | Event               | Next State  | Side Effects                 |
| ------------- | ------------------- | ----------- | ---------------------------- |
| `idle`        | `loadExercise`      | `loading`   | Fetch exercise from store    |
| `loading`     | `loadSuccess`       | `ready`     | Initialize phase state       |
| `loading`     | `loadError`         | `error`     | Set error message            |
| `ready`       | `start`             | `playing`   | Start first phase timer      |
| `playing`     | `pause`             | `paused`    | Pause timer                  |
| `playing`     | `phaseComplete`     | `playing`   | Advance to next phase        |
| `playing`     | `allPhasesComplete` | `completed` | Save session, show summary   |
| `playing`     | `exit`              | `abandoned` | Confirm dialog, save partial |
| `paused`      | `resume`            | `playing`   | Resume timer                 |
| `paused`      | `exit`              | `abandoned` | Confirm dialog, save partial |

---

## Phase Display Specifications

### Phase Types Reference

From [EXERCISE-SYSTEM.md](./EXERCISE-SYSTEM.md):

| Phase Type    | Purpose                 | Typical Duration | User Action       |
| ------------- | ----------------------- | ---------------- | ----------------- |
| `instruction` | Explain what to do      | 5-15s            | Read/listen       |
| `movement`    | Amplify signals         | 10-30s           | Physical activity |
| `rest`        | Allow signals to settle | 10-30s           | Be still          |
| `notice`      | Attend to sensations    | 15-45s           | Focus attention   |
| `describe`    | Capture vocabulary      | 15-30s           | Enter description |
| `reflect`     | Connect to emotions     | 15-30s           | Consider feelings |

---

### Instruction Phase

**Purpose**: Prepare user for upcoming activity.

```
┌─────────────────────────────────────────────────────────────────┐
│  ✕                    Heart After Movement                 ⏸   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                                                                 │
│                          📖                                     │
│                                                                 │
│                                                                 │
│         In a moment, you'll do some jumping                     │
│         jacks, then notice your heart.                          │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                         ┌─────┐                                 │
│                         │ 10  │                                 │
│                         └─────┘                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                Phase 1 of 6 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- Phase icon (📖 for instruction)
- Instruction text (centered, large)
- Countdown timer
- Progress bar

**Behavior**:

- Auto-advances when timer reaches 0
- Text appears with gentle fade-in
- Timer uses circular countdown

---

### Movement Phase

**Purpose**: Physical activity to amplify interoceptive signals.

```
┌─────────────────────────────────────────────────────────────────┐
│  ✕                    Heart After Movement                 ⏸   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                                                                 │
│                          🏃                                     │
│                                                                 │
│                                                                 │
│         Do jumping jacks or march in place                      │
│         vigorously.                                             │
│                                                                 │
│                                                                 │
│                    ┌─────────────────┐                          │
│                    │                 │                          │
│                    │   [Animation]   │                          │
│                    │                 │                          │
│                    └─────────────────┘                          │
│                                                                 │
│                         ┌─────┐                                 │
│                         │ 18  │                                 │
│                         └─────┘                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░                Phase 2 of 6 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- Phase icon (🏃 for movement)
- Instruction text
- Optional animation guide (simple, low-bandwidth)
- Countdown timer
- Progress bar

**Behavior**:

- Auto-advances when timer reaches 0
- Animation loops during phase (can be disabled)
- Audio cue option at start/end

---

### Rest Phase

**Purpose**: Stillness to let signals settle.

```
┌─────────────────────────────────────────────────────────────────┐
│  ✕                    Heart After Movement                 ⏸   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                          🧘                                     │
│                                                                 │
│                                                                 │
│                    Stop and stand still.                        │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                         ┌─────┐                                 │
│                         │  5  │                                 │
│                         └─────┘                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░                Phase 3 of 6 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- Phase icon (🧘 for rest)
- Simple instruction
- Countdown timer
- Calm visual (minimal animation)

**Behavior**:

- Auto-advances when timer reaches 0
- Minimal UI to avoid distraction
- Option for gentle audio tone at end

---

### Notice Phase

**Purpose**: Direct attention to specific body region.

```
┌─────────────────────────────────────────────────────────────────┐
│  ✕                    Heart After Movement                 ⏸   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                          👁️                                     │
│                                                                 │
│         Close your eyes. Notice your heart.                     │
│         Where do you feel it?                                   │
│         What does it feel like?                                 │
│                                                                 │
│                                                                 │
│                    ┌─────────────────┐                          │
│                    │                 │                          │
│                    │  [Body outline  │                          │
│                    │   with heart    │                          │
│                    │   highlighted]  │                          │
│                    │                 │                          │
│                    └─────────────────┘                          │
│                                                                 │
│                         ┌─────┐                                 │
│                         │ 25  │                                 │
│                         └─────┘                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░                Phase 4 of 6 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- Phase icon (👁️ for notice)
- Guiding questions
- Body region indicator (optional visual)
- Countdown timer

**Behavior**:

- Auto-advances when timer reaches 0
- Screen dims slightly after initial instruction
- Body outline shows target region (can be disabled)
- No distracting animations

---

### Describe Phase

**Purpose**: Capture user's vocabulary for the sensation.

```
┌─────────────────────────────────────────────────────────────────┐
│  ✕                    Heart After Movement                 ⏸   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                          ✏️                                     │
│                                                                 │
│         Describe what you noticed about your                    │
│         heartbeat in your own words.                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  pounding, strong                                        │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│         Others have described this as:                          │
│         ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│         │ racing  │  │ thudding│  │ pulsing │                  │
│         └─────────┘  └─────────┘  └─────────┘                  │
│                                                                 │
│                         ┌─────┐                                 │
│                         │ 15  │                                 │
│                         └─────┘                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Continue                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░                Phase 5 of 6 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- Phase icon (✏️ for describe)
- Instruction text
- Text input field
- Vocabulary suggestions (from shared vocabulary)
- Countdown timer
- Continue button

**Behavior**:

- User can type their own description
- Tapping a suggestion adds it (can be edited)
- "Continue" advances immediately
- Timer reaches 0 → auto-advance with any input saved
- Empty input is acceptable (no forcing)

---

### Reflect Phase

**Purpose**: Connect sensation to emotional state.

```
┌─────────────────────────────────────────────────────────────────┐
│  ✕                    Heart After Movement                 ⏸   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                          💭                                     │
│                                                                 │
│         Is there any emotion connected to                       │
│         this sensation?                                         │
│                                                                 │
│                                                                 │
│         Common connections for heart sensations:                │
│         ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│         │ anxious │  │ excited │  │  calm   │                  │
│         └─────────┘  └─────────┘  └─────────┘                  │
│         ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│         │  fear   │  │  joy    │  │ nervous │                  │
│         └─────────┘  └─────────┘  └─────────┘                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Or describe in your own words...                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                         ┌─────┐                                 │
│                         │ 12  │                                 │
│                         └─────┘                                 │
│                                                                 │
│  ┌────────────────────┐  ┌──────────────────────────────────┐  │
│  │   No connection    │  │           Continue               │  │
│  └────────────────────┘  └──────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░                Phase 6 of 6 │
└─────────────────────────────────────────────────────────────────┘
```

**Components**:

- Phase icon (💭 for reflect)
- Question prompt
- Emotion suggestion chips
- Text input for custom emotion
- "No connection" option
- Countdown timer
- Continue button

**Behavior**:

- User can tap an emotion chip
- User can type custom emotion
- "No connection" is a valid response
- No pressure to find an emotion
- "Continue" or timer advances

---

## Timer & Progress UI

### Timer Display

```typescript
interface TimerDisplayProps {
    remainingSeconds: number;
    totalSeconds: number;
    isPaused: boolean;
    showCircular: boolean; // false for minimal mode
}
```

**Circular Timer**:

```
        ╭───────────╮
      ╱             ╲
     │      25       │
     │    seconds    │
      ╲             ╱
        ╰───────────╯

Arc fills counter-clockwise as time passes
```

**Minimal Timer** (for notice phase):

```
        25
```

**Timer Behavior**:

- Counts down from phase duration
- Pauses when player is paused
- Audio cue at 3 seconds remaining (optional)
- Visual pulse at 0 before advancing

### Progress Bar

```typescript
interface ProgressBarProps {
    currentPhase: number; // 0-indexed
    totalPhases: number;
    phaseProgress: number; // 0-1 for current phase
}
```

**Visual**:

```
▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░         Phase 3 of 6
└─────────┘ └──────────────────┘
  Completed      Remaining
```

**Behavior**:

- Solid fill for completed phases
- Animated fill for current phase progress
- Empty for upcoming phases
- Phase count text below

---

## Input Collection

### Description Input

```typescript
interface DescriptionInputProps {
    value: string;
    bodyRegion: BodyRegion;
    maxLength: number; // 200
    placeholder: string;
    suggestions: SharedDescription[];
    onSubmit: (text: string) => void;
}
```

**Behavior**:

- Single-line or auto-expanding textarea
- Character limit indicator appears at 150+
- Keyboard shows "Done" action
- Submitting adds to session data

### Emotion Input

```typescript
interface EmotionInputProps {
    value: string | null;
    bodyRegion: BodyRegion;
    suggestions: string[]; // Common emotions for this region
    allowNoConnection: boolean;
    onSubmit: (emotion: string | null) => void;
}
```

**Behavior**:

- Chip selection OR text input
- "No connection" button clears selection
- Multiple emotion words allowed
- Submitting adds to session data

### Session Data Collection

```typescript
interface SessionData {
    exerciseId: string;
    startedAt: Date;
    phaseResponses: PhaseResponse[];
}

interface PhaseResponse {
    phaseId: string;
    phaseType: PhaseType;
    completedAt: Date;
    skipped: boolean;
    // Only for describe phases
    description?: string;
    // Only for reflect phases
    emotionConnection?: string | null;
}
```

---

## Vocabulary Suggestions

### Suggestion Logic

```typescript
async function getSuggestions(
    bodyRegion: BodyRegion,
    signalType?: SignalType
): Promise<SharedDescription[]> {
    // 1. Get shared descriptions for body region
    const regionDescriptions = await vocabularyStore.getByBodyRegion(bodyRegion);

    // 2. Filter by signal type if provided
    const filtered = signalType
        ? regionDescriptions.filter(d => d.signalType === signalType)
        : regionDescriptions;

    // 3. Sort by confirmation count (popular first)
    const sorted = filtered.sort((a, b) => b.confirmationCount - a.confirmationCount);

    // 4. Return top 5
    return sorted.slice(0, 5);
}
```

### Suggestion Display

```
Others have described this as:
┌─────────┐  ┌─────────┐  ┌─────────┐
│ racing  │  │ thudding│  │ pulsing │
│   (42)  │  │   (28)  │  │   (15)  │
└─────────┘  └─────────┘  └─────────┘
```

**Behavior**:

- Tapping a chip inserts text into input
- Confirmation count shown (optional)
- Chips are assistive, not prescriptive
- User can always type their own words

---

## Interruption Handling

### Pause

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                          ⏸                                      │
│                                                                 │
│                        Paused                                   │
│                                                                 │
│         Take your time. Resume when you're ready.               │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                       Resume                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    [End Exercise Early]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior**:

- Timer pauses
- Overlay covers content
- "Resume" continues from exact point
- "End Exercise Early" → exit confirmation

### Exit Confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                       End Exercise?                             │
│                                                                 │
│         You've completed 3 of 6 phases.                         │
│                                                                 │
│         Your progress will be saved.                            │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Continue Exercise                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                       [End and Save]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior**:

- Primary action is to continue
- Secondary action saves partial session
- No option to discard (always save progress)

### Error State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                          ⚠️                                     │
│                                                                 │
│                 Something went wrong                            │
│                                                                 │
│         We couldn't load this exercise.                         │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                       Try Again                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                   [Return to Exercises]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Accessibility Features

### Visual Accessibility

| Feature               | Implementation                                  |
| --------------------- | ----------------------------------------------- |
| High contrast mode    | Alternative color scheme with stronger contrast |
| Large text support    | All text scales to 200%                         |
| Body outline optional | Can disable body visualization                  |
| Animation reduction   | Respect `prefers-reduced-motion`                |
| Focus indicators      | Clear visible focus for keyboard navigation     |

### Auditory Accessibility

| Feature               | Implementation                        |
| --------------------- | ------------------------------------- |
| Audio cues            | Optional sounds for phase transitions |
| Screen reader support | ARIA announcements for phase changes  |
| No audio required     | All information available visually    |
| Caption for audio     | Text shown for any audio content      |

### Motor Accessibility

| Feature             | Implementation                               |
| ------------------- | -------------------------------------------- |
| Large touch targets | Minimum 44x44px for all interactive elements |
| Keyboard navigation | Full keyboard support for desktop            |
| No time pressure    | Can pause at any time                        |
| Voice input         | Text fields support voice dictation          |
| Single-hand use     | All controls reachable with one hand         |

### Cognitive Accessibility

| Feature              | Implementation                          |
| -------------------- | --------------------------------------- |
| Clear progress       | Always show current phase and total     |
| Predictable timing   | Consistent countdown behavior           |
| Simple language      | Instructions at 8th grade reading level |
| No surprises         | Phase transitions announced             |
| Safe exit            | Always able to pause or exit            |
| No forced completion | Can skip phases, partial sessions saved |

### Screen Reader Announcements

```typescript
// Phase transition announcement
function announcePhaseChange(phase: ExercisePhase): void {
    const announcement = `Phase ${phaseIndex + 1} of ${totalPhases}: ${phase.type}. ${phase.instruction}`;
    ariaLive.announce(announcement, 'polite');
}

// Timer announcement (at key points)
function announceTime(remaining: number): void {
    if (remaining === 30 || remaining === 10 || remaining === 3) {
        ariaLive.announce(`${remaining} seconds remaining`, 'polite');
    }
}
```

---

## TypeScript Types

### Player Types

```typescript
import { z } from 'zod';
import type { Exercise, ExercisePhase, BodyRegion, Session } from '$lib/types';

/**
 * Exercise player state.
 */
export const PlayerState = z.enum([
    'idle',
    'loading',
    'ready',
    'playing',
    'paused',
    'completed',
    'abandoned',
    'error',
]);

export type PlayerState = z.infer<typeof PlayerState>;

/**
 * Current player context.
 */
export const PlayerContext = z.object({
    state: PlayerState,
    exercise: z.custom<Exercise>().nullable(),
    currentPhaseIndex: z.number(),
    phaseTimeRemaining: z.number(), // seconds
    sessionData: z.custom<SessionData>(),
    error: z.string().nullable(),
});

export type PlayerContext = z.infer<typeof PlayerContext>;
```

### Phase Response Types

```typescript
/**
 * User response during a phase.
 */
export const PhaseResponse = z.object({
    phaseId: z.string(),
    phaseType: z.enum(['instruction', 'movement', 'rest', 'notice', 'describe', 'reflect']),
    completedAt: z.date(),
    skipped: z.boolean().default(false),
    description: z.string().optional(),
    emotionConnection: z.string().nullable().optional(),
});

export type PhaseResponse = z.infer<typeof PhaseResponse>;

/**
 * Session data collected during exercise.
 */
export const SessionData = z.object({
    exerciseId: z.string().uuid(),
    startedAt: z.date(),
    phaseResponses: z.array(PhaseResponse),
});

export type SessionData = z.infer<typeof SessionData>;
```

### Player Events

```typescript
/**
 * Events that can occur during exercise.
 */
export const PlayerEvent = z.discriminatedUnion('type', [
    z.object({ type: z.literal('load'), exerciseId: z.string().uuid() }),
    z.object({ type: z.literal('start') }),
    z.object({ type: z.literal('pause') }),
    z.object({ type: z.literal('resume') }),
    z.object({ type: z.literal('phaseComplete'), response: PhaseResponse }),
    z.object({ type: z.literal('skipPhase') }),
    z.object({ type: z.literal('exit') }),
    z.object({ type: z.literal('tick') }), // Timer tick
]);

export type PlayerEvent = z.infer<typeof PlayerEvent>;
```

### Component Props Types

```typescript
/**
 * Props for PhaseContent component.
 */
export interface PhaseContentProps {
    phase: ExercisePhase;
    timeRemaining: number;
    onDescriptionSubmit?: (text: string) => void;
    onEmotionSubmit?: (emotion: string | null) => void;
    onContinue?: () => void;
    suggestions?: SharedDescription[];
}

/**
 * Props for TimerDisplay component.
 */
export interface TimerDisplayProps {
    remainingSeconds: number;
    totalSeconds: number;
    isPaused: boolean;
    minimal?: boolean;
}

/**
 * Props for ProgressBar component.
 */
export interface ProgressBarProps {
    currentPhase: number;
    totalPhases: number;
    phaseProgress: number;
}
```

---

## Store Interface

### Player Store

```typescript
import { writable, derived } from 'svelte/store';

interface PlayerStoreState {
    state: PlayerState;
    exercise: Exercise | null;
    currentPhaseIndex: number;
    phaseTimeRemaining: number;
    sessionData: SessionData | null;
    error: string | null;
}

function createPlayerStore() {
    const { subscribe, set, update } = writable<PlayerStoreState>({
        state: 'idle',
        exercise: null,
        currentPhaseIndex: 0,
        phaseTimeRemaining: 0,
        sessionData: null,
        error: null,
    });

    let timerInterval: ReturnType<typeof setInterval> | null = null;

    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            update(s => {
                if (s.state !== 'playing') return s;
                if (s.phaseTimeRemaining <= 1) {
                    // Phase complete
                    advancePhase();
                    return s;
                }
                return { ...s, phaseTimeRemaining: s.phaseTimeRemaining - 1 };
            });
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function advancePhase() {
        update(s => {
            if (!s.exercise) return s;
            const nextIndex = s.currentPhaseIndex + 1;
            if (nextIndex >= s.exercise.phases.length) {
                // Exercise complete
                stopTimer();
                return { ...s, state: 'completed' };
            }
            const nextPhase = s.exercise.phases[nextIndex];
            return {
                ...s,
                currentPhaseIndex: nextIndex,
                phaseTimeRemaining: nextPhase.durationSeconds,
            };
        });
    }

    return {
        subscribe,

        async load(exerciseId: string): Promise<void> {
            update(s => ({ ...s, state: 'loading', error: null }));
            try {
                const exercise = await exerciseStore.getById(exerciseId);
                if (!exercise) throw new Error('Exercise not found');
                update(s => ({
                    ...s,
                    state: 'ready',
                    exercise,
                    currentPhaseIndex: 0,
                    phaseTimeRemaining: exercise.phases[0].durationSeconds,
                    sessionData: {
                        exerciseId,
                        startedAt: new Date(),
                        phaseResponses: [],
                    },
                }));
            } catch (error) {
                update(s => ({
                    ...s,
                    state: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                }));
            }
        },

        start(): void {
            update(s => ({ ...s, state: 'playing' }));
            startTimer();
        },

        pause(): void {
            stopTimer();
            update(s => ({ ...s, state: 'paused' }));
        },

        resume(): void {
            update(s => ({ ...s, state: 'playing' }));
            startTimer();
        },

        skipPhase(): void {
            advancePhase();
        },

        recordDescription(text: string): void {
            update(s => {
                if (!s.exercise || !s.sessionData) return s;
                const phase = s.exercise.phases[s.currentPhaseIndex];
                const response: PhaseResponse = {
                    phaseId: phase.id,
                    phaseType: phase.type,
                    completedAt: new Date(),
                    skipped: false,
                    description: text,
                };
                return {
                    ...s,
                    sessionData: {
                        ...s.sessionData,
                        phaseResponses: [...s.sessionData.phaseResponses, response],
                    },
                };
            });
        },

        recordEmotion(emotion: string | null): void {
            update(s => {
                if (!s.exercise || !s.sessionData) return s;
                const phase = s.exercise.phases[s.currentPhaseIndex];
                const response: PhaseResponse = {
                    phaseId: phase.id,
                    phaseType: phase.type,
                    completedAt: new Date(),
                    skipped: false,
                    emotionConnection: emotion,
                };
                return {
                    ...s,
                    sessionData: {
                        ...s.sessionData,
                        phaseResponses: [...s.sessionData.phaseResponses, response],
                    },
                };
            });
        },

        async exit(): Promise<void> {
            stopTimer();
            // Save partial session
            const state = get(playerStore);
            if (state.sessionData) {
                await sessionStore.savePartial(state.sessionData);
            }
            update(s => ({ ...s, state: 'abandoned' }));
        },

        reset(): void {
            stopTimer();
            set({
                state: 'idle',
                exercise: null,
                currentPhaseIndex: 0,
                phaseTimeRemaining: 0,
                sessionData: null,
                error: null,
            });
        },
    };
}

export const playerStore = createPlayerStore();

// Derived stores
export const currentPhase = derived(
    playerStore,
    $player => $player.exercise?.phases[$player.currentPhaseIndex] ?? null
);

export const progress = derived(playerStore, $player => {
    if (!$player.exercise) return { current: 0, total: 0, percentage: 0 };
    return {
        current: $player.currentPhaseIndex + 1,
        total: $player.exercise.phases.length,
        percentage: (($player.currentPhaseIndex + 1) / $player.exercise.phases.length) * 100,
    };
});

export const phaseProgress = derived(playerStore, $player => {
    const phase = $player.exercise?.phases[$player.currentPhaseIndex];
    if (!phase) return 0;
    return 1 - $player.phaseTimeRemaining / phase.durationSeconds;
});
```

---

## Related Specifications

- [EXERCISE-SYSTEM.md](./EXERCISE-SYSTEM.md) - Exercise definitions and phases
- [SENSATION-VOCABULARY.md](./SENSATION-VOCABULARY.md) - Vocabulary suggestions
- [APP-NAVIGATION.md](./APP-NAVIGATION.md) - Player route integration
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Full accessibility requirements

---

_Last updated: February 2026_
