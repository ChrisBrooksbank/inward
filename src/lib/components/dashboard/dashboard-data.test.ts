import { describe, it, expect } from 'vitest';
import { buildDashboardData } from './dashboard-data';
import type { ExerciseSession, SensationDescription } from '$lib/types/domain';
import { SEED_EXERCISES } from '$lib/core/exercises';

const exerciseId = SEED_EXERCISES[0].id;

function makeSession(overrides: Partial<ExerciseSession> = {}): ExerciseSession {
    return {
        id: crypto.randomUUID(),
        exerciseId,
        state: 'completed',
        startedAt: new Date('2026-01-01T10:00:00Z'),
        completedAt: new Date('2026-01-01T10:15:00Z'),
        phasesCompleted: 4,
        totalPhases: 4,
        descriptions: [],
        emotionConnections: [],
        ...overrides,
    };
}

function makeDescription(overrides: Partial<SensationDescription> = {}): SensationDescription {
    return {
        id: crypto.randomUUID(),
        text: 'warmth',
        category: 'physical',
        bodyRegion: 'chest',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        sharingLevel: 'private',
        ...overrides,
    };
}

describe('buildDashboardData', () => {
    it('returns zero stats with empty data', () => {
        const result = buildDashboardData([], []);
        expect(result.stats.totalSessions).toBe(0);
        expect(result.stats.uniqueWords).toBe(0);
        expect(result.recentSessions).toHaveLength(0);
    });

    it('returns up to 3 most recent sessions', () => {
        const sessions = [1, 2, 3, 4].map(i =>
            makeSession({
                completedAt: new Date(`2026-01-0${i}T10:00:00Z`),
            })
        );
        const result = buildDashboardData(sessions, []);
        expect(result.recentSessions).toHaveLength(3);
        expect(result.recentSessions[0].completedAt.getDate()).toBe(4);
    });

    it('excludes non-completed sessions from recent', () => {
        const sessions = [makeSession(), makeSession({ state: 'playing', completedAt: undefined })];
        const result = buildDashboardData(sessions, []);
        expect(result.recentSessions).toHaveLength(1);
    });

    it('includes exercise name in recent sessions', () => {
        const result = buildDashboardData([makeSession()], []);
        expect(result.recentSessions[0].exerciseName).toBe(SEED_EXERCISES[0].name);
    });

    it('falls back to first seed exercise id for nextExerciseId', () => {
        const result = buildDashboardData([], []);
        expect(result.nextExerciseId).toBe(SEED_EXERCISES[0].id);
    });

    it('counts descriptions in stats', () => {
        const descriptions = [makeDescription(), makeDescription()];
        const result = buildDashboardData([], descriptions);
        expect(result.stats.uniqueWords).toBe(2);
    });
});
