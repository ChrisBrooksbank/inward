/**
 * Quick stats calculation logic for the Progress dashboard.
 * Computes total sessions, unique words, streak days, and body regions explored.
 */

import type { ExerciseSession, SensationDescription } from '$lib/types/domain';

export interface QuickStatsData {
    totalSessions: number;
    uniqueWords: number;
    streakDays: number;
    regionsExplored: number;
}

/**
 * Format a Date as a YYYY-MM-DD string in local time.
 * Exported for testing convenience.
 */
export function toDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Calculate the current practice streak (consecutive days ending today or yesterday).
 * Accepts an optional todayStr (YYYY-MM-DD) to simplify testing.
 */
export function calculateCurrentStreak(sessions: ExerciseSession[], todayStr?: string): number {
    const completed = sessions.filter(s => s.state === 'completed' && s.completedAt);
    if (completed.length === 0) return 0;

    const practiceDates = new Set(completed.map(s => toDateString(s.completedAt!)));

    const today = todayStr ?? toDateString(new Date());
    const todayDate = new Date(today + 'T12:00:00');
    const yesterday = toDateString(new Date(todayDate.getTime() - 86400000));

    const anchor = practiceDates.has(today)
        ? today
        : practiceDates.has(yesterday)
          ? yesterday
          : null;

    if (!anchor) return 0;

    let streak = 0;
    let cur = new Date(anchor + 'T12:00:00');

    while (practiceDates.has(toDateString(cur))) {
        streak++;
        cur = new Date(cur.getTime() - 86400000);
    }

    return streak;
}

/**
 * Count unique body regions across session descriptions and vocabulary entries.
 */
export function countBodyRegions(
    sessions: ExerciseSession[],
    descriptions: SensationDescription[]
): number {
    const regions = new Set<string>();

    for (const s of sessions) {
        for (const d of s.descriptions) {
            regions.add(d.bodyRegion);
        }
    }

    for (const d of descriptions) {
        regions.add(d.bodyRegion);
    }

    return regions.size;
}

/**
 * Compute all four quick stats from raw session and description data.
 */
export function calculateQuickStats(
    sessions: ExerciseSession[],
    descriptions: SensationDescription[],
    todayStr?: string
): QuickStatsData {
    const totalSessions = sessions.filter(s => s.state === 'completed').length;
    const uniqueWords = descriptions.length;
    const streakDays = calculateCurrentStreak(sessions, todayStr);
    const regionsExplored = countBodyRegions(sessions, descriptions);

    return { totalSessions, uniqueWords, streakDays, regionsExplored };
}
