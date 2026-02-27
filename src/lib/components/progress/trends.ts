/**
 * Trend calculation logic for the Progress dashboard.
 * Provides sessions-per-week and vocabulary-growth-over-time data.
 */

import type { ExerciseSession, SensationDescription } from '$lib/types/domain';

export interface WeeklySessionData {
    weekLabel: string;
    weekStart: string; // YYYY-MM-DD (Monday of that week)
    count: number;
}

export interface VocabGrowthPoint {
    weekLabel: string;
    weekStart: string; // YYYY-MM-DD (Monday of that week)
    total: number; // cumulative vocab count at end of this week
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Get the Monday of the week containing the given date (local time). */
export function getMonday(d: Date): Date {
    const result = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = result.getDay(); // 0=Sunday, 1=Monday, …
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    return result;
}

/** Format a Date as "Mon D" (e.g. "Jan 5"). */
export function formatWeekLabel(d: Date): string {
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Format a Date as YYYY-MM-DD (local time). */
export function toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

/** Build an array of Monday dates going back weeksBack weeks from thisMonday. */
function buildWeekStarts(thisMonday: Date, weeksBack: number): Date[] {
    const weeks: Date[] = [];
    for (let i = weeksBack - 1; i >= 0; i--) {
        weeks.push(new Date(thisMonday.getTime() - i * 7 * 24 * 60 * 60 * 1000));
    }
    return weeks;
}

/**
 * Build sessions-per-week data for the last `weeksBack` weeks.
 * Only counts completed sessions.
 */
export function buildSessionsPerWeek(
    sessions: ExerciseSession[],
    weeksBack = 8,
    today?: Date
): WeeklySessionData[] {
    const thisMonday = getMonday(today ?? new Date());
    const weekCounts = new Map<string, number>();

    for (const s of sessions) {
        if (s.state === 'completed' && s.completedAt) {
            const key = toDateStr(getMonday(s.completedAt));
            weekCounts.set(key, (weekCounts.get(key) ?? 0) + 1);
        }
    }

    return buildWeekStarts(thisMonday, weeksBack).map(weekStart => ({
        weekLabel: formatWeekLabel(weekStart),
        weekStart: toDateStr(weekStart),
        count: weekCounts.get(toDateStr(weekStart)) ?? 0,
    }));
}

/**
 * Build cumulative vocabulary growth over the last `weeksBack` weeks.
 * Vocab created before the window is included in the first week's total.
 */
export function buildVocabularyGrowth(
    descriptions: SensationDescription[],
    weeksBack = 8,
    today?: Date
): VocabGrowthPoint[] {
    const thisMonday = getMonday(today ?? new Date());
    const weeks = buildWeekStarts(thisMonday, weeksBack);
    const windowStart = weeks[0];

    const weekNew = new Map<string, number>();
    let priorCount = 0;

    for (const d of descriptions) {
        const monday = getMonday(d.createdAt);
        if (monday.getTime() < windowStart.getTime()) {
            priorCount++;
        } else {
            const key = toDateStr(monday);
            weekNew.set(key, (weekNew.get(key) ?? 0) + 1);
        }
    }

    let cumulative = priorCount;
    return weeks.map(weekStart => {
        cumulative += weekNew.get(toDateStr(weekStart)) ?? 0;
        return {
            weekLabel: formatWeekLabel(weekStart),
            weekStart: toDateStr(weekStart),
            total: cumulative,
        };
    });
}
