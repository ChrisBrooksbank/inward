# Onboarding Flow Specification

Technical specification for the Inward first-time user experience and onboarding flow.

---

## Table of Contents

1. [Overview](#overview)
2. [Flow Structure](#flow-structure)
3. [Screen Specifications](#screen-specifications)
4. [Skip & Resume Logic](#skip--resume-logic)
5. [Content Guidelines](#content-guidelines)
6. [Accessibility Considerations](#accessibility-considerations)
7. [TypeScript Types](#typescript-types)
8. [Store Interface](#store-interface)

---

## Overview

### Goals

The onboarding flow serves four core objectives:

1. **Education** - Explain what interoception is and why it matters
2. **Trust Building** - Establish privacy-first data practices
3. **Baseline** - Optional initial MAIA-2 assessment for progress tracking
4. **Quick Win** - First exercise experience to demonstrate value

### Design Principles

| Principle              | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| **Skippable**          | Users can skip to the app at any point               |
| **Resumable**          | Progress saved; users can resume where they left off |
| **Low cognitive load** | Simple language, minimal choices per screen          |
| **Trauma-informed**    | No forced body attention; clear expectations         |
| **Progressive**        | Information revealed gradually, not all at once      |

### Target Audience Considerations

The onboarding must accommodate users who may have:

- **Alexithymia** - Difficulty identifying emotions; avoid emotion-heavy language initially
- **Anxiety** - Fear of body sensations; emphasize safety and control
- **Autism** - Need for predictability; clear structure and expectations
- **ADHD** - Attention difficulties; keep screens short and scannable
- **Trauma** - Body disconnection; optional activities, clear exit paths

---

## Flow Structure

### 6-Step Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Onboarding Flow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1           Step 2           Step 3                        │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐                  │
│  │ Welcome │ ──── │ What Is │ ──── │ Privacy │                  │
│  │         │      │ Intero- │      │  & Data │                  │
│  │         │      │ ception │      │         │                  │
│  └─────────┘      └─────────┘      └─────────┘                  │
│       │                │                │                        │
│       │ (Skip ────────────────────────────────────┐              │
│       │  any time)                                │              │
│       │                                           │              │
│  Step 4           Step 5           Step 6        │              │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐   │              │
│  │ Initial │ ──── │  First  │ ──── │ Complete│ ─────▶ Dashboard │
│  │ Assess- │      │ Exercise│      │         │                  │
│  │ ment    │      │         │      │         │                  │
│  │(optional)│      │         │      │         │                  │
│  └─────────┘      └─────────┘      └─────────┘                  │
│       │                                                          │
│       │ (Skip)                                                   │
│       └────────────────────▶ Step 5                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Step Summary

| Step | Route                    | Required | Duration | Purpose                    |
| ---- | ------------------------ | -------- | -------- | -------------------------- |
| 1    | `/welcome`               | Yes      | ~30s     | Introduction and hook      |
| 2    | `/what-is-interoception` | Yes      | ~1-2min  | Core concept education     |
| 3    | `/privacy`               | Yes      | ~1min    | Data practices and consent |
| 4    | `/assessment`            | No       | ~5min    | Baseline MAIA-2 (optional) |
| 5    | `/first-exercise`        | Yes      | ~2min    | Guided first experience    |
| 6    | `/complete`              | Yes      | ~30s     | Celebration and next steps |

---

## Screen Specifications

### Step 1: Welcome

**Route**: `/welcome`

**Purpose**: Create emotional connection, set expectations.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                    [Skip →]     │
│                                                                 │
│                                                                 │
│                          🌿                                     │
│                                                                 │
│                         Inward                                  │
│                                                                 │
│                                                                 │
│               Learn to listen to your body.                     │
│                                                                 │
│         Inward helps you notice and describe the                │
│         sensations happening inside your body—                  │
│         things like your heartbeat, breathing,                  │
│         and stomach feelings.                                   │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Get Started                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                   Already have experience?                      │
│                   [Skip Introduction →]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content**:

- App logo and name
- One-sentence value proposition
- 2-3 sentence description
- Primary CTA: "Get Started"
- Secondary CTA: "Skip Introduction"

**Behavior**:

- "Get Started" → `/what-is-interoception`
- "Skip Introduction" → `/dashboard` (marks onboarding complete)
- "Skip" header link → `/dashboard`

---

### Step 2: What Is Interoception?

**Route**: `/what-is-interoception`

**Purpose**: Explain the core concept in accessible terms.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                            [Skip →]     │
│                                                                 │
│  ● ○ ○ ○ ○ ○                                                   │
│                                                                 │
│                                                                 │
│             What is Interoception?                              │
│                                                                 │
│                                                                 │
│  You have more than five senses. Beyond sight, sound,           │
│  smell, taste, and touch, you have a sense that                 │
│  detects signals from inside your body.                         │
│                                                                 │
│  This is called interoception.                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   Examples of interoceptive signals:                     │   │
│  │                                                          │   │
│  │   ❤️  Your heartbeat                                     │   │
│  │   🫁  Your breathing                                     │   │
│  │   🤢  Hunger and fullness                               │   │
│  │   🌡️  Temperature changes                               │   │
│  │   😰  Physical feelings of emotions                     │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Some people notice these signals easily. Others find           │
│  them harder to detect. Both are normal—and with                │
│  practice, anyone can improve.                                  │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Continue                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content**:

- Clear, simple explanation (8th grade reading level)
- Concrete examples with icons
- Reassurance that variation is normal
- No medical jargon

**Behavior**:

- "Continue" → `/privacy`
- Back → `/welcome`
- Skip → `/dashboard`

---

### Step 3: Privacy & Data

**Route**: `/privacy`

**Purpose**: Build trust through transparency about data practices.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                            [Skip →]     │
│                                                                 │
│  ● ● ○ ○ ○ ○                                                   │
│                                                                 │
│                                                                 │
│               Your Data, Your Control                           │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📱  Local First                                         │   │
│  │      Your data stays on your device.                     │   │
│  │      No account required.                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔒  Private by Default                                  │   │
│  │      Vocabulary you create is private unless             │   │
│  │      you choose to share it anonymously.                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🗑️  Easy Deletion                                       │   │
│  │      Delete all your data any time from Settings.        │   │
│  │      One tap and it's gone.                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📤  Export Anytime                                      │   │
│  │      Download your data in a standard format.            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Continue                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content**:

- Four key privacy features
- Simple icons and short descriptions
- No legal jargon
- Link to full privacy policy (not required to read)

**Behavior**:

- "Continue" → `/assessment`
- Back → `/what-is-interoception`
- Skip → `/dashboard`

---

### Step 4: Initial Assessment (Optional)

**Route**: `/assessment`

**Purpose**: Establish baseline MAIA-2 scores for progress tracking.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                            [Skip →]     │
│                                                                 │
│  ● ● ● ○ ○ ○                                                   │
│                                                                 │
│                                                                 │
│            Measure Your Starting Point                          │
│                       (Optional)                                │
│                                                                 │
│                                                                 │
│  To track your progress over time, you can take a               │
│  brief questionnaire about your body awareness.                 │
│                                                                 │
│  This takes about 5 minutes and asks how you relate             │
│  to your body sensations.                                       │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   Why take this?                                         │   │
│  │                                                          │   │
│  │   ✓ See where you're starting from                       │   │
│  │   ✓ Track improvement over time                          │   │
│  │   ✓ Get personalized recommendations                     │   │
│  │                                                          │   │
│  │   You can always take it later from Settings.            │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Take Assessment (~5 min)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                      [Skip for now →]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**If user chooses to take assessment:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                           Question 1/37 │
│                                                                 │
│  ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░             │
│                                                                 │
│                                                                 │
│  When I am tense, I notice where the tension                    │
│  is located in my body.                                         │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                        Never                             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                       Rarely                             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                      Sometimes                           │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                        Often                             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                       Always                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                         Next                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                  [Save and continue later]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content**:

- Explanation of purpose
- Time estimate (5 minutes)
- Clear benefits
- Easy skip option
- Progress indicator during questions

**Behavior**:

- "Take Assessment" → Assessment questions flow
- "Skip for now" → `/first-exercise`
- Assessment complete → `/first-exercise`
- Back → `/privacy`

---

### Step 5: First Exercise

**Route**: `/first-exercise`

**Purpose**: Guided first experience with interoception practice.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                            [Skip →]     │
│                                                                 │
│  ● ● ● ● ○ ○                                                   │
│                                                                 │
│                                                                 │
│                Try Your First Exercise                          │
│                                                                 │
│                                                                 │
│  Let's practice noticing your heartbeat. This                   │
│  exercise takes about 2 minutes.                                │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │                        ❤️                                │   │
│  │                                                          │   │
│  │               Heart After Movement                        │   │
│  │                                                          │   │
│  │   You'll do some brief movement, then notice             │   │
│  │   your heartbeat. Movement makes the signal              │   │
│  │   easier to detect.                                      │   │
│  │                                                          │   │
│  │   ⏱️ 2 minutes   🎯 Beginner   ❤️ Heart, Chest          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Start Exercise                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                   [I'll try this later →]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content**:

- Selected beginner exercise (Heart After Movement)
- Brief explanation of what to expect
- Exercise metadata (duration, difficulty, body regions)
- Clear start and skip options

**Behavior**:

- "Start Exercise" → Exercise player with exercise
- Exercise complete → `/complete`
- "I'll try this later" → `/complete`
- Skip → `/dashboard`

---

### Step 6: Onboarding Complete

**Route**: `/complete`

**Purpose**: Celebrate completion, set expectations for continued use.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ● ● ● ● ● ●                                                   │
│                                                                 │
│                                                                 │
│                          🎉                                     │
│                                                                 │
│                    You're All Set!                              │
│                                                                 │
│                                                                 │
│  You've taken your first step toward better                     │
│  body awareness. Here's what comes next:                        │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   📅  Practice a little each day                         │   │
│  │       Short, regular practice is most effective.         │   │
│  │                                                          │   │
│  │   📝  Build your vocabulary                              │   │
│  │       Create words for sensations you notice.            │   │
│  │                                                          │   │
│  │   📊  Track your progress                                │   │
│  │       Retake the assessment after a few weeks.           │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Go to Dashboard                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content**:

- Celebration moment
- Three key next steps
- Emphasis on regular practice
- Single clear CTA

**Behavior**:

- "Go to Dashboard" → `/dashboard` (marks onboarding complete)
- Onboarding state saved to IndexedDB

---

## Skip & Resume Logic

### Skip Behavior

Users can skip onboarding at any point:

| Skip Location         | Behavior                                         |
| --------------------- | ------------------------------------------------ |
| Header "Skip" link    | Go directly to dashboard                         |
| "Skip Introduction"   | Go to dashboard, mark onboarding skipped         |
| "Skip for now"        | Continue to next step, mark current step skipped |
| "I'll try this later" | Continue to completion, mark exercise skipped    |

### Resume Logic

Progress is saved after each step:

```typescript
interface OnboardingProgress {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    skippedSteps: OnboardingStep[];
    startedAt: Date;
    lastActivityAt: Date;
    assessmentProgress?: {
        currentQuestion: number;
        answers: number[];
    };
}
```

**Resume Rules**:

1. If user closes app during onboarding → Resume at last visited step
2. If user skips → Mark step as skipped, continue flow
3. If user completes → Mark step as completed, continue flow
4. Assessment in progress → Resume at current question

### Persistence

```typescript
// Save onboarding state to IndexedDB
async function saveOnboardingProgress(progress: OnboardingProgress): Promise<void> {
    const db = await getDatabase();
    await db.put('settings', progress, 'onboarding_progress');
}

// Load onboarding state
async function loadOnboardingProgress(): Promise<OnboardingProgress | null> {
    const db = await getDatabase();
    return db.get('settings', 'onboarding_progress');
}

// Check if onboarding is complete
async function isOnboardingComplete(): Promise<boolean> {
    const progress = await loadOnboardingProgress();
    if (!progress) return false;
    return (
        progress.completedSteps.includes('complete') || progress.skippedSteps.includes('welcome')
    ); // Skipped at start
}
```

---

## Content Guidelines

### Tone

| Characteristic     | Description                           |
| ------------------ | ------------------------------------- |
| **Warm**           | Friendly, approachable, not clinical  |
| **Reassuring**     | "Both are normal", "at your own pace" |
| **Empowering**     | Focus on user capability and control  |
| **Non-judgmental** | No "good" or "bad" body awareness     |

### Language

| Do                                  | Don't                        |
| ----------------------------------- | ---------------------------- |
| "Notice" or "pay attention to"      | "Feel" (can be triggering)   |
| "Body signals" or "sensations"      | "Symptoms" (medical framing) |
| "Practice" or "exercise"            | "Treatment" or "therapy"     |
| "Can improve with practice"         | "Fix" or "cure"              |
| "Some people find..." / "Others..." | "Normal people" / "abnormal" |

### Reading Level

- Target: 8th grade reading level (Flesch-Kincaid Grade Level 8)
- Short sentences (max 20 words)
- Active voice
- Concrete examples over abstract concepts
- Define any technical terms immediately

### Microcopy Examples

**Button labels:**

- ✓ "Get Started" (active, inviting)
- ✗ "Begin Onboarding" (formal, clinical)

**Skip links:**

- ✓ "Skip for now" (temporary, no judgment)
- ✗ "Skip" (abrupt, might feel like missing out)

**Progress indicators:**

- ✓ "Question 5 of 37" (concrete)
- ✗ "13% complete" (abstract, potentially discouraging)

---

## Accessibility Considerations

### For Target Audience

#### Autism

- **Predictability**: Show step progress clearly
- **Literal language**: Avoid idioms or metaphors
- **Clear structure**: Consistent layouts across steps
- **Processing time**: No auto-advance; user controls pace
- **Sensory**: Option to disable animations

#### ADHD

- **Brevity**: Keep screens short and scannable
- **Chunking**: One concept per screen
- **Progress visibility**: Clear indicators of progress
- **Quick wins**: Fast path to first exercise
- **Return path**: Easy to resume if distracted

#### Anxiety

- **Control**: Clear exit paths at all times
- **Transparency**: No surprises; explain what's coming
- **Safety language**: "You can stop at any time"
- **Optional activities**: Never force body attention
- **Privacy emphasis**: Data safety reassurance

#### Alexithymia

- **No emotion labels**: Don't ask "How do you feel?"
- **Concrete language**: Physical descriptions
- **Examples**: Show what sensations might feel like
- **No assumptions**: Don't assume emotional vocabulary

### Technical Accessibility

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for full requirements.

Key onboarding-specific requirements:

| Requirement           | Implementation                        |
| --------------------- | ------------------------------------- |
| Screen reader support | Proper heading hierarchy, ARIA labels |
| Keyboard navigation   | All interactive elements focusable    |
| Reduced motion        | Respect `prefers-reduced-motion`      |
| Text scaling          | Layouts work up to 200% text size     |
| Color contrast        | WCAG AA minimum (4.5:1 for text)      |
| Focus indicators      | Visible focus ring on all interactive |
| Touch targets         | Minimum 44x44px                       |

---

## TypeScript Types

### Onboarding Step

```typescript
import { z } from 'zod';

/**
 * Onboarding step identifiers.
 */
export const OnboardingStep = z.enum([
    'welcome',
    'what-is-interoception',
    'privacy',
    'assessment',
    'first-exercise',
    'complete',
]);

export type OnboardingStep = z.infer<typeof OnboardingStep>;

/**
 * Order of onboarding steps for navigation.
 */
export const ONBOARDING_STEP_ORDER: OnboardingStep[] = [
    'welcome',
    'what-is-interoception',
    'privacy',
    'assessment',
    'first-exercise',
    'complete',
];
```

### Onboarding State

```typescript
/**
 * Current onboarding progress state.
 */
export const OnboardingState = z.object({
    // Current position
    currentStep: OnboardingStep,
    stepIndex: z.number().min(0).max(5),

    // Completion tracking
    completedSteps: z.array(OnboardingStep),
    skippedSteps: z.array(OnboardingStep),

    // Timestamps
    startedAt: z.date(),
    lastActivityAt: z.date(),
    completedAt: z.date().optional(),

    // Assessment progress (if started)
    assessmentProgress: z
        .object({
            currentQuestion: z.number().min(0).max(36),
            answers: z.array(z.number().min(0).max(5)),
            startedAt: z.date(),
        })
        .optional(),

    // First exercise tracking
    firstExerciseCompleted: z.boolean().default(false),
    firstExerciseSkipped: z.boolean().default(false),
});

export type OnboardingState = z.infer<typeof OnboardingState>;

/**
 * Initial onboarding state.
 */
export const INITIAL_ONBOARDING_STATE: OnboardingState = {
    currentStep: 'welcome',
    stepIndex: 0,
    completedSteps: [],
    skippedSteps: [],
    startedAt: new Date(),
    lastActivityAt: new Date(),
    firstExerciseCompleted: false,
    firstExerciseSkipped: false,
};
```

### Assessment Types

```typescript
/**
 * MAIA-2 question definition.
 */
export const MAIAQuestion = z.object({
    id: z.number().min(1).max(37),
    text: z.string(),
    subscale: z.enum([
        'noticing',
        'not-distracting',
        'not-worrying',
        'attention-regulation',
        'emotional-awareness',
        'self-regulation',
        'body-listening',
        'trusting',
    ]),
    reversed: z.boolean().default(false),
});

export type MAIAQuestion = z.infer<typeof MAIAQuestion>;

/**
 * User's answer to a MAIA-2 question.
 */
export const MAIAAnswer = z.object({
    questionId: z.number().min(1).max(37),
    value: z.number().min(0).max(5), // 0=Never, 5=Always
    answeredAt: z.date(),
});

export type MAIAAnswer = z.infer<typeof MAIAAnswer>;

/**
 * In-progress assessment state.
 */
export const AssessmentInProgress = z.object({
    currentQuestion: z.number().min(0).max(36),
    answers: z.array(MAIAAnswer),
    startedAt: z.date(),
    pausedAt: z.date().optional(),
});

export type AssessmentInProgress = z.infer<typeof AssessmentInProgress>;
```

### Navigation Actions

```typescript
/**
 * Actions available from onboarding screens.
 */
export const OnboardingAction = z.enum([
    'continue', // Go to next step
    'back', // Go to previous step
    'skip-step', // Skip current step
    'skip-all', // Skip entire onboarding
    'start-assessment',
    'skip-assessment',
    'save-assessment', // Save progress and continue later
    'start-exercise',
    'skip-exercise',
]);

export type OnboardingAction = z.infer<typeof OnboardingAction>;
```

---

## Store Interface

### Onboarding Store

```typescript
import { writable, derived, get } from 'svelte/store';

interface OnboardingStore {
    state: OnboardingState;
    isLoading: boolean;
    error: string | null;
}

function createOnboardingStore() {
    const { subscribe, set, update } = writable<OnboardingStore>({
        state: INITIAL_ONBOARDING_STATE,
        isLoading: true,
        error: null,
    });

    return {
        subscribe,

        // Initialize from IndexedDB
        async load(): Promise<void> {
            update(s => ({ ...s, isLoading: true }));
            try {
                const saved = await loadOnboardingProgress();
                if (saved) {
                    update(s => ({ ...s, state: saved, isLoading: false }));
                } else {
                    update(s => ({ ...s, isLoading: false }));
                }
            } catch (error) {
                update(s => ({
                    ...s,
                    isLoading: false,
                    error: 'Failed to load onboarding progress',
                }));
            }
        },

        // Navigate to next step
        async nextStep(): Promise<void> {
            update(s => {
                const nextIndex = s.state.stepIndex + 1;
                if (nextIndex >= ONBOARDING_STEP_ORDER.length) {
                    return s;
                }
                const newState: OnboardingState = {
                    ...s.state,
                    currentStep: ONBOARDING_STEP_ORDER[nextIndex],
                    stepIndex: nextIndex,
                    completedSteps: [...s.state.completedSteps, s.state.currentStep],
                    lastActivityAt: new Date(),
                };
                saveOnboardingProgress(newState);
                return { ...s, state: newState };
            });
        },

        // Navigate to previous step
        async previousStep(): Promise<void> {
            update(s => {
                const prevIndex = s.state.stepIndex - 1;
                if (prevIndex < 0) return s;
                const newState: OnboardingState = {
                    ...s.state,
                    currentStep: ONBOARDING_STEP_ORDER[prevIndex],
                    stepIndex: prevIndex,
                    lastActivityAt: new Date(),
                };
                saveOnboardingProgress(newState);
                return { ...s, state: newState };
            });
        },

        // Skip current step
        async skipStep(): Promise<void> {
            update(s => {
                const nextIndex = s.state.stepIndex + 1;
                if (nextIndex >= ONBOARDING_STEP_ORDER.length) {
                    return s;
                }
                const newState: OnboardingState = {
                    ...s.state,
                    currentStep: ONBOARDING_STEP_ORDER[nextIndex],
                    stepIndex: nextIndex,
                    skippedSteps: [...s.state.skippedSteps, s.state.currentStep],
                    lastActivityAt: new Date(),
                };
                saveOnboardingProgress(newState);
                return { ...s, state: newState };
            });
        },

        // Skip entire onboarding
        async skipAll(): Promise<void> {
            update(s => {
                const newState: OnboardingState = {
                    ...s.state,
                    currentStep: 'complete',
                    stepIndex: ONBOARDING_STEP_ORDER.length - 1,
                    skippedSteps: ONBOARDING_STEP_ORDER.filter(
                        step => !s.state.completedSteps.includes(step)
                    ),
                    completedAt: new Date(),
                    lastActivityAt: new Date(),
                };
                saveOnboardingProgress(newState);
                return { ...s, state: newState };
            });
        },

        // Complete onboarding
        async complete(): Promise<void> {
            update(s => {
                const newState: OnboardingState = {
                    ...s.state,
                    completedSteps: [...s.state.completedSteps, 'complete'],
                    completedAt: new Date(),
                    lastActivityAt: new Date(),
                };
                saveOnboardingProgress(newState);
                return { ...s, state: newState };
            });
        },

        // Assessment methods
        async startAssessment(): Promise<void> {
            update(s => ({
                ...s,
                state: {
                    ...s.state,
                    assessmentProgress: {
                        currentQuestion: 0,
                        answers: [],
                        startedAt: new Date(),
                    },
                },
            }));
        },

        async answerQuestion(questionId: number, value: number): Promise<void> {
            update(s => {
                if (!s.state.assessmentProgress) return s;
                const answer: MAIAAnswer = {
                    questionId,
                    value,
                    answeredAt: new Date(),
                };
                return {
                    ...s,
                    state: {
                        ...s.state,
                        assessmentProgress: {
                            ...s.state.assessmentProgress,
                            currentQuestion: s.state.assessmentProgress.currentQuestion + 1,
                            answers: [...s.state.assessmentProgress.answers, answer],
                        },
                    },
                };
            });
        },
    };
}

export const onboardingStore = createOnboardingStore();

// Derived stores
export const onboardingComplete = derived(
    onboardingStore,
    $store => $store.state.completedAt !== undefined
);

export const currentOnboardingStep = derived(
    onboardingStore,
    $store => $store.state.currentStep
);

export const onboardingProgress = derived(
    onboardingStore,
    $store => ({
        current: $store.state.stepIndex + 1,
        total: ONBOARDING_STEP_ORDER.length,
        percentage: (($ store.state.stepIndex + 1) / ONBOARDING_STEP_ORDER.length) * 100,
    })
);
```

---

## Related Specifications

- [APP-NAVIGATION.md](./APP-NAVIGATION.md) - Overall navigation structure
- [EXERCISE-PLAYER-UI.md](./EXERCISE-PLAYER-UI.md) - First exercise player
- [PROGRESS-DASHBOARD.md](./PROGRESS-DASHBOARD.md) - MAIA-2 assessment display
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Full accessibility requirements

---

_Last updated: February 2026_
