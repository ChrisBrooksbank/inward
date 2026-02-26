# Progress: Track Growth & Get Insights

## Overview

Motivate users with honest progress visualization, actionable insights based on practice patterns, and full data portability.

## User Stories

- As a user, I want to see how my interoceptive awareness has improved over time
- As a user, I want suggestions on what to practice next based on my history
- As a user, I want to export or delete all my data for privacy

## Requirements

### Dashboard (from PROGRESS-DASHBOARD.md)

- [ ] Quick stats row: total sessions, unique words, streak days, body regions explored
- [ ] Practice streak calendar (heatmap style)
- [ ] Body coverage map showing which regions have been practiced
- [ ] MAIA-2 radar chart (8 subscales) if assessment completed

### Insights Engine (from PROGRESS-DASHBOARD.md)

- [ ] 5 insight types: celebration, suggestion, pattern, reminder, milestone
- [ ] 8 generation rules based on practice data:
    - New region explored → celebration
    - Vocabulary growth → celebration
    - Underexplored regions → suggestion
    - Streak maintenance → encouragement
    - Streak broken → gentle reminder
    - Assessment improvement → milestone
- [ ] Maximum 3 insights shown at once

### Trends (from PROGRESS-DASHBOARD.md)

- [ ] Sessions per week chart
- [ ] Vocabulary growth over time
- [ ] MAIA-2 comparison (if multiple assessments)

### Data Management (from PROGRESS-DASHBOARD.md)

- [ ] Export all data as JSON
- [ ] Delete all data with confirmation
- [ ] GDPR-compliant data portability

## Acceptance Criteria

- [ ] Dashboard renders with correct stats from IndexedDB
- [ ] Insights generate correctly based on practice data
- [ ] Charts render with real session data
- [ ] Export produces valid JSON with all user data
- [ ] Delete removes all data from IndexedDB
- [ ] Empty states show encouraging messages for new users
- [ ] `npm run check` passes

## Dependencies

- spec 01-foundation (IndexedDB, stores)
- spec 03-exercise-system (session data)
- spec 04-vocabulary (word counts)
- spec 02-onboarding (MAIA-2 assessment data)

## Reference Docs

- docs/PROGRESS-DASHBOARD.md (full dashboard spec)
- docs/INTEROCEPTION-RESEARCH.md (MAIA-2 framework)
