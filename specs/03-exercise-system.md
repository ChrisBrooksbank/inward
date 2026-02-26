# Exercise System: Guide & Practice

## Overview

Enable users to practice interoception through guided, progressive exercises with a distraction-free player that captures vocabulary during and after practice.

## User Stories

- As a user, I want to choose exercises appropriate to my skill level so I'm not overwhelmed
- As a user, I want clear guidance during practice so I know exactly what to do
- As a user, I want to describe what I noticed after an exercise so I build my vocabulary
- As a user, I want to see my progress through unlocking harder exercises

## Requirements

### Exercise Library (from EXERCISE-SYSTEM.md)

- [ ] 6 exercise categories:
    - Body scan, Focused attention, Movement-integrated
    - Heartbeat detection, Breath awareness, Thermal awareness
- [ ] 3 difficulty levels: beginner, intermediate, advanced
- [ ] 16 body regions organized by signal detectability
- [ ] Exercise selection screen with filters (category, difficulty, body region)
- [ ] Progressive unlock: 5 beginner exercises + 6 regions → intermediate

### Exercise Player (from EXERCISE-PLAYER-UI.md)

- [ ] State machine: idle → loading → ready → playing → paused → completed/abandoned/error
- [ ] 6 phase types: instruction, movement, rest, notice, describe, reflect
- [ ] Circular countdown timer display
- [ ] Phase transition animations (respect prefers-reduced-motion)
- [ ] Minimal UI during attention phases (notice, rest)
- [ ] Pause/resume and safe abandon (progress saved)
- [ ] Navigation hidden during exercise playback

### Vocabulary Capture (from SENSATION-VOCABULARY.md)

- [ ] Description input during "describe" phases
- [ ] Emotion tagging after exercise completion
- [ ] Vocabulary suggestions from seed list and prior entries
- [ ] Body region association for each description

### Session Persistence (from EXERCISE-SYSTEM.md)

- [ ] Session data: exercise ID, phases completed, descriptions, emotions, timestamps
- [ ] Store sessions in IndexedDB
- [ ] Track completion state (completed vs abandoned)
- [ ] Calculate duration and engagement metrics

## Acceptance Criteria

- [ ] Can browse and select exercises from library
- [ ] Exercise player runs through all phases correctly
- [ ] Timer counts down accurately
- [ ] Can pause, resume, and abandon exercises
- [ ] Descriptions and emotions captured and persisted
- [ ] Session data written to IndexedDB on completion
- [ ] Progressive unlock logic works correctly
- [ ] `npm run check` passes

## Dependencies

- spec 01-foundation (routing, IndexedDB, stores, base components)
- Existing Zod types for exercises and sessions

## Reference Docs

- docs/EXERCISE-SYSTEM.md (exercise taxonomy, progression)
- docs/EXERCISE-PLAYER-UI.md (player UI, state machine)
- docs/SENSATION-VOCABULARY.md (vocabulary capture flow)
- docs/INTEROCEPTION-RESEARCH.md (training principles)
