import { describe, it, expect } from 'vitest';
import type { ExerciseSession } from '$lib/types/domain';
import {
    buildPracticeMap,
    getCalendarCells,
    calculateLongestStreak,
    getMonthLabel,
    navigateMonth,
} from './streak-calendar';

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

// =============================================================================
// buildPracticeMap
// =============================================================================

describe('buildPracticeMap', () => {
    it('returns empty map for no sessions', () => {
        expect(buildPracticeMap([])).toEqual(new Map());
    });

    it('ignores non-completed sessions', () => {
        const sessions = [makeSession()]; // idle
        expect(buildPracticeMap(sessions).size).toBe(0);
    });

    it('counts completed sessions per day', () => {
        const sessions = [
            makeSession('2026-01-15'),
            makeSession('2026-01-15'),
            makeSession('2026-01-16'),
        ];
        const map = buildPracticeMap(sessions);
        expect(map.get('2026-01-15')).toBe(2);
        expect(map.get('2026-01-16')).toBe(1);
    });

    it('only maps dates with sessions', () => {
        const sessions = [makeSession('2026-01-20')];
        const map = buildPracticeMap(sessions);
        expect(map.size).toBe(1);
        expect(map.get('2026-01-20')).toBe(1);
    });
});

// =============================================================================
// getCalendarCells
// =============================================================================

describe('getCalendarCells', () => {
    // January 2026 starts on a Thursday (day index 4)
    const jan2026 = new Date(2026, 0, 1);

    it('pads cells before the first day of the month', () => {
        const cells = getCalendarCells(jan2026, new Map());
        const paddingCells = cells.filter(c => c.date === null);
        // Jan 2026 starts on Thursday = 4 padding cells (Sun=0..Wed=3)
        expect(paddingCells.length).toBe(4);
    });

    it('includes all days of the month', () => {
        const cells = getCalendarCells(jan2026, new Map());
        const dayCells = cells.filter(c => c.date !== null);
        expect(dayCells.length).toBe(31);
    });

    it('marks days with sessions as practiced', () => {
        const practiceData = new Map([['2026-01-15', 2]]);
        const cells = getCalendarCells(jan2026, practiceData);
        const day15 = cells.find(c => c.dateStr === '2026-01-15');
        expect(day15?.isPracticed).toBe(true);
        expect(day15?.sessionCount).toBe(2);
    });

    it('marks days without sessions as not practiced', () => {
        const cells = getCalendarCells(jan2026, new Map());
        const day10 = cells.find(c => c.dateStr === '2026-01-10');
        expect(day10?.isPracticed).toBe(false);
        expect(day10?.sessionCount).toBe(0);
    });

    it('marks today correctly', () => {
        const practiceData = new Map<string, number>();
        const cells = getCalendarCells(jan2026, practiceData, '2026-01-20');
        const today = cells.find(c => c.isToday);
        expect(today?.dateStr).toBe('2026-01-20');
    });

    it('does not mark other days as today', () => {
        const cells = getCalendarCells(jan2026, new Map(), '2026-01-20');
        const todayCells = cells.filter(c => c.isToday);
        expect(todayCells.length).toBe(1);
    });

    it('returns null dateStr for padding cells', () => {
        const cells = getCalendarCells(jan2026, new Map());
        const padding = cells.filter(c => c.date === null);
        for (const p of padding) {
            expect(p.dateStr).toBeNull();
        }
    });
});

// =============================================================================
// calculateLongestStreak
// =============================================================================

describe('calculateLongestStreak', () => {
    it('returns 0 for empty array', () => {
        expect(calculateLongestStreak([])).toBe(0);
    });

    it('returns 1 for a single date', () => {
        expect(calculateLongestStreak(['2026-01-15'])).toBe(1);
    });

    it('returns streak length for consecutive days', () => {
        expect(calculateLongestStreak(['2026-01-13', '2026-01-14', '2026-01-15'])).toBe(3);
    });

    it('returns longest streak when there are gaps', () => {
        const dates = ['2026-01-01', '2026-01-02', '2026-01-10', '2026-01-11', '2026-01-12'];
        expect(calculateLongestStreak(dates)).toBe(3);
    });

    it('deduplicates same-day entries', () => {
        expect(calculateLongestStreak(['2026-01-15', '2026-01-15', '2026-01-16'])).toBe(2);
    });

    it('handles unsorted input', () => {
        expect(calculateLongestStreak(['2026-01-15', '2026-01-13', '2026-01-14'])).toBe(3);
    });
});

// =============================================================================
// getMonthLabel
// =============================================================================

describe('getMonthLabel', () => {
    it('formats month and year', () => {
        const label = getMonthLabel(new Date(2026, 0, 1));
        expect(label).toBe('January 2026');
    });

    it('formats a different month', () => {
        const label = getMonthLabel(new Date(2026, 11, 1));
        expect(label).toBe('December 2026');
    });
});

// =============================================================================
// navigateMonth
// =============================================================================

describe('navigateMonth', () => {
    it('goes forward one month', () => {
        const next = navigateMonth(new Date(2026, 0, 1), 1);
        expect(next.getMonth()).toBe(1);
        expect(next.getFullYear()).toBe(2026);
    });

    it('goes backward one month', () => {
        const prev = navigateMonth(new Date(2026, 0, 1), -1);
        expect(prev.getMonth()).toBe(11);
        expect(prev.getFullYear()).toBe(2025);
    });

    it('wraps forward across year boundary', () => {
        const next = navigateMonth(new Date(2026, 11, 1), 1);
        expect(next.getMonth()).toBe(0);
        expect(next.getFullYear()).toBe(2027);
    });
});
