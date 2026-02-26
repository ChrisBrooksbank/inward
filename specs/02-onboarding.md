# Onboarding: Teach & Build Trust

## Overview

Guide first-time users through understanding interoception, build trust with transparent privacy messaging, and deliver a quick win with their first exercise.

## User Stories

- As a new user, I want to understand what interoception is so I know why this app exists
- As a new user, I want to know my data stays private so I feel safe using the app
- As a new user, I want to try a quick exercise immediately so I can see value fast

## Requirements

### Onboarding Flow (from ONBOARDING-FLOW.md)

- [ ] 6 skippable/resumable steps:
    1. Welcome - app purpose and tone
    2. What is Interoception - brief education
    3. Privacy & Data - transparent data handling explanation
    4. Optional Baseline Assessment - abbreviated MAIA-2 (can skip)
    5. First Exercise - guided "Heart After Movement" (beginner)
    6. Complete - celebrate and transition to main app
- [ ] Progress saved to IndexedDB after each step (resumable on refresh)
- [ ] Non-judgmental, trauma-informed language ("notice" not "feel")
- [ ] 8th grade reading level max
- [ ] Skip button on every step
- [ ] Progress indicator showing current step

### MAIA-2 Assessment (from PROGRESS-DASHBOARD.md, INTEROCEPTION-RESEARCH.md)

- [ ] 37-item questionnaire with 8 subscales
- [ ] 6-point Likert scale (0=Never to 5=Always)
- [ ] Pausable and resumable
- [ ] Results stored locally, never shared
- [ ] Radar chart preview of baseline results

## Acceptance Criteria

- [ ] Complete onboarding flow end-to-end
- [ ] Each step renders and saves progress
- [ ] Can skip any step and resume later
- [ ] Assessment scores calculated correctly for 8 subscales
- [ ] Onboarding completion flag prevents re-showing
- [ ] Route guard redirects to onboarding for new users
- [ ] All text passes readability check (8th grade level)

## Dependencies

- spec 01-foundation (routing, IndexedDB, stores)
- Exercise player needed for step 5 (can stub initially)

## Reference Docs

- docs/ONBOARDING-FLOW.md (full step definitions)
- docs/INTEROCEPTION-RESEARCH.md (MAIA-2 details)
- docs/ACCESSIBILITY.md (language guidelines)
