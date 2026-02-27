/**
 * Progressive unlock logic for the exercise system.
 * Determines which difficulty levels the user has unlocked based on
 * completed sessions, unique body regions explored, and vocabulary entries.
 *
 * Unlock criteria (from docs/EXERCISE-SYSTEM.md):
 *   intermediate: 5 beginner completions + 3 unique body regions
 *   advanced:     5 intermediate completions + 6 unique body regions + 10 vocabulary entries
 */

import type { Exercise, ExerciseSession, DifficultyLevel, BodyRegion } from '$lib/types/domain';

// =============================================================================
// Constants
// =============================================================================

export const UNLOCK_CRITERIA = {
    intermediate: {
        completedExercises: 5,
        uniqueBodyRegions: 3,
    },
    advanced: {
        completedExercises: 5,
        uniqueBodyRegions: 6,
        vocabularyEntries: 10,
    },
} as const;

// =============================================================================
// Types
// =============================================================================

interface IntermediateProgress {
    unlocked: boolean;
    completedBeginner: number;
    uniqueBodyRegions: number;
}

interface AdvancedProgress {
    unlocked: boolean;
    completedIntermediate: number;
    uniqueBodyRegions: number;
    vocabularyEntries: number;
}

export interface UnlockProgress {
    intermediate: IntermediateProgress;
    advanced: AdvancedProgress;
}

// =============================================================================
// Private helpers
// =============================================================================

function buildExerciseMap(exercises: Exercise[]): Map<string, Exercise> {
    return new Map(exercises.map(e => [e.id, e]));
}

function countCompletionsByLevel(
    sessions: ExerciseSession[],
    exerciseMap: Map<string, Exercise>,
    level: DifficultyLevel
): number {
    return sessions.filter(s => {
        if (s.state !== 'completed') return false;
        return exerciseMap.get(s.exerciseId)?.difficulty === level;
    }).length;
}

function collectBodyRegionsByLevel(
    sessions: ExerciseSession[],
    exerciseMap: Map<string, Exercise>,
    level: DifficultyLevel
): Set<BodyRegion> {
    const regions = new Set<BodyRegion>();
    for (const session of sessions) {
        if (session.state !== 'completed') continue;
        const exercise = exerciseMap.get(session.exerciseId);
        if (exercise?.difficulty !== level) continue;
        for (const region of exercise.bodyRegions) {
            regions.add(region);
        }
    }
    return regions;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Calculate how far the user is toward unlocking each difficulty level.
 *
 * @param sessions - All exercise sessions (completed and abandoned)
 * @param exercises - All available exercises (used to look up difficulty/bodyRegions)
 * @param vocabularyCount - Total vocabulary description entries the user has created
 */
export function calculateUnlockProgress(
    sessions: ExerciseSession[],
    exercises: Exercise[],
    vocabularyCount: number
): UnlockProgress {
    const exerciseMap = buildExerciseMap(exercises);

    const completedBeginner = countCompletionsByLevel(sessions, exerciseMap, 'beginner');
    const beginnerRegions = collectBodyRegionsByLevel(sessions, exerciseMap, 'beginner');
    const intermediateUnlocked =
        completedBeginner >= UNLOCK_CRITERIA.intermediate.completedExercises &&
        beginnerRegions.size >= UNLOCK_CRITERIA.intermediate.uniqueBodyRegions;

    const completedIntermediate = countCompletionsByLevel(sessions, exerciseMap, 'intermediate');
    const intermediateRegions = collectBodyRegionsByLevel(sessions, exerciseMap, 'intermediate');
    const advancedUnlocked =
        intermediateUnlocked &&
        completedIntermediate >= UNLOCK_CRITERIA.advanced.completedExercises &&
        intermediateRegions.size >= UNLOCK_CRITERIA.advanced.uniqueBodyRegions &&
        vocabularyCount >= UNLOCK_CRITERIA.advanced.vocabularyEntries;

    return {
        intermediate: {
            unlocked: intermediateUnlocked,
            completedBeginner,
            uniqueBodyRegions: beginnerRegions.size,
        },
        advanced: {
            unlocked: advancedUnlocked,
            completedIntermediate,
            uniqueBodyRegions: intermediateRegions.size,
            vocabularyEntries: vocabularyCount,
        },
    };
}

/**
 * Check whether a specific exercise is accessible to the user.
 * Beginner exercises are always unlocked.
 */
export function isExerciseUnlocked(exercise: Exercise, progress: UnlockProgress): boolean {
    if (exercise.difficulty === 'beginner') return true;
    if (exercise.difficulty === 'intermediate') return progress.intermediate.unlocked;
    return progress.advanced.unlocked;
}
