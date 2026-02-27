import { describe, it, expect } from 'vitest';
import { filterExercises } from './exerciseFilters';
import { SEED_EXERCISES } from './exercises';

describe('filterExercises', () => {
    it('returns all exercises when no filters applied', () => {
        const result = filterExercises(SEED_EXERCISES, {
            category: null,
            difficulty: null,
            bodyRegion: null,
        });
        expect(result).toHaveLength(18);
    });

    it('filters by category', () => {
        const result = filterExercises(SEED_EXERCISES, {
            category: 'body-scan',
            difficulty: null,
            bodyRegion: null,
        });
        expect(result).toHaveLength(3);
        expect(result.every(e => e.category === 'body-scan')).toBe(true);
    });

    it('filters by difficulty', () => {
        const result = filterExercises(SEED_EXERCISES, {
            category: null,
            difficulty: 'beginner',
            bodyRegion: null,
        });
        expect(result).toHaveLength(6);
        expect(result.every(e => e.difficulty === 'beginner')).toBe(true);
    });

    it('filters by body region', () => {
        const result = filterExercises(SEED_EXERCISES, {
            category: null,
            difficulty: null,
            bodyRegion: 'heart',
        });
        expect(result.length).toBeGreaterThan(0);
        expect(result.every(e => e.bodyRegions.includes('heart'))).toBe(true);
    });

    it('combines category and difficulty filters', () => {
        const result = filterExercises(SEED_EXERCISES, {
            category: 'body-scan',
            difficulty: 'beginner',
            bodyRegion: null,
        });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Quick Body Scan');
    });

    it('returns empty array when no exercises match filters', () => {
        // body-scan beginner exercises do not include forehead
        const result = filterExercises(SEED_EXERCISES, {
            category: 'body-scan',
            difficulty: 'beginner',
            bodyRegion: 'forehead',
        });
        expect(result).toHaveLength(0);
    });

    it('filters with all three criteria combined', () => {
        const result = filterExercises(SEED_EXERCISES, {
            category: 'heartbeat-detection',
            difficulty: 'advanced',
            bodyRegion: 'forehead',
        });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Subtle Pulse Awareness');
    });

    it('returns exercises matching region across all categories', () => {
        const result = filterExercises(SEED_EXERCISES, {
            category: null,
            difficulty: null,
            bodyRegion: 'hands',
        });
        expect(result.every(e => e.bodyRegions.includes('hands'))).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array for empty exercise list', () => {
        const result = filterExercises([], {
            category: 'body-scan',
            difficulty: null,
            bodyRegion: null,
        });
        expect(result).toHaveLength(0);
    });
});
