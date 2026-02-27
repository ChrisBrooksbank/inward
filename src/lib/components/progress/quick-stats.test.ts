import { describe, it, expect } from 'vitest';
import type { BodyRegion, ExerciseSession, SensationDescription } from '$lib/types/domain';
import {
    toDateString,
    calculateCurrentStreak,
    countBodyRegions,
    calculateQuickStats,
} from './quick-stats';

// =============================================================================
// Test helpers
// =============================================================================

function makeSession(completedAt?: string, regions: BodyRegion[] = []): ExerciseSession {
    return {
        id: crypto.randomUUID(),
        exerciseId: crypto.randomUUID(),
        state: completedAt ? 'completed' : 'idle',
        startedAt: new Date('2026-01-01T10:00:00'),
        completedAt: completedAt ? new Date(completedAt + 'T10:00:00') : undefined,
        phasesCompleted: 1,
        totalPhases: 1,
        descriptions: regions.map(r => ({
            phaseId: 'phase-1',
            bodyRegion: r,
            text: 'test',
            timestamp: new Date(),
        })),
        emotionConnections: [],
    };
}

function makeDesc(bodyRegion: BodyRegion): SensationDescription {
    return {
        id: crypto.randomUUID(),
        text: 'a feeling',
        category: 'physical',
        bodyRegion,
        createdAt: new Date(),
        updatedAt: new Date(),
        sharingLevel: 'private',
    };
}

// =============================================================================
// toDateString
// =============================================================================

describe('toDateString', () => {
    it('formats a date as YYYY-MM-DD', () => {
        const d = new Date(2026, 0, 15); // Jan 15 2026 local time
        expect(toDateString(d)).toBe('2026-01-15');
    });

    it('zero-pads month and day', () => {
        const d = new Date(2026, 1, 5); // Feb 5
        expect(toDateString(d)).toBe('2026-02-05');
    });
});

// =============================================================================
// calculateCurrentStreak
// =============================================================================

describe('calculateCurrentStreak', () => {
    it('returns 0 when there are no sessions', () => {
        expect(calculateCurrentStreak([], '2026-01-15')).toBe(0);
    });

    it('returns 0 when no sessions are completed', () => {
        const sessions = [makeSession()];
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(0);
    });

    it('returns 0 when most recent session is 2+ days ago', () => {
        const sessions = [makeSession('2026-01-13')];
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(0);
    });

    it('returns 1 when practiced today', () => {
        const sessions = [makeSession('2026-01-15')];
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(1);
    });

    it('returns 1 when practiced yesterday', () => {
        const sessions = [makeSession('2026-01-14')];
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(1);
    });

    it('counts consecutive days correctly', () => {
        const sessions = [
            makeSession('2026-01-13'),
            makeSession('2026-01-14'),
            makeSession('2026-01-15'),
        ];
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(3);
    });

    it('stops at a gap in the streak', () => {
        const sessions = [
            makeSession('2026-01-10'), // not consecutive
            makeSession('2026-01-13'),
            makeSession('2026-01-14'),
            makeSession('2026-01-15'),
        ];
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(3);
    });

    it('counts a single session yesterday as streak of 1', () => {
        const sessions = [makeSession('2026-01-14')];
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(1);
    });

    it('handles multiple sessions on the same day as one streak day', () => {
        const sessions = [makeSession('2026-01-15'), makeSession('2026-01-15')];
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(1);
    });

    it('ignores abandoned or idle sessions', () => {
        const sessions = [makeSession(), makeSession()]; // both idle
        expect(calculateCurrentStreak(sessions, '2026-01-15')).toBe(0);
    });
});

// =============================================================================
// countBodyRegions
// =============================================================================

describe('countBodyRegions', () => {
    it('returns 0 with no data', () => {
        expect(countBodyRegions([], [])).toBe(0);
    });

    it('counts unique regions from descriptions', () => {
        const descs = [makeDesc('heart'), makeDesc('stomach'), makeDesc('heart')];
        expect(countBodyRegions([], descs)).toBe(2);
    });

    it('counts unique regions from session descriptions', () => {
        const sessions = [makeSession('2026-01-15', ['heart', 'lungs'])];
        expect(countBodyRegions(sessions, [])).toBe(2);
    });

    it('merges regions across sessions and descriptions', () => {
        const sessions = [makeSession('2026-01-15', ['heart'])];
        const descs = [makeDesc('stomach'), makeDesc('heart')];
        expect(countBodyRegions(sessions, descs)).toBe(2);
    });

    it('deduplicates across multiple sessions', () => {
        const sessions = [
            makeSession('2026-01-14', ['heart']),
            makeSession('2026-01-15', ['heart', 'lungs']),
        ];
        expect(countBodyRegions(sessions, [])).toBe(2);
    });
});

// =============================================================================
// calculateQuickStats
// =============================================================================

describe('calculateQuickStats', () => {
    it('returns all zeros for empty data', () => {
        const result = calculateQuickStats([], [], '2026-01-15');
        expect(result).toEqual({
            totalSessions: 0,
            uniqueWords: 0,
            streakDays: 0,
            regionsExplored: 0,
        });
    });

    it('counts only completed sessions', () => {
        const sessions = [makeSession('2026-01-15'), makeSession()];
        const result = calculateQuickStats(sessions, [], '2026-01-15');
        expect(result.totalSessions).toBe(1);
    });

    it('counts all vocabulary descriptions as unique words', () => {
        const descs = [makeDesc('heart'), makeDesc('stomach')];
        const result = calculateQuickStats([], descs, '2026-01-15');
        expect(result.uniqueWords).toBe(2);
    });

    it('calculates streak correctly', () => {
        const sessions = [makeSession('2026-01-14'), makeSession('2026-01-15')];
        const result = calculateQuickStats(sessions, [], '2026-01-15');
        expect(result.streakDays).toBe(2);
    });

    it('counts unique body regions', () => {
        const sessions = [makeSession('2026-01-15', ['heart'])];
        const descs = [makeDesc('stomach')];
        const result = calculateQuickStats(sessions, descs, '2026-01-15');
        expect(result.regionsExplored).toBe(2);
    });

    it('returns correct composite result for realistic data', () => {
        const sessions = [
            makeSession('2026-01-13', ['heart']),
            makeSession('2026-01-14', ['lungs']),
            makeSession('2026-01-15', ['stomach']),
            makeSession(), // idle — should not count
        ];
        const descs = [makeDesc('hands'), makeDesc('stomach')];
        const result = calculateQuickStats(sessions, descs, '2026-01-15');
        expect(result.totalSessions).toBe(3);
        expect(result.uniqueWords).toBe(2);
        expect(result.streakDays).toBe(3);
        expect(result.regionsExplored).toBe(4); // heart, lungs, stomach, hands
    });
});
