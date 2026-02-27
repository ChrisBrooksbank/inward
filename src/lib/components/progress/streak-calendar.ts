/**
 * Streak calendar logic for the Progress dashboard.
 * Computes practice data maps, calendar grids, and streak statistics.
 */

import type { ExerciseSession } from '$lib/types/domain';
import { toDateString } from './quick-stats';

export interface StreakCalendarCell {
    date: Date | null;
    dateStr: string | null;
    sessionCount: number;
    isToday: boolean;
    isPracticed: boolean;
}

/**
 * Build a map of date strings (YYYY-MM-DD) to completed session counts.
 */
export function buildPracticeMap(sessions: ExerciseSession[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const session of sessions) {
        if (session.state === 'completed' && session.completedAt) {
            const dateStr = toDateString(session.completedAt);
            map.set(dateStr, (map.get(dateStr) ?? 0) + 1);
        }
    }
    return map;
}

/**
 * Generate calendar grid cells for a given month.
 * Returns cells starting from Sunday, with null for padding days.
 */
export function getCalendarCells(
    month: Date,
    practiceData: Map<string, number>,
    todayStr?: string
): StreakCalendarCell[] {
    const today = todayStr ?? toDateString(new Date());
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const startDayOfWeek = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cells: StreakCalendarCell[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
        cells.push({
            date: null,
            dateStr: null,
            sessionCount: 0,
            isToday: false,
            isPracticed: false,
        });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        const dateStr = toDateString(date);
        const sessionCount = practiceData.get(dateStr) ?? 0;
        cells.push({
            date,
            dateStr,
            sessionCount,
            isToday: dateStr === today,
            isPracticed: sessionCount > 0,
        });
    }

    return cells;
}

/**
 * Calculate the longest streak from a list of practice date strings (YYYY-MM-DD).
 * Duplicate dates are deduplicated first.
 */
export function calculateLongestStreak(practiceDates: string[]): number {
    const unique = [...new Set(practiceDates)].sort();
    if (unique.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < unique.length; i++) {
        const prev = new Date(unique[i - 1] + 'T12:00:00');
        const curr = new Date(unique[i] + 'T12:00:00');
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);

        if (diffDays === 1) {
            current++;
            if (current > longest) longest = current;
        } else {
            current = 1;
        }
    }

    return longest;
}

/**
 * Format a month as "Month YYYY" (e.g. "January 2026").
 */
export function getMonthLabel(month: Date): string {
    return month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Return a new Date shifted by the given number of months.
 */
export function navigateMonth(month: Date, direction: -1 | 1): Date {
    return new Date(month.getFullYear(), month.getMonth() + direction, 1);
}
