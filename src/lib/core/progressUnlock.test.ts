import { describe, it, expect } from 'vitest';
import { calculateUnlockProgress, isExerciseUnlocked, UNLOCK_CRITERIA } from './progressUnlock';
import type { Exercise, ExerciseSession, BodyRegion, DifficultyLevel } from '$lib/types/domain';

// =============================================================================
// Test helpers
// =============================================================================

let _sessionCounter = 0;

function makeSession(
    exerciseId: string,
    state: 'completed' | 'abandoned' = 'completed'
): ExerciseSession {
    const id = `session-${++_sessionCounter}`;
    return {
        id,
        exerciseId,
        state,
        startedAt: new Date('2026-01-01'),
        completedAt: state === 'completed' ? new Date('2026-01-01') : undefined,
        phasesCompleted: 4,
        totalPhases: 4,
        descriptions: [],
        emotionConnections: [],
    };
}

function makeExercise(
    id: string,
    difficulty: DifficultyLevel,
    bodyRegions: BodyRegion[]
): Exercise {
    // Cast: only id, difficulty, bodyRegions matter for unlock logic
    return { id, difficulty, bodyRegions } as Exercise;
}

// Reusable test exercises
const BEG_A = makeExercise('beg-a', 'beginner', ['heart', 'stomach']);
const BEG_B = makeExercise('beg-b', 'beginner', ['lungs']);
const BEG_C = makeExercise('beg-c', 'beginner', ['hands']);
const BEG_D = makeExercise('beg-d', 'beginner', ['feet']);
const BEG_E = makeExercise('beg-e', 'beginner', ['face']);
const BEG_SAME = makeExercise('beg-same', 'beginner', ['heart']); // same region as BEG_A

const INT_A = makeExercise('int-a', 'intermediate', ['chest', 'shoulders']);
const INT_B = makeExercise('int-b', 'intermediate', ['abdomen']);
const INT_C = makeExercise('int-c', 'intermediate', ['throat']);
const INT_D = makeExercise('int-d', 'intermediate', ['back']);
const INT_E = makeExercise('int-e', 'intermediate', ['arms']);
const INT_F = makeExercise('int-f', 'intermediate', ['neck']);

const ADV_A = makeExercise('adv-a', 'advanced', ['jaw']);

const ALL_EXERCISES = [
    BEG_A,
    BEG_B,
    BEG_C,
    BEG_D,
    BEG_E,
    BEG_SAME,
    INT_A,
    INT_B,
    INT_C,
    INT_D,
    INT_E,
    INT_F,
    ADV_A,
];

// Five beginner sessions covering 5+ body regions
function fiveBeginnerSessions(): ExerciseSession[] {
    return [BEG_A, BEG_B, BEG_C, BEG_D, BEG_E].map(e => makeSession(e.id));
}

// Five intermediate sessions covering 6+ unique body regions
function fiveIntermediateSessions(): ExerciseSession[] {
    return [INT_A, INT_B, INT_C, INT_D, INT_E, INT_F].slice(0, 5).map(e => makeSession(e.id));
}

// =============================================================================
// UNLOCK_CRITERIA constants
// =============================================================================

describe('UNLOCK_CRITERIA', () => {
    it('intermediate requires 5 completed exercises', () => {
        expect(UNLOCK_CRITERIA.intermediate.completedExercises).toBe(5);
    });

    it('intermediate requires 3 unique body regions', () => {
        expect(UNLOCK_CRITERIA.intermediate.uniqueBodyRegions).toBe(3);
    });

    it('advanced requires 5 completed exercises', () => {
        expect(UNLOCK_CRITERIA.advanced.completedExercises).toBe(5);
    });

    it('advanced requires 6 unique body regions', () => {
        expect(UNLOCK_CRITERIA.advanced.uniqueBodyRegions).toBe(6);
    });

    it('advanced requires 10 vocabulary entries', () => {
        expect(UNLOCK_CRITERIA.advanced.vocabularyEntries).toBe(10);
    });
});

// =============================================================================
// calculateUnlockProgress — intermediate
// =============================================================================

describe('calculateUnlockProgress – intermediate', () => {
    it('not unlocked with no sessions', () => {
        const result = calculateUnlockProgress([], ALL_EXERCISES, 0);
        expect(result.intermediate.unlocked).toBe(false);
    });

    it('not unlocked with 4 beginner completions', () => {
        const sessions = [BEG_A, BEG_B, BEG_C, BEG_D].map(e => makeSession(e.id));
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 0);
        expect(result.intermediate.unlocked).toBe(false);
    });

    it('not unlocked when 5 completions cover < 3 unique body regions', () => {
        // All 5 sessions use exercises with only 'heart' region
        const sessions = Array.from({ length: 5 }, () => makeSession(BEG_SAME.id));
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 0);
        expect(result.intermediate.unlocked).toBe(false);
    });

    it('unlocked with 5 completions and 3+ unique body regions', () => {
        const sessions = fiveBeginnerSessions();
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 0);
        expect(result.intermediate.unlocked).toBe(true);
    });

    it('abandoned sessions do not count toward unlock', () => {
        const sessions = [BEG_A, BEG_B, BEG_C, BEG_D, BEG_E].map(e =>
            makeSession(e.id, 'abandoned')
        );
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 0);
        expect(result.intermediate.unlocked).toBe(false);
    });

    it('reports correct completedBeginner count', () => {
        const sessions = [BEG_A, BEG_B, BEG_C].map(e => makeSession(e.id));
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 0);
        expect(result.intermediate.completedBeginner).toBe(3);
    });

    it('does not count intermediate sessions toward beginner count', () => {
        const sessions = [INT_A, INT_B, INT_C, INT_D, INT_E].map(e => makeSession(e.id));
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 0);
        expect(result.intermediate.completedBeginner).toBe(0);
    });

    it('reports correct uniqueBodyRegions from beginner sessions', () => {
        // BEG_A covers heart+stomach, BEG_B covers lungs → 3 unique regions
        const sessions = [BEG_A, BEG_B].map(e => makeSession(e.id));
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 0);
        expect(result.intermediate.uniqueBodyRegions).toBe(3);
    });
});

// =============================================================================
// calculateUnlockProgress — advanced
// =============================================================================

describe('calculateUnlockProgress – advanced', () => {
    it('not unlocked without intermediate unlocked first', () => {
        const sessions = fiveIntermediateSessions();
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 20);
        expect(result.advanced.unlocked).toBe(false);
    });

    it('not unlocked with intermediate unlocked but 4 intermediate completions', () => {
        const sessions = [
            ...fiveBeginnerSessions(),
            ...[INT_A, INT_B, INT_C, INT_D].map(e => makeSession(e.id)),
        ];
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 20);
        expect(result.advanced.unlocked).toBe(false);
    });

    it('not unlocked with intermediate unlocked but < 6 unique intermediate regions', () => {
        // 5 intermediate sessions, but only 5 unique regions (INT_A: chest+shoulders, B: abdomen, C: throat, D: back, E: arms = 6... actually that's 6)
        // So use exercises where regions overlap to get < 6
        const twoRegionExercise = makeExercise('int-x', 'intermediate', ['chest']);
        const exercises = [...ALL_EXERCISES, twoRegionExercise];
        const sessions = [
            ...fiveBeginnerSessions(),
            ...Array.from({ length: 5 }, () => makeSession(twoRegionExercise.id)),
        ];
        const result = calculateUnlockProgress(sessions, exercises, 20);
        expect(result.advanced.unlocked).toBe(false);
    });

    it('not unlocked with insufficient vocabulary entries', () => {
        const sessions = [...fiveBeginnerSessions(), ...fiveIntermediateSessions()];
        // INT_A: chest+shoulders, B: abdomen, C: throat, D: back, E: arms = 6 regions
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 9);
        expect(result.advanced.unlocked).toBe(false);
    });

    it('unlocked with all criteria met', () => {
        const sessions = [...fiveBeginnerSessions(), ...fiveIntermediateSessions()];
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 10);
        expect(result.advanced.unlocked).toBe(true);
    });

    it('reports correct completedIntermediate count', () => {
        const sessions = fiveIntermediateSessions();
        const result = calculateUnlockProgress(sessions, ALL_EXERCISES, 0);
        expect(result.advanced.completedIntermediate).toBe(5);
    });

    it('reports vocabulary entries from parameter', () => {
        const result = calculateUnlockProgress([], ALL_EXERCISES, 7);
        expect(result.advanced.vocabularyEntries).toBe(7);
    });
});

// =============================================================================
// isExerciseUnlocked
// =============================================================================

describe('isExerciseUnlocked', () => {
    const lockedProgress = calculateUnlockProgress([], ALL_EXERCISES, 0);
    const intermediateUnlocked = calculateUnlockProgress(fiveBeginnerSessions(), ALL_EXERCISES, 0);
    const fullyUnlocked = calculateUnlockProgress(
        [...fiveBeginnerSessions(), ...fiveIntermediateSessions()],
        ALL_EXERCISES,
        10
    );

    it('beginner exercise is always unlocked (no sessions)', () => {
        expect(isExerciseUnlocked(BEG_A, lockedProgress)).toBe(true);
    });

    it('beginner exercise is unlocked even when progress is locked', () => {
        expect(isExerciseUnlocked(BEG_B, lockedProgress)).toBe(true);
    });

    it('intermediate exercise is locked when intermediate not unlocked', () => {
        expect(isExerciseUnlocked(INT_A, lockedProgress)).toBe(false);
    });

    it('intermediate exercise is unlocked when intermediate unlocked', () => {
        expect(isExerciseUnlocked(INT_A, intermediateUnlocked)).toBe(true);
    });

    it('advanced exercise is locked when advanced not unlocked', () => {
        expect(isExerciseUnlocked(ADV_A, intermediateUnlocked)).toBe(false);
    });

    it('advanced exercise is unlocked when advanced unlocked', () => {
        expect(isExerciseUnlocked(ADV_A, fullyUnlocked)).toBe(true);
    });
});
