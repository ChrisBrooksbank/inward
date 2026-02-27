/**
 * Helper logic for the MAIA-2 progress section in the Progress tab.
 * Selects current and baseline assessments for before/after comparison.
 */

import type { MAIAAssessment, MAIAScore } from '$lib/types/domain';

export interface MAIAProgressData {
    currentScores: MAIAScore[];
    baselineScores: MAIAScore[] | null;
    currentDate: Date;
    baselineDate: Date | null;
}

/**
 * Sort assessments chronologically (oldest first).
 */
export function sortAssessments(assessments: MAIAAssessment[]): MAIAAssessment[] {
    return [...assessments].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
}

/**
 * Select current (latest) and baseline (oldest) scores from assessments.
 * Returns null if assessments is empty.
 * Returns baselineScores as null when only one assessment exists.
 */
export function selectProgressScores(assessments: MAIAAssessment[]): MAIAProgressData | null {
    if (assessments.length === 0) return null;

    const sorted = sortAssessments(assessments);
    const current = sorted[sorted.length - 1];
    const baseline = sorted.length > 1 ? sorted[0] : null;

    return {
        currentScores: current.scores,
        baselineScores: baseline?.scores ?? null,
        currentDate: current.completedAt,
        baselineDate: baseline?.completedAt ?? null,
    };
}
