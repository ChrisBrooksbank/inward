import { describe, it, expect } from 'vitest';
import type {
    ExerciseSession,
    SensationDescription,
    MAIAAssessment,
    UserProfile,
} from '$lib/types/domain';
import { mapSession, mapVocab, mapAssessment, mapProfile } from './data-management';

// =============================================================================
// Test helpers
// =============================================================================

function makeSession(overrides: Partial<ExerciseSession> = {}): ExerciseSession {
    return {
        id: 'session-id-1',
        exerciseId: crypto.randomUUID(),
        state: 'completed',
        startedAt: new Date('2026-01-15T10:00:00Z'),
        completedAt: new Date('2026-01-15T10:10:00Z'),
        phasesCompleted: 3,
        totalPhases: 3,
        descriptions: [],
        emotionConnections: [],
        ...overrides,
    };
}

function makeDesc(overrides: Partial<SensationDescription> = {}): SensationDescription {
    return {
        id: 'desc-id-1',
        text: 'tight chest',
        category: 'physical',
        bodyRegion: 'chest',
        createdAt: new Date('2026-01-15T10:00:00Z'),
        updatedAt: new Date('2026-01-15T10:00:00Z'),
        sharingLevel: 'private',
        ...overrides,
    };
}

function makeAssessment(overrides: Partial<MAIAAssessment> = {}): MAIAAssessment {
    return {
        id: 'assessment-id-1',
        responses: Array(37).fill(3) as number[],
        scores: [
            { subscale: 'noticing', score: 3.0, measuredAt: new Date('2026-01-15T10:00:00Z') },
        ],
        completedAt: new Date('2026-01-15T10:00:00Z'),
        ...overrides,
    };
}

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
    return {
        id: 'profile-id-1',
        onboardingComplete: true,
        onboardingStep: 6,
        settings: {
            reducedMotion: false,
            fontSize: 'default',
            notificationsEnabled: false,
            syncConsentGiven: false,
        },
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-15T10:00:00Z'),
        ...overrides,
    };
}

// =============================================================================
// mapSession
// =============================================================================

describe('mapSession', () => {
    it('maps basic session fields', () => {
        const session = makeSession();
        const result = mapSession(session);
        expect(result.id).toBe('session-id-1');
        expect(result.exerciseId).toBe(session.exerciseId);
        expect(result.startedAt).toBe('2026-01-15T10:00:00.000Z');
        expect(result.completedAt).toBe('2026-01-15T10:10:00.000Z');
        expect(result.completed).toBe(true);
    });

    it('marks abandoned session as not completed', () => {
        const session = makeSession({ state: 'abandoned', completedAt: undefined });
        expect(mapSession(session).completed).toBe(false);
    });

    it('uses exerciseId as exerciseName when exercise not found', () => {
        const session = makeSession({ exerciseId: 'unknown-id' });
        expect(mapSession(session).exerciseName).toBe('unknown-id');
    });

    it('maps descriptions and emotion connections', () => {
        const session = makeSession({
            descriptions: [
                { phaseId: 'p1', bodyRegion: 'heart', text: 'flutter', timestamp: new Date() },
            ],
            emotionConnections: [
                { phaseId: 'p1', emotion: 'anxious', bodyRegion: 'heart', timestamp: new Date() },
            ],
        });
        const result = mapSession(session);
        expect(result.descriptions).toHaveLength(1);
        expect(result.descriptions[0]).toEqual({
            phaseId: 'p1',
            bodyRegion: 'heart',
            text: 'flutter',
        });
        expect(result.emotions).toHaveLength(1);
        expect(result.emotions[0]).toEqual({ phaseId: 'p1', emotion: 'anxious' });
    });

    it('omits completedAt when not set', () => {
        const session = makeSession({ completedAt: undefined });
        expect(mapSession(session).completedAt).toBeUndefined();
    });
});

// =============================================================================
// mapVocab
// =============================================================================

describe('mapVocab', () => {
    it('maps basic vocabulary fields', () => {
        const desc = makeDesc();
        const result = mapVocab(desc);
        expect(result.id).toBe('desc-id-1');
        expect(result.text).toBe('tight chest');
        expect(result.category).toBe('physical');
        expect(result.bodyRegion).toBe('chest');
        expect(result.createdAt).toBe('2026-01-15T10:00:00.000Z');
    });

    it('marks private description as not shared', () => {
        expect(mapVocab(makeDesc({ sharingLevel: 'private' })).shared).toBe(false);
    });

    it('marks anonymous description as shared', () => {
        expect(mapVocab(makeDesc({ sharingLevel: 'anonymous' })).shared).toBe(true);
    });

    it('marks attributed description as shared', () => {
        expect(mapVocab(makeDesc({ sharingLevel: 'attributed' })).shared).toBe(true);
    });

    it('includes emotionConnection when present', () => {
        const desc = makeDesc({ emotionConnection: 'anxiety' });
        expect(mapVocab(desc).emotionConnection).toBe('anxiety');
    });

    it('omits emotionConnection when absent', () => {
        expect(mapVocab(makeDesc()).emotionConnection).toBeUndefined();
    });
});

// =============================================================================
// mapAssessment
// =============================================================================

describe('mapAssessment', () => {
    it('maps id and completedAt', () => {
        const a = makeAssessment();
        const result = mapAssessment(a);
        expect(result.id).toBe('assessment-id-1');
        expect(result.completedAt).toBe('2026-01-15T10:00:00.000Z');
    });

    it('maps 37 responses to answers with 1-based questionId', () => {
        const a = makeAssessment();
        const result = mapAssessment(a);
        expect(result.answers).toHaveLength(37);
        expect(result.answers[0].questionId).toBe(1);
        expect(result.answers[36].questionId).toBe(37);
        expect(result.answers[0].value).toBe(3);
    });

    it('maps scores with subscale and score', () => {
        const a = makeAssessment();
        const result = mapAssessment(a);
        expect(result.scores).toHaveLength(1);
        expect(result.scores[0]).toEqual({ subscale: 'noticing', score: 3.0 });
    });
});

// =============================================================================
// mapProfile
// =============================================================================

describe('mapProfile', () => {
    it('returns default profile when undefined', () => {
        const result = mapProfile(undefined);
        expect(result.createdAt).toBeTruthy();
        expect(result.onboardingCompletedAt).toBeUndefined();
    });

    it('maps createdAt', () => {
        const profile = makeProfile();
        expect(mapProfile(profile).createdAt).toBe('2026-01-01T00:00:00.000Z');
    });

    it('sets onboardingCompletedAt from updatedAt when onboarding complete', () => {
        const profile = makeProfile({ onboardingComplete: true });
        expect(mapProfile(profile).onboardingCompletedAt).toBe('2026-01-15T10:00:00.000Z');
    });

    it('omits onboardingCompletedAt when onboarding not complete', () => {
        const profile = makeProfile({ onboardingComplete: false });
        expect(mapProfile(profile).onboardingCompletedAt).toBeUndefined();
    });
});
