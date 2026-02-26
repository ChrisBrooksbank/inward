import { describe, it, expect } from 'vitest';
import {
    ExerciseCategory,
    DifficultyLevel,
    PhaseType,
    ExercisePhase,
    Exercise,
    SessionState,
    ExerciseSession,
    ExerciseProgress,
    MAIASubscale,
    MAIAScore,
    MAIAAssessment,
    UserSettings,
    UserProfile,
} from './domain';

const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_UUID_2 = '550e8400-e29b-41d4-a716-446655440001';

describe('ExerciseCategory', () => {
    it('should validate all 6 categories', () => {
        expect(ExerciseCategory.parse('body-scan')).toBe('body-scan');
        expect(ExerciseCategory.parse('focused-attention')).toBe('focused-attention');
        expect(ExerciseCategory.parse('movement-integrated')).toBe('movement-integrated');
        expect(ExerciseCategory.parse('heartbeat-detection')).toBe('heartbeat-detection');
        expect(ExerciseCategory.parse('breath-awareness')).toBe('breath-awareness');
        expect(ExerciseCategory.parse('thermal-awareness')).toBe('thermal-awareness');
    });

    it('should reject invalid categories', () => {
        expect(() => ExerciseCategory.parse('yoga')).toThrow();
        expect(() => ExerciseCategory.parse('')).toThrow();
    });
});

describe('DifficultyLevel', () => {
    it('should validate all 3 levels', () => {
        expect(DifficultyLevel.parse('beginner')).toBe('beginner');
        expect(DifficultyLevel.parse('intermediate')).toBe('intermediate');
        expect(DifficultyLevel.parse('advanced')).toBe('advanced');
    });

    it('should reject invalid levels', () => {
        expect(() => DifficultyLevel.parse('expert')).toThrow();
        expect(() => DifficultyLevel.parse('easy')).toThrow();
    });
});

describe('PhaseType', () => {
    it('should validate all 6 phase types', () => {
        expect(PhaseType.parse('instruction')).toBe('instruction');
        expect(PhaseType.parse('movement')).toBe('movement');
        expect(PhaseType.parse('rest')).toBe('rest');
        expect(PhaseType.parse('notice')).toBe('notice');
        expect(PhaseType.parse('describe')).toBe('describe');
        expect(PhaseType.parse('reflect')).toBe('reflect');
    });

    it('should reject invalid phase types', () => {
        expect(() => PhaseType.parse('breathing')).toThrow();
    });
});

describe('ExercisePhase', () => {
    it('should validate a minimal phase', () => {
        const phase = {
            id: 'p1',
            type: 'instruction',
            durationSeconds: 10,
            instruction: 'Take a deep breath.',
        };
        const result = ExercisePhase.parse(phase);
        expect(result.type).toBe('instruction');
        expect(result.promptForDescription).toBe(false);
        expect(result.promptForEmotion).toBe(false);
    });

    it('should validate a describe phase with all fields', () => {
        const phase = {
            id: 'p2',
            type: 'describe',
            durationSeconds: 20,
            instruction: 'Describe what you felt.',
            bodyRegion: 'heart',
            promptForDescription: true,
        };
        const result = ExercisePhase.parse(phase);
        expect(result.bodyRegion).toBe('heart');
        expect(result.promptForDescription).toBe(true);
    });

    it('should reject duration below minimum', () => {
        const phase = { id: 'p1', type: 'rest', durationSeconds: 4, instruction: 'Stop.' };
        expect(() => ExercisePhase.parse(phase)).toThrow();
    });

    it('should reject duration above maximum', () => {
        const phase = { id: 'p1', type: 'notice', durationSeconds: 121, instruction: 'Notice.' };
        expect(() => ExercisePhase.parse(phase)).toThrow();
    });
});

describe('Exercise', () => {
    const validPhase = {
        id: 'p1',
        type: 'notice',
        durationSeconds: 30,
        instruction: 'Notice your heartbeat.',
        bodyRegion: 'heart',
    };

    const validExercise = {
        id: TEST_UUID,
        name: 'Heart After Movement',
        description: 'Notice your heartbeat after movement.',
        category: 'movement-integrated',
        difficulty: 'beginner',
        bodyRegions: ['heart'],
        signalTypes: ['cardiac'],
        phases: [validPhase],
        totalDurationSeconds: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('should validate a complete exercise with defaults', () => {
        const result = Exercise.parse(validExercise);
        expect(result.name).toBe('Heart After Movement');
        expect(result.isBuiltIn).toBe(true);
        expect(result.requiredCompletions).toBe(0);
    });

    it('should validate an exercise with unlock criteria', () => {
        const result = Exercise.parse({ ...validExercise, requiredLevel: 'beginner' });
        expect(result.requiredLevel).toBe('beginner');
    });

    it('should reject an exercise with empty bodyRegions', () => {
        expect(() => Exercise.parse({ ...validExercise, bodyRegions: [] })).toThrow();
    });

    it('should reject an exercise with no phases', () => {
        expect(() => Exercise.parse({ ...validExercise, phases: [] })).toThrow();
    });
});

describe('SessionState', () => {
    it('should validate all session states', () => {
        expect(SessionState.parse('idle')).toBe('idle');
        expect(SessionState.parse('playing')).toBe('playing');
        expect(SessionState.parse('paused')).toBe('paused');
        expect(SessionState.parse('completed')).toBe('completed');
        expect(SessionState.parse('abandoned')).toBe('abandoned');
    });

    it('should reject invalid states', () => {
        expect(() => SessionState.parse('running')).toThrow();
    });
});

describe('ExerciseSession', () => {
    const validSession = {
        id: TEST_UUID,
        exerciseId: TEST_UUID_2,
        state: 'completed',
        startedAt: new Date('2026-01-01T10:00:00Z'),
        completedAt: new Date('2026-01-01T10:02:00Z'),
        phasesCompleted: 4,
        totalPhases: 4,
        descriptions: [
            {
                phaseId: 'p3',
                bodyRegion: 'heart',
                text: 'pounding and fast',
                timestamp: new Date(),
            },
        ],
        emotionConnections: [],
    };

    it('should validate a completed session', () => {
        const result = ExerciseSession.parse(validSession);
        expect(result.state).toBe('completed');
        expect(result.descriptions).toHaveLength(1);
        expect(result.emotionConnections).toHaveLength(0);
    });

    it('should validate an abandoned session without completedAt', () => {
        const abandoned = { ...validSession, state: 'abandoned', completedAt: undefined };
        const result = ExerciseSession.parse(abandoned);
        expect(result.state).toBe('abandoned');
        expect(result.completedAt).toBeUndefined();
    });

    it('should validate optional difficulty rating', () => {
        const result = ExerciseSession.parse({ ...validSession, difficultyRating: 3 });
        expect(result.difficultyRating).toBe(3);
    });

    it('should reject difficulty rating out of range', () => {
        expect(() => ExerciseSession.parse({ ...validSession, difficultyRating: 6 })).toThrow();
    });
});

describe('ExerciseProgress', () => {
    it('should validate exercise progress', () => {
        const progress = {
            exerciseId: TEST_UUID,
            totalAttempts: 3,
            completedAttempts: 2,
            uniqueDescriptions: 5,
            unlocked: true,
        };
        const result = ExerciseProgress.parse(progress);
        expect(result.completedAttempts).toBe(2);
        expect(result.unlocked).toBe(true);
    });
});

describe('MAIASubscale', () => {
    it('should validate all 8 subscales', () => {
        expect(MAIASubscale.parse('noticing')).toBe('noticing');
        expect(MAIASubscale.parse('not-distracting')).toBe('not-distracting');
        expect(MAIASubscale.parse('not-worrying')).toBe('not-worrying');
        expect(MAIASubscale.parse('attention-regulation')).toBe('attention-regulation');
        expect(MAIASubscale.parse('emotional-awareness')).toBe('emotional-awareness');
        expect(MAIASubscale.parse('self-regulation')).toBe('self-regulation');
        expect(MAIASubscale.parse('body-listening')).toBe('body-listening');
        expect(MAIASubscale.parse('trusting')).toBe('trusting');
    });

    it('should reject invalid subscales', () => {
        expect(() => MAIASubscale.parse('awareness')).toThrow();
    });
});

describe('MAIAScore', () => {
    it('should validate a subscale score', () => {
        const score = { subscale: 'noticing', score: 3.5, measuredAt: new Date() };
        const result = MAIAScore.parse(score);
        expect(result.score).toBe(3.5);
    });

    it('should reject scores outside 0-5 range', () => {
        expect(() =>
            MAIAScore.parse({ subscale: 'trusting', score: 6, measuredAt: new Date() })
        ).toThrow();
        expect(() =>
            MAIAScore.parse({ subscale: 'trusting', score: -1, measuredAt: new Date() })
        ).toThrow();
    });
});

describe('MAIAAssessment', () => {
    const validAssessment = {
        id: TEST_UUID,
        responses: Array(37).fill(3),
        scores: [{ subscale: 'noticing', score: 3.0, measuredAt: new Date() }],
        completedAt: new Date(),
    };

    it('should validate a complete MAIA assessment', () => {
        const result = MAIAAssessment.parse(validAssessment);
        expect(result.responses).toHaveLength(37);
        expect(result.scores).toHaveLength(1);
    });

    it('should reject if responses count is not 37', () => {
        expect(() =>
            MAIAAssessment.parse({ ...validAssessment, responses: Array(36).fill(3) })
        ).toThrow();
        expect(() =>
            MAIAAssessment.parse({ ...validAssessment, responses: Array(38).fill(3) })
        ).toThrow();
    });

    it('should reject responses with values outside 0-5', () => {
        const badResponses = [...Array(37).fill(3)];
        badResponses[0] = 6;
        expect(() =>
            MAIAAssessment.parse({ ...validAssessment, responses: badResponses })
        ).toThrow();
    });
});

describe('UserSettings', () => {
    it('should apply defaults for all optional fields', () => {
        const result = UserSettings.parse({});
        expect(result.reducedMotion).toBe(false);
        expect(result.fontSize).toBe('default');
        expect(result.notificationsEnabled).toBe(false);
    });

    it('should validate explicit settings', () => {
        const result = UserSettings.parse({
            reducedMotion: true,
            fontSize: 'large',
            notificationsEnabled: true,
        });
        expect(result.reducedMotion).toBe(true);
        expect(result.fontSize).toBe('large');
    });

    it('should reject invalid fontSize', () => {
        expect(() => UserSettings.parse({ fontSize: 'huge' })).toThrow();
    });
});

describe('UserProfile', () => {
    const validProfile = {
        id: TEST_UUID,
        settings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('should validate a new user profile with defaults', () => {
        const result = UserProfile.parse(validProfile);
        expect(result.onboardingComplete).toBe(false);
        expect(result.onboardingStep).toBe(0);
        expect(result.settings.fontSize).toBe('default');
    });

    it('should validate a completed onboarding profile', () => {
        const result = UserProfile.parse({
            ...validProfile,
            onboardingComplete: true,
            onboardingStep: 6,
        });
        expect(result.onboardingComplete).toBe(true);
        expect(result.onboardingStep).toBe(6);
    });

    it('should reject onboardingStep outside 0-6', () => {
        expect(() => UserProfile.parse({ ...validProfile, onboardingStep: 7 })).toThrow();
        expect(() => UserProfile.parse({ ...validProfile, onboardingStep: -1 })).toThrow();
    });
});
