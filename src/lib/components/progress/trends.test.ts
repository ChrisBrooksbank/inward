import { describe, it, expect } from 'vitest';
import type { ExerciseSession, SensationDescription } from '$lib/types/domain';
import {
    getMonday,
    formatWeekLabel,
    toDateStr,
    buildSessionsPerWeek,
    buildVocabularyGrowth,
} from './trends';

// =============================================================================
// Test helpers
// =============================================================================

function makeSession(completedAt?: string): ExerciseSession {
    return {
        id: crypto.randomUUID(),
        exerciseId: crypto.randomUUID(),
        state: completedAt ? 'completed' : 'idle',
        startedAt: new Date('2026-01-01T10:00:00'),
        completedAt: completedAt ? new Date(completedAt + 'T10:00:00') : undefined,
        phasesCompleted: 1,
        totalPhases: 1,
        descriptions: [],
        emotionConnections: [],
    };
}

function makeDesc(createdAt: string): SensationDescription {
    return {
        id: crypto.randomUUID(),
        text: 'a sensation',
        category: 'physical',
        bodyRegion: 'heart',
        createdAt: new Date(createdAt + 'T10:00:00'),
        updatedAt: new Date(createdAt + 'T10:00:00'),
        sharingLevel: 'private',
    };
}

// =============================================================================
// getMonday
// =============================================================================

describe('getMonday', () => {
    it('returns the same Monday for a Monday input', () => {
        const monday = new Date(2026, 0, 5); // Jan 5, 2026 is a Monday
        expect(toDateStr(getMonday(monday))).toBe('2026-01-05');
    });

    it('returns the preceding Monday for a Wednesday', () => {
        const wednesday = new Date(2026, 0, 7); // Jan 7, 2026 is a Wednesday
        expect(toDateStr(getMonday(wednesday))).toBe('2026-01-05');
    });

    it('returns the preceding Monday for a Sunday', () => {
        const sunday = new Date(2026, 0, 11); // Jan 11, 2026 is a Sunday
        expect(toDateStr(getMonday(sunday))).toBe('2026-01-05');
    });

    it('returns the preceding Monday for a Saturday', () => {
        const saturday = new Date(2026, 0, 10); // Jan 10, 2026 is a Saturday
        expect(toDateStr(getMonday(saturday))).toBe('2026-01-05');
    });
});

// =============================================================================
// formatWeekLabel
// =============================================================================

describe('formatWeekLabel', () => {
    it('formats January date correctly', () => {
        expect(formatWeekLabel(new Date(2026, 0, 5))).toBe('Jan 5');
    });

    it('formats December date correctly', () => {
        expect(formatWeekLabel(new Date(2026, 11, 28))).toBe('Dec 28');
    });
});

// =============================================================================
// buildSessionsPerWeek
// =============================================================================

describe('buildSessionsPerWeek', () => {
    // today = Wednesday Jan 14, 2026. Monday of this week = Jan 12.
    const today = new Date('2026-01-14T12:00:00');

    it('returns weeksBack entries', () => {
        const result = buildSessionsPerWeek([], 8, today);
        expect(result).toHaveLength(8);
    });

    it('returns all zeros for no sessions', () => {
        const result = buildSessionsPerWeek([], 4, today);
        expect(result.every(p => p.count === 0)).toBe(true);
    });

    it('counts completed sessions in the correct week', () => {
        // Jan 13 (Tuesday) → week of Jan 12
        const sessions = [makeSession('2026-01-13')];
        const result = buildSessionsPerWeek(sessions, 4, today);
        const thisWeek = result[result.length - 1];
        expect(thisWeek.weekStart).toBe('2026-01-12');
        expect(thisWeek.count).toBe(1);
    });

    it('ignores non-completed sessions', () => {
        const sessions = [makeSession()]; // idle
        const result = buildSessionsPerWeek(sessions, 4, today);
        expect(result.every(p => p.count === 0)).toBe(true);
    });

    it('counts multiple sessions in the same week together', () => {
        const sessions = [makeSession('2026-01-12'), makeSession('2026-01-13')];
        const result = buildSessionsPerWeek(sessions, 2, today);
        const thisWeek = result[result.length - 1];
        expect(thisWeek.count).toBe(2);
    });

    it('distributes sessions across different weeks', () => {
        const sessions = [
            makeSession('2026-01-05'), // week of Jan 5
            makeSession('2026-01-12'), // week of Jan 12
            makeSession('2026-01-13'), // week of Jan 12
        ];
        const result = buildSessionsPerWeek(sessions, 2, today);
        expect(result[0].count).toBe(1); // Jan 5 week
        expect(result[1].count).toBe(2); // Jan 12 week
    });

    it('assigns correct week labels', () => {
        const result = buildSessionsPerWeek([], 2, today);
        // Last 2 weeks from Jan 14: Jan 5 week and Jan 12 week
        expect(result[0].weekLabel).toBe('Jan 5');
        expect(result[0].weekStart).toBe('2026-01-05');
        expect(result[1].weekLabel).toBe('Jan 12');
        expect(result[1].weekStart).toBe('2026-01-12');
    });

    it('sessions outside the window are ignored', () => {
        const sessions = [makeSession('2025-12-01')]; // far in the past
        const result = buildSessionsPerWeek(sessions, 4, today);
        expect(result.every(p => p.count === 0)).toBe(true);
    });
});

// =============================================================================
// buildVocabularyGrowth
// =============================================================================

describe('buildVocabularyGrowth', () => {
    const today = new Date('2026-01-14T12:00:00');

    it('returns weeksBack entries', () => {
        const result = buildVocabularyGrowth([], 8, today);
        expect(result).toHaveLength(8);
    });

    it('returns all zeros for no descriptions', () => {
        const result = buildVocabularyGrowth([], 4, today);
        expect(result.every(p => p.total === 0)).toBe(true);
    });

    it('includes vocab from before the window in first week total', () => {
        const descs = [makeDesc('2025-12-01')]; // before window
        const result = buildVocabularyGrowth(descs, 4, today);
        // Prior count should be included in every week's cumulative total
        expect(result[0].total).toBe(1);
        expect(result[result.length - 1].total).toBe(1);
    });

    it('accumulates vocab added during the window', () => {
        const descs = [
            makeDesc('2026-01-05'), // week of Jan 5
            makeDesc('2026-01-12'), // week of Jan 12
        ];
        const result = buildVocabularyGrowth(descs, 2, today);
        expect(result[0].total).toBe(1); // after Jan 5 week
        expect(result[1].total).toBe(2); // after Jan 12 week
    });

    it('total never decreases', () => {
        const descs = [makeDesc('2026-01-06'), makeDesc('2026-01-13')];
        const result = buildVocabularyGrowth(descs, 4, today);
        for (let i = 1; i < result.length; i++) {
            expect(result[i].total).toBeGreaterThanOrEqual(result[i - 1].total);
        }
    });

    it('combines prior and window vocab in cumulative total', () => {
        const descs = [
            makeDesc('2025-11-01'), // prior
            makeDesc('2025-11-02'), // prior
            makeDesc('2026-01-12'), // this week
        ];
        const result = buildVocabularyGrowth(descs, 2, today);
        expect(result[result.length - 1].total).toBe(3);
    });
});
