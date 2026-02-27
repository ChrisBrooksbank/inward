import { describe, it, expect } from 'vitest';
import { SEED_EXERCISES } from './exercises';
import { Exercise, BodyRegion } from '$lib/types/domain';

// All 16 body regions from the domain schema
const ALL_BODY_REGIONS = BodyRegion.options;

// All 6 exercise categories
const ALL_CATEGORIES = [
    'body-scan',
    'focused-attention',
    'movement-integrated',
    'heartbeat-detection',
    'breath-awareness',
    'thermal-awareness',
] as const;

const ALL_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

describe('SEED_EXERCISES', () => {
    it('contains exactly 18 exercises (6 categories × 3 difficulties)', () => {
        expect(SEED_EXERCISES).toHaveLength(18);
    });

    it('has one exercise per category-difficulty combination', () => {
        for (const category of ALL_CATEGORIES) {
            for (const difficulty of ALL_DIFFICULTIES) {
                const matches = SEED_EXERCISES.filter(
                    e => e.category === category && e.difficulty === difficulty
                );
                expect(matches).toHaveLength(1);
            }
        }
    });

    it('has unique IDs across all exercises', () => {
        const ids = SEED_EXERCISES.map(e => e.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(SEED_EXERCISES.length);
    });

    it('covers all 16 body regions', () => {
        const covered = new Set(SEED_EXERCISES.flatMap(e => e.bodyRegions));
        for (const region of ALL_BODY_REGIONS) {
            expect(covered.has(region)).toBe(true);
        }
    });

    it('each exercise validates against the Exercise Zod schema', () => {
        for (const exercise of SEED_EXERCISES) {
            const result = Exercise.safeParse(exercise);
            expect(result.success, `Exercise "${exercise.name}" failed validation`).toBe(true);
        }
    });

    it('all beginner exercises require zero prior completions', () => {
        const beginners = SEED_EXERCISES.filter(e => e.difficulty === 'beginner');
        for (const exercise of beginners) {
            expect(exercise.requiredCompletions).toBe(0);
            expect(exercise.requiredLevel).toBeUndefined();
        }
    });

    it('all intermediate exercises require beginner level', () => {
        const intermediates = SEED_EXERCISES.filter(e => e.difficulty === 'intermediate');
        for (const exercise of intermediates) {
            expect(exercise.requiredLevel).toBe('beginner');
            expect(exercise.requiredCompletions).toBeGreaterThan(0);
        }
    });

    it('all advanced exercises require intermediate level', () => {
        const advanced = SEED_EXERCISES.filter(e => e.difficulty === 'advanced');
        for (const exercise of advanced) {
            expect(exercise.requiredLevel).toBe('intermediate');
            expect(exercise.requiredCompletions).toBeGreaterThan(0);
        }
    });

    it('totalDurationSeconds matches sum of phase durations', () => {
        for (const exercise of SEED_EXERCISES) {
            const sum = exercise.phases.reduce((acc, p) => acc + p.durationSeconds, 0);
            expect(sum).toBe(exercise.totalDurationSeconds);
        }
    });

    it('all phase durations are within valid range (5–120s)', () => {
        for (const exercise of SEED_EXERCISES) {
            for (const phase of exercise.phases) {
                expect(phase.durationSeconds).toBeGreaterThanOrEqual(5);
                expect(phase.durationSeconds).toBeLessThanOrEqual(120);
            }
        }
    });

    it('each exercise has at least one describe phase with promptForDescription', () => {
        for (const exercise of SEED_EXERCISES) {
            const describePhases = exercise.phases.filter(
                p => p.type === 'describe' && p.promptForDescription
            );
            expect(describePhases.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('all exercises are marked as built-in', () => {
        for (const exercise of SEED_EXERCISES) {
            expect(exercise.isBuiltIn).toBe(true);
        }
    });

    it('each exercise has at least one body region and signal type', () => {
        for (const exercise of SEED_EXERCISES) {
            expect(exercise.bodyRegions.length).toBeGreaterThanOrEqual(1);
            expect(exercise.signalTypes.length).toBeGreaterThanOrEqual(1);
        }
    });
});
