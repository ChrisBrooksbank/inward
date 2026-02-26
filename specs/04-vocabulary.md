# Vocabulary: Build & Discover Language for Sensations

## Overview

Help users develop personal language for internal sensations, browse their growing vocabulary, and discover shared descriptions from the community.

## User Stories

- As a user, I want to see all the words I've used to describe sensations so I can track my growth
- As a user, I want to discover how others describe similar sensations so I learn new vocabulary
- As a user, I want to confirm "I feel this too" on shared descriptions to build collective understanding

## Requirements

### Personal Vocabulary (from SENSATION-VOCABULARY.md)

- [ ] Vocabulary list view grouped by body region
- [ ] 5 vocabulary categories: physical, emotional, metaphorical, quality, intensity
- [ ] Search and filter (by region, signal type, emotion, category)
- [ ] View description history with timestamps and exercise context
- [ ] Seed vocabulary: 25 pre-loaded terms for common sensations

### Shared Discovery (from SENSATION-VOCABULARY.md)

- [ ] Browse shared vocabulary by body region
- [ ] Sort by confirmation count (popular first)
- [ ] Confirmation action: "Yes, I feel this too"
- [ ] 3 sharing levels: private (default), anonymous, attributed
- [ ] Share toggle on individual descriptions

### Vocabulary UI (from SENSATION-VOCABULARY.md)

- [ ] "Words" tab in bottom navigation
- [ ] Body region selector/grid
- [ ] Description cards with metadata (category, region, emotion, confirmations)
- [ ] Contextual suggestions after exercises (link to exercise flow)

## Acceptance Criteria

- [ ] Personal vocabulary renders with correct grouping
- [ ] Search and filter work across all dimensions
- [ ] Can share a description and see it in shared feed
- [ ] Can confirm shared descriptions
- [ ] Seed vocabulary loads on first use
- [ ] Confirmation counts update correctly
- [ ] `npm run check` passes

## Dependencies

- spec 01-foundation (IndexedDB, stores, base components)
- spec 03-exercise-system (vocabulary capture during exercises)

## Reference Docs

- docs/SENSATION-VOCABULARY.md (full vocabulary model)
- docs/ACCESSIBILITY.md (language guidelines)
