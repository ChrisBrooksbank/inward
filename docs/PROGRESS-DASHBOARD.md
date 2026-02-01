# Progress Dashboard Specification

Technical specification for the Inward progress visualization, MAIA-2 assessment UI, and insights system.

---

## Table of Contents

1. [Overview](#overview)
2. [Dashboard Layout](#dashboard-layout)
3. [MAIA-2 Assessment UI](#maia-2-assessment-ui)
4. [Visualization Components](#visualization-components)
5. [Insights & Recommendations](#insights--recommendations)
6. [Data Export](#data-export)
7. [TypeScript Types](#typescript-types)
8. [Store Interface](#store-interface)

---

## Overview

### Goals

The progress dashboard supports three core objectives:

1. **Motivation** - Show tangible progress to encourage continued practice
2. **Insight** - Help users understand patterns in their interoceptive awareness
3. **Measurement** - Track MAIA-2 scores over time for objective progress

### Design Principles

| Principle               | Description                                     |
| ----------------------- | ----------------------------------------------- |
| **Honest feedback**     | Show real progress, not gamified vanity metrics |
| **Personal comparison** | Compare to self over time, not to others        |
| **Actionable insights** | Recommendations lead to specific exercises      |
| **Privacy-first**       | All data stays local; export gives user control |

### Research Alignment

From [INTEROCEPTION-RESEARCH.md](./INTEROCEPTION-RESEARCH.md):

- **MAIA-2 subscales as outcomes**: Track Noticing, Attention Regulation, Emotional Awareness, Body Listening, Trusting
- **Avoid false precision**: Self-report trends more meaningful than pseudo-objective scores
- **Dimensional approach**: Measure multiple aspects independently

---

## Dashboard Layout

### Main Progress View

**Route**: `/(app)/progress`

```
┌─────────────────────────────────────────────────────────────────┐
│ Progress                                           ⚙️ Settings  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MAIA Overview                            [Take Again →] │   │
│  │                                                          │   │
│  │                    ╭─────────╮                           │   │
│  │                   ╱    3.2   ╲                          │   │
│  │          Trusting│           │Noticing                  │   │
│  │                   ╲    avg   ╱                          │   │
│  │                    ╰─────────╯                           │   │
│  │         Body      ╱           ╲    Attention            │   │
│  │         Listening              Regulation               │   │
│  │                                                          │   │
│  │  Last assessed: Jan 15, 2026                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │    12     │  │    23     │  │     5     │  │    8      │   │
│  │ Sessions  │  │   Words   │  │   Days    │  │  Regions  │   │
│  │ completed │  │  created  │  │  streak   │  │  covered  │   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Practice Streak                                  Jan    │   │
│  │                                                          │   │
│  │  ░ ░ ▓ ▓ ▓ ▓ ░ ░ ▓ ▓ ▓ ▓ ▓ ░ ░ ▓ ▓ ▓ ▓ ▓ ░ ▓ ▓ ▓ ▓ ▓ ▓ │   │
│  │  S M T W T F S S M T W T F S S M T W T F S S M T W T F S │   │
│  │                                                          │   │
│  │  🔥 Current streak: 5 days                              │   │
│  │  📅 Best streak: 8 days                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Body Coverage                                           │   │
│  │                                                          │   │
│  │            ┌─────────┐                                   │   │
│  │            │  head   │ ░                                 │   │
│  │            └────┬────┘                                   │   │
│  │          ┌──────┴──────┐                                 │   │
│  │          │   shoulders │ ▓▓                              │   │
│  │     ┌────┤    chest    ├────┐                            │   │
│  │     │arms│    heart ▓▓▓│arms│                            │   │
│  │     │ ░  │   stomach ▓▓│ ░  │                            │   │
│  │     └────┤   abdomen   ├────┘                            │   │
│  │          │      ░      │                                 │   │
│  │          └──────┬──────┘                                 │   │
│  │            ┌────┴────┐                                   │   │
│  │            │  legs   │ ░                                 │   │
│  │            └─────────┘                                   │   │
│  │                                                          │   │
│  │  Practiced: 4/16 body regions                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💡 Insight                                              │   │
│  │                                                          │   │
│  │  You've built strong awareness of heart sensations.      │   │
│  │  Try expanding to chest and stomach next.                │   │
│  │                                                          │   │
│  │  [Try: Stomach at Rest →]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Layout Components

| Component        | Description                                 |
| ---------------- | ------------------------------------------- |
| `MAIAOverview`   | Radar chart with current scores and history |
| `QuickStats`     | Four key metrics in grid                    |
| `StreakCalendar` | Month view of practice days                 |
| `BodyCoverage`   | Body outline showing practiced regions      |
| `InsightCard`    | AI-generated insight with action            |

---

## MAIA-2 Assessment UI

### Assessment Overview

The MAIA-2 (Multidimensional Assessment of Interoceptive Awareness) consists of 37 questions across 8 subscales.

**Route**: `/(app)/progress/assessment`

### Pre-Assessment Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                          📊                                     │
│                                                                 │
│              Interoceptive Awareness Assessment                 │
│                                                                 │
│                                                                 │
│  This questionnaire asks about your relationship with           │
│  your body sensations. It takes about 5-7 minutes.              │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   What you'll learn:                                     │   │
│  │                                                          │   │
│  │   • How easily you notice body sensations               │   │
│  │   • How you respond to uncomfortable sensations         │   │
│  │   • How you use body awareness for self-regulation      │   │
│  │   • How much you trust signals from your body           │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Start Assessment (~5 min)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Last taken: Jan 15, 2026 (16 days ago)                        │
│  Recommended: Retake every 4-6 weeks                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Question Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                                           Question 5/37 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░           │
│                                                                 │
│                                                                 │
│                                                                 │
│         When I am tense, I notice where the tension             │
│         is located in my body.                                  │
│                                                                 │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                        Never                             │   │
│  │                          0                               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                       Rarely                             │   │
│  │                          1                               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                      Sometimes                           │   │
│  │                          2                               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                        Often                             │   │
│  │                          3                               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                   Very Often                             │   │
│  │                          4                               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                       Always                             │   │
│  │                          5                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
│                   [Save and continue later]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### MAIA-2 Subscales

| Subscale             | Questions | Description                                 |
| -------------------- | --------- | ------------------------------------------- |
| Noticing             | 4         | Awareness of body sensations                |
| Not-Distracting      | 6         | Not ignoring/distracting from discomfort    |
| Not-Worrying         | 5         | Not worrying about uncomfortable sensations |
| Attention Regulation | 7         | Ability to sustain attention to body        |
| Emotional Awareness  | 5         | Connection between body and emotions        |
| Self-Regulation      | 4         | Using body awareness to self-regulate       |
| Body Listening       | 3         | Active listening to body for insight        |
| Trusting             | 3         | Trust in body signals                       |

### Scoring

```typescript
interface MAIAScoring {
    // Score = mean of items in subscale (0-5 scale)
    // Some items are reverse-scored (see MAIA-2 documentation)

    subscale: MAIASubscale;
    items: number[]; // Question IDs in this subscale
    reversed: number[]; // Question IDs that are reverse-scored
}

const MAIA_SUBSCALES: MAIAScoring[] = [
    {
        subscale: 'noticing',
        items: [1, 2, 3, 4],
        reversed: [],
    },
    {
        subscale: 'not-distracting',
        items: [5, 6, 7, 8, 9, 10],
        reversed: [5, 6, 7], // Items 5-7 are reverse-scored
    },
    // ... etc
];

function calculateSubscaleScore(answers: MAIAAnswer[], scoring: MAIAScoring): number {
    const relevantAnswers = answers.filter(a => scoring.items.includes(a.questionId));

    const scores = relevantAnswers.map(a => {
        const value = a.value;
        // Reverse score if needed: 5 - value
        return scoring.reversed.includes(a.questionId) ? 5 - value : value;
    });

    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}
```

### Results Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                          🎉                                     │
│                                                                 │
│                  Assessment Complete                            │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  Your Scores                                             │   │
│  │                                                          │   │
│  │  Noticing              ▓▓▓▓▓▓▓▓▓░░░░░░░  3.8            │   │
│  │  Not-Distracting       ▓▓▓▓▓▓░░░░░░░░░░  2.5            │   │
│  │  Not-Worrying          ▓▓▓▓▓▓▓░░░░░░░░░  2.9            │   │
│  │  Attention Regulation  ▓▓▓▓▓▓▓▓░░░░░░░░  3.2            │   │
│  │  Emotional Awareness   ▓▓▓▓▓▓▓▓▓░░░░░░░  3.6            │   │
│  │  Self-Regulation       ▓▓▓▓▓▓░░░░░░░░░░  2.4            │   │
│  │  Body Listening        ▓▓▓▓▓▓▓▓░░░░░░░░  3.1            │   │
│  │  Trusting              ▓▓▓▓▓░░░░░░░░░░░  2.0            │   │
│  │                                                          │   │
│  │  Overall Average: 3.0 / 5.0                              │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  What this means:                                        │   │
│  │                                                          │   │
│  │  Your strongest area is Noticing - you're already       │   │
│  │  aware of body sensations.                              │   │
│  │                                                          │   │
│  │  An area to develop is Trusting - building a sense     │   │
│  │  that your body is a safe place.                        │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   View Full Results                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                     [Go to Dashboard]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Visualization Components

### MAIA Radar Chart

Displays 8 subscale scores on a radar/spider chart.

```typescript
interface MAIARadarChartProps {
    currentScores: MAIAScore[];
    previousScores?: MAIAScore[]; // For comparison
    showLabels: boolean;
    interactive: boolean; // Tap subscale for details
}
```

**Visual**:

```
                    Noticing (3.8)
                        ╱╲
                      ╱    ╲
       Trusting ────╱        ╲──── Not-Distracting
          (2.0)   ╱     ○     ╲      (2.5)
                 │      ╱╲     │
    Body        │     ╱    ╲   │      Not-Worrying
    Listening ──│────       ───│────    (2.9)
      (3.1)     │   ╲      ╱   │
                 │    ╲    ╱    │
       Self-    ╲     ╲  ╱    ╱     Attention
    Regulation   ╲     ╲╱   ╱      Regulation
        (2.4)     ╲       ╱          (3.2)
                   ╲    ╱
                    ╲╱
               Emotional
               Awareness (3.6)

    ─── Current   ╌╌╌ Previous (if available)
```

**Behavior**:

- Filled polygon shows current scores
- Dashed line shows previous scores (if comparing)
- Tap subscale label → subscale detail view
- Scale: 0 (center) to 5 (edge)

### Streak Calendar

Month view showing practice activity.

```typescript
interface StreakCalendarProps {
    practiceData: Map<string, number>; // date -> session count
    month: Date;
    onDateTap?: (date: Date) => void;
}
```

**Visual**:

```
January 2026
┌────┬────┬────┬────┬────┬────┬────┐
│ S  │ M  │ T  │ W  │ T  │ F  │ S  │
├────┼────┼────┼────┼────┼────┼────┤
│    │    │    │ 1░ │ 2▓ │ 3▓ │ 4▓ │
├────┼────┼────┼────┼────┼────┼────┤
│ 5▓ │ 6░ │ 7░ │ 8▓ │ 9▓ │10▓ │11▓ │
├────┼────┼────┼────┼────┼────┼────┤
│12▓ │13░ │14░ │15▓ │16▓ │17▓ │18▓ │
├────┼────┼────┼────┼────┼────┼────┤
│19▓ │20░ │21▓ │22▓ │23▓ │24▓ │25▓ │
├────┼────┼────┼────┼────┼────┼────┤
│26▓ │27  │28  │29  │30  │31  │    │
└────┴────┴────┴────┴────┴────┴────┘

░ = No practice    ▓ = Practiced
```

**Behavior**:

- Swipe to change months
- Tap day → show sessions for that day
- Color intensity can indicate session count
- Current day highlighted

### Body Coverage Map

Shows which body regions have been practiced.

```typescript
interface BodyCoverageProps {
    practicedRegions: Map<BodyRegion, number>; // region -> session count
    highlightStrength: boolean; // Vary color by practice count
}
```

**Visual**: SVG body outline with regions colored by practice frequency.

| Practice Count | Color        |
| -------------- | ------------ |
| 0              | Gray (empty) |
| 1-2            | Light blue   |
| 3-5            | Medium blue  |
| 6+             | Dark blue    |

### Trend Line Chart

Shows subscale scores over time.

```typescript
interface TrendChartProps {
    assessments: MAIAAssessment[];
    subscales: MAIASubscale[]; // Which subscales to show
    timeRange: 'all' | '6months' | '3months';
}
```

**Visual**:

```
Score
  5 │
    │                    ╭─○
  4 │              ╭────○
    │        ╭────○
  3 │  ╭────○
    │ ○
  2 │
    │
  1 │
    └───────────────────────────── Time
       Jan    Feb    Mar    Apr
```

**Behavior**:

- Each line represents a subscale
- Points show assessment dates
- Tap point → assessment details
- Legend shows subscale names

---

## Insights & Recommendations

### Insight Generation

Insights are generated based on user data patterns:

```typescript
interface InsightEngine {
    // Generate insights based on current state
    generateInsights(userData: UserProgressData): Insight[];
}

interface UserProgressData {
    sessions: Session[];
    assessments: MAIAAssessment[];
    vocabulary: SensationDescription[];
    streak: StreakData;
    bodyRegionCoverage: Map<BodyRegion, number>;
}

interface Insight {
    id: string;
    type: InsightType;
    priority: 'high' | 'medium' | 'low';
    title: string;
    body: string;
    action?: InsightAction;
    generatedAt: Date;
    dismissedAt?: Date;
}

type InsightType =
    | 'celebration' // Positive achievement
    | 'suggestion' // Recommended action
    | 'pattern' // Observed pattern
    | 'reminder' // Gentle nudge
    | 'milestone'; // Progress milestone
```

### Insight Examples

#### Celebration

```
┌─────────────────────────────────────────────────────────────────┐
│  🎉 Milestone                                                   │
│                                                                 │
│  You've completed 10 exercises this month!                      │
│  That's 3 more than last month.                                 │
│                                                                 │
│  [View History →]                                              │
└─────────────────────────────────────────────────────────────────┘
```

#### Suggestion

```
┌─────────────────────────────────────────────────────────────────┐
│  💡 Suggestion                                                  │
│                                                                 │
│  You've practiced heart sensations 8 times.                     │
│  Try expanding to chest and stomach regions.                    │
│                                                                 │
│  [Try: Stomach at Rest →]                                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Pattern                                                     │
│                                                                 │
│  You practice most consistently on weekday mornings.            │
│  Consider setting a regular practice time.                      │
│                                                                 │
│  [Set Reminder →]                                              │
└─────────────────────────────────────────────────────────────────┘
```

#### Reminder

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 Reminder                                                    │
│                                                                 │
│  It's been 6 weeks since your last assessment.                  │
│  Retaking it will show your progress.                           │
│                                                                 │
│  [Take Assessment →]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Insight Rules

```typescript
const insightRules: InsightRule[] = [
    // Celebration: First exercise
    {
        condition: data => data.sessions.length === 1,
        generate: () => ({
            type: 'celebration',
            title: 'First Practice Complete!',
            body: "You've taken your first step toward better body awareness.",
        }),
    },

    // Suggestion: Low body region coverage
    {
        condition: data => data.bodyRegionCoverage.size < 4 && data.sessions.length >= 5,
        generate: data => {
            const covered = [...data.bodyRegionCoverage.keys()];
            const suggested = suggestNextRegion(covered);
            return {
                type: 'suggestion',
                title: 'Expand Your Practice',
                body: `You've focused on ${covered.join(', ')}. Try ${suggested} next.`,
                action: {
                    label: `Try: ${getExerciseForRegion(suggested)}`,
                    exerciseId: getExerciseIdForRegion(suggested),
                },
            };
        },
    },

    // Reminder: Assessment due
    {
        condition: data => {
            const lastAssessment = data.assessments[data.assessments.length - 1];
            if (!lastAssessment) return data.sessions.length >= 10; // First assessment after 10 sessions
            const daysSince = daysBetween(lastAssessment.completedAt, new Date());
            return daysSince >= 42; // 6 weeks
        },
        generate: () => ({
            type: 'reminder',
            title: 'Time for a Check-In',
            body: 'Retake the assessment to see how your awareness has changed.',
            action: {
                label: 'Take Assessment',
                route: '/progress/assessment',
            },
        }),
    },
];
```

---

## Data Export

### Export Functionality

Users can export their data for privacy/portability (GDPR compliance).

**Route**: `/(app)/settings/data`

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Settings                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Data                                                      │
│                                                                 │
│  All your data is stored locally on this device.                │
│  You can export or delete it at any time.                       │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📤 Export Data                                          │   │
│  │                                                          │   │
│  │  Download all your data in JSON format.                  │   │
│  │  Includes: exercises, vocabulary, assessments.           │   │
│  │                                                          │   │
│  │  [Export All Data]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🗑️ Delete Data                                          │   │
│  │                                                          │   │
│  │  Permanently delete all your data from this device.      │   │
│  │  This cannot be undone.                                  │   │
│  │                                                          │   │
│  │  [Delete All Data]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                                                 │
│  Data Statistics                                                │
│  ───────────────────────────────────────────────────────────   │
│  Sessions completed:        12                                  │
│  Vocabulary entries:        23                                  │
│  MAIA assessments:          2                                   │
│  First activity:           Jan 1, 2026                         │
│  Last activity:            Jan 31, 2026                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Export Format

```typescript
interface ExportData {
    exportedAt: string; // ISO 8601
    appVersion: string;

    // User profile
    profile: {
        createdAt: string;
        onboardingCompletedAt?: string;
    };

    // Exercise sessions
    sessions: {
        id: string;
        exerciseId: string;
        exerciseName: string;
        startedAt: string;
        completedAt?: string;
        completed: boolean;
        descriptions: {
            phaseId: string;
            bodyRegion: string;
            text: string;
        }[];
        emotions: {
            phaseId: string;
            emotion: string;
        }[];
    }[];

    // Vocabulary
    vocabulary: {
        id: string;
        text: string;
        category: string;
        bodyRegion: string;
        emotionConnection?: string;
        createdAt: string;
        shared: boolean;
    }[];

    // MAIA assessments
    assessments: {
        id: string;
        completedAt: string;
        answers: {
            questionId: number;
            value: number;
        }[];
        scores: {
            subscale: string;
            score: number;
        }[];
    }[];
}
```

### Delete Confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                          ⚠️                                     │
│                                                                 │
│                  Delete All Your Data?                          │
│                                                                 │
│                                                                 │
│  This will permanently delete:                                  │
│                                                                 │
│  • 12 exercise sessions                                         │
│  • 23 vocabulary entries                                        │
│  • 2 MAIA assessments                                          │
│  • All settings and preferences                                 │
│                                                                 │
│  This action cannot be undone.                                  │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                       Keep Data                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                [Delete Everything Permanently]                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## TypeScript Types

### Progress Types

```typescript
import { z } from 'zod';

/**
 * MAIA-2 subscale identifier.
 */
export const MAIASubscale = z.enum([
    'noticing',
    'not-distracting',
    'not-worrying',
    'attention-regulation',
    'emotional-awareness',
    'self-regulation',
    'body-listening',
    'trusting',
]);

export type MAIASubscale = z.infer<typeof MAIASubscale>;

/**
 * Individual subscale score.
 */
export const MAIAScore = z.object({
    subscale: MAIASubscale,
    score: z.number().min(0).max(5),
    itemCount: z.number(),
});

export type MAIAScore = z.infer<typeof MAIAScore>;

/**
 * Complete MAIA-2 assessment.
 */
export const MAIAAssessment = z.object({
    id: z.string().uuid(),
    completedAt: z.date(),
    answers: z.array(
        z.object({
            questionId: z.number().min(1).max(37),
            value: z.number().min(0).max(5),
        })
    ),
    scores: z.array(MAIAScore),
    averageScore: z.number().min(0).max(5),
});

export type MAIAAssessment = z.infer<typeof MAIAAssessment>;
```

### Stats Types

```typescript
/**
 * Overall progress statistics.
 */
export const ProgressStats = z.object({
    // Session stats
    totalSessions: z.number(),
    completedSessions: z.number(),
    sessionsThisWeek: z.number(),
    sessionsThisMonth: z.number(),

    // Streak stats
    currentStreak: z.number(),
    longestStreak: z.number(),
    lastPracticeDate: z.date().optional(),

    // Vocabulary stats
    totalVocabulary: z.number(),
    sharedVocabulary: z.number(),
    confirmationsReceived: z.number(),

    // Coverage stats
    bodyRegionsCovered: z.number(),
    totalBodyRegions: z.number(),
    regionPracticeCounts: z.record(z.string(), z.number()),

    // Assessment stats
    totalAssessments: z.number(),
    latestAssessment: z.custom<MAIAAssessment>().optional(),
    averageScoreChange: z.number().optional(), // vs first assessment
});

export type ProgressStats = z.infer<typeof ProgressStats>;

/**
 * Streak calculation data.
 */
export const StreakData = z.object({
    currentStreak: z.number(),
    longestStreak: z.number(),
    practiceDates: z.array(z.string()), // ISO date strings
    lastPracticeDate: z.string().optional(),
});

export type StreakData = z.infer<typeof StreakData>;
```

### Insight Types

```typescript
/**
 * Insight type categories.
 */
export const InsightType = z.enum([
    'celebration',
    'suggestion',
    'pattern',
    'reminder',
    'milestone',
]);

export type InsightType = z.infer<typeof InsightType>;

/**
 * Action associated with an insight.
 */
export const InsightAction = z.object({
    label: z.string(),
    route: z.string().optional(),
    exerciseId: z.string().uuid().optional(),
});

export type InsightAction = z.infer<typeof InsightAction>;

/**
 * Generated insight.
 */
export const Insight = z.object({
    id: z.string().uuid(),
    type: InsightType,
    priority: z.enum(['high', 'medium', 'low']),
    title: z.string(),
    body: z.string(),
    action: InsightAction.optional(),
    generatedAt: z.date(),
    dismissedAt: z.date().optional(),
});

export type Insight = z.infer<typeof Insight>;
```

### Export Types

```typescript
/**
 * Data export structure.
 */
export const ExportData = z.object({
    exportedAt: z.string().datetime(),
    appVersion: z.string(),

    profile: z.object({
        createdAt: z.string().datetime(),
        onboardingCompletedAt: z.string().datetime().optional(),
    }),

    sessions: z.array(
        z.object({
            id: z.string().uuid(),
            exerciseId: z.string().uuid(),
            exerciseName: z.string(),
            startedAt: z.string().datetime(),
            completedAt: z.string().datetime().optional(),
            completed: z.boolean(),
            descriptions: z.array(
                z.object({
                    phaseId: z.string(),
                    bodyRegion: z.string(),
                    text: z.string(),
                })
            ),
            emotions: z.array(
                z.object({
                    phaseId: z.string(),
                    emotion: z.string(),
                })
            ),
        })
    ),

    vocabulary: z.array(
        z.object({
            id: z.string().uuid(),
            text: z.string(),
            category: z.string(),
            bodyRegion: z.string(),
            emotionConnection: z.string().optional(),
            createdAt: z.string().datetime(),
            shared: z.boolean(),
        })
    ),

    assessments: z.array(
        z.object({
            id: z.string().uuid(),
            completedAt: z.string().datetime(),
            answers: z.array(
                z.object({
                    questionId: z.number(),
                    value: z.number(),
                })
            ),
            scores: z.array(
                z.object({
                    subscale: z.string(),
                    score: z.number(),
                })
            ),
        })
    ),
});

export type ExportData = z.infer<typeof ExportData>;
```

---

## Store Interface

### Progress Store

```typescript
import { writable, derived } from 'svelte/store';

interface ProgressStoreState {
    stats: ProgressStats | null;
    assessments: MAIAAssessment[];
    insights: Insight[];
    loading: boolean;
    error: string | null;
}

function createProgressStore() {
    const { subscribe, set, update } = writable<ProgressStoreState>({
        stats: null,
        assessments: [],
        insights: [],
        loading: true,
        error: null,
    });

    return {
        subscribe,

        async load(): Promise<void> {
            update(s => ({ ...s, loading: true }));
            try {
                const [stats, assessments] = await Promise.all([
                    calculateProgressStats(),
                    loadAssessments(),
                ]);
                const insights = generateInsights({ stats, assessments });
                update(s => ({
                    ...s,
                    stats,
                    assessments,
                    insights,
                    loading: false,
                }));
            } catch (error) {
                update(s => ({
                    ...s,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                }));
            }
        },

        async saveAssessment(assessment: MAIAAssessment): Promise<void> {
            await db.put('assessments', assessment);
            update(s => ({
                ...s,
                assessments: [...s.assessments, assessment],
            }));
            // Recalculate stats and insights
            await this.load();
        },

        dismissInsight(insightId: string): void {
            update(s => ({
                ...s,
                insights: s.insights.map(i =>
                    i.id === insightId ? { ...i, dismissedAt: new Date() } : i
                ),
            }));
        },

        async exportData(): Promise<ExportData> {
            return await generateExportData();
        },

        async deleteAllData(): Promise<void> {
            await db.clear('sessions');
            await db.clear('vocabulary');
            await db.clear('assessments');
            await db.clear('settings');
            set({
                stats: null,
                assessments: [],
                insights: [],
                loading: false,
                error: null,
            });
        },
    };
}

export const progressStore = createProgressStore();

// Derived stores
export const currentStreak = derived(
    progressStore,
    $progress => $progress.stats?.currentStreak ?? 0
);

export const latestMAIAScores = derived(
    progressStore,
    $progress => $progress.assessments[$progress.assessments.length - 1]?.scores ?? []
);

export const activeInsights = derived(progressStore, $progress =>
    $progress.insights.filter(i => !i.dismissedAt)
);
```

### Assessment Store

```typescript
interface AssessmentStoreState {
    inProgress: boolean;
    currentQuestion: number;
    answers: Map<number, number>;
    startedAt: Date | null;
}

function createAssessmentStore() {
    const { subscribe, set, update } = writable<AssessmentStoreState>({
        inProgress: false,
        currentQuestion: 0,
        answers: new Map(),
        startedAt: null,
    });

    return {
        subscribe,

        start(): void {
            set({
                inProgress: true,
                currentQuestion: 0,
                answers: new Map(),
                startedAt: new Date(),
            });
        },

        answer(questionId: number, value: number): void {
            update(s => {
                const answers = new Map(s.answers);
                answers.set(questionId, value);
                return {
                    ...s,
                    answers,
                    currentQuestion: s.currentQuestion + 1,
                };
            });
        },

        previous(): void {
            update(s => ({
                ...s,
                currentQuestion: Math.max(0, s.currentQuestion - 1),
            }));
        },

        async complete(): Promise<MAIAAssessment> {
            const state = get(assessmentStore);
            const answers = [...state.answers.entries()].map(([questionId, value]) => ({
                questionId,
                value,
            }));
            const scores = calculateAllScores(answers);
            const assessment: MAIAAssessment = {
                id: crypto.randomUUID(),
                completedAt: new Date(),
                answers,
                scores,
                averageScore: scores.reduce((sum, s) => sum + s.score, 0) / scores.length,
            };
            await progressStore.saveAssessment(assessment);
            set({
                inProgress: false,
                currentQuestion: 0,
                answers: new Map(),
                startedAt: null,
            });
            return assessment;
        },

        cancel(): void {
            set({
                inProgress: false,
                currentQuestion: 0,
                answers: new Map(),
                startedAt: null,
            });
        },
    };
}

export const assessmentStore = createAssessmentStore();
```

---

## Related Specifications

- [EXERCISE-SYSTEM.md](./EXERCISE-SYSTEM.md) - Session data structure
- [INTEROCEPTION-RESEARCH.md](./INTEROCEPTION-RESEARCH.md) - MAIA-2 background
- [APP-NAVIGATION.md](./APP-NAVIGATION.md) - Progress route integration
- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Chart accessibility requirements

---

_Last updated: February 2026_
