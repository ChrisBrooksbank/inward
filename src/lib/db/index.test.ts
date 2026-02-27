import { describe, it, expect, beforeEach } from 'vitest';
import {
    DB_NAME,
    getDb,
    resetDb,
    putSession,
    getSession,
    getAllSessions,
    getSessionsByExercise,
    deleteSession,
    putDescription,
    getDescription,
    getAllDescriptions,
    getDescriptionsByBodyRegion,
    deleteDescription,
    putConfirmation,
    getConfirmation,
    getConfirmationsByDescription,
    deleteConfirmation,
    putAssessment,
    getAssessment,
    getAllAssessments,
    deleteAssessment,
    getSettings,
    putSettings,
    enqueue,
    getQueue,
    dequeue,
    clearQueue,
} from './index';
import type {
    ExerciseSession,
    SensationDescription,
    VocabularyConfirmation,
    MAIAAssessment,
    UserProfile,
} from '$lib/types/domain';
import type { PendingOperation } from '$lib/types/sync';

async function deleteTestDb(): Promise<void> {
    return new Promise<void>(resolve => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
    });
}

beforeEach(async () => {
    resetDb();
    await deleteTestDb();
});

// =============================================================================
// Fixtures
// =============================================================================

const sessionId = '550e8400-e29b-41d4-a716-446655440001';
const exerciseId = '550e8400-e29b-41d4-a716-446655440002';
const descriptionId = '550e8400-e29b-41d4-a716-446655440003';
const confirmationId = '550e8400-e29b-41d4-a716-446655440004';
const assessmentId = '550e8400-e29b-41d4-a716-446655440005';
const userId = '550e8400-e29b-41d4-a716-446655440006';
const profileId = '550e8400-e29b-41d4-a716-446655440007';
const queueId = '550e8400-e29b-41d4-a716-446655440008';

const testSession: ExerciseSession = {
    id: sessionId,
    exerciseId,
    state: 'completed',
    startedAt: new Date('2026-01-01T10:00:00Z'),
    completedAt: new Date('2026-01-01T10:10:00Z'),
    phasesCompleted: 4,
    totalPhases: 4,
    descriptions: [],
    emotionConnections: [],
};

const testDescription: SensationDescription = {
    id: descriptionId,
    text: 'butterflies in my stomach',
    category: 'metaphorical',
    bodyRegion: 'stomach',
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    sharingLevel: 'private',
};

const testConfirmation: VocabularyConfirmation = {
    id: confirmationId,
    sharedDescriptionId: descriptionId,
    userId,
    confirmedAt: new Date('2026-01-02T10:00:00Z'),
};

const testAssessment: MAIAAssessment = {
    id: assessmentId,
    responses: Array(37).fill(3) as number[],
    scores: [
        { subscale: 'noticing', score: 3, measuredAt: new Date('2026-01-01') },
        { subscale: 'not-distracting', score: 2.5, measuredAt: new Date('2026-01-01') },
        { subscale: 'not-worrying', score: 3.5, measuredAt: new Date('2026-01-01') },
        { subscale: 'attention-regulation', score: 3, measuredAt: new Date('2026-01-01') },
        { subscale: 'emotional-awareness', score: 4, measuredAt: new Date('2026-01-01') },
        { subscale: 'self-regulation', score: 3.5, measuredAt: new Date('2026-01-01') },
        { subscale: 'body-listening', score: 2, measuredAt: new Date('2026-01-01') },
        { subscale: 'trusting', score: 3, measuredAt: new Date('2026-01-01') },
    ],
    completedAt: new Date('2026-01-01T11:00:00Z'),
};

const testProfile: UserProfile = {
    id: profileId,
    onboardingComplete: false,
    onboardingStep: 0,
    settings: {
        reducedMotion: false,
        fontSize: 'default',
        notificationsEnabled: false,
        syncConsentGiven: false,
    },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const testOperation: PendingOperation = {
    id: queueId,
    type: 'share',
    payload: { text: 'test' },
    createdAt: new Date('2026-01-01T10:00:00Z'),
    retryCount: 0,
};

// =============================================================================
// Database Initialization
// =============================================================================

describe('getDb', () => {
    it('should open the database', async () => {
        const db = await getDb();
        expect(db).toBeDefined();
        expect(db.name).toBe(DB_NAME);
    });

    it('should return the same instance on repeated calls', async () => {
        const db1 = await getDb();
        const db2 = await getDb();
        expect(db1).toBe(db2);
    });

    it('should create all required stores', async () => {
        const db = await getDb();
        const names = Array.from(db.objectStoreNames);
        expect(names).toContain('sessions');
        expect(names).toContain('descriptions');
        expect(names).toContain('confirmations');
        expect(names).toContain('assessments');
        expect(names).toContain('settings');
        expect(names).toContain('offlineQueue');
    });
});

// =============================================================================
// Sessions
// =============================================================================

describe('sessions', () => {
    it('should put and get a session', async () => {
        await putSession(testSession);
        const result = await getSession(sessionId);
        expect(result?.id).toBe(sessionId);
        expect(result?.state).toBe('completed');
    });

    it('should return undefined for missing session', async () => {
        const result = await getSession('nonexistent');
        expect(result).toBeUndefined();
    });

    it('should get all sessions', async () => {
        await putSession(testSession);
        const results = await getAllSessions();
        expect(results).toHaveLength(1);
    });

    it('should get sessions by exercise', async () => {
        await putSession(testSession);
        const results = await getSessionsByExercise(exerciseId);
        expect(results).toHaveLength(1);
        expect(results[0].exerciseId).toBe(exerciseId);
    });

    it('should delete a session', async () => {
        await putSession(testSession);
        await deleteSession(sessionId);
        const result = await getSession(sessionId);
        expect(result).toBeUndefined();
    });

    it('should return empty array when no sessions match exercise', async () => {
        const results = await getSessionsByExercise('nonexistent-id');
        expect(results).toHaveLength(0);
    });
});

// =============================================================================
// Descriptions
// =============================================================================

describe('descriptions', () => {
    it('should put and get a description', async () => {
        await putDescription(testDescription);
        const result = await getDescription(descriptionId);
        expect(result?.text).toBe('butterflies in my stomach');
    });

    it('should return undefined for missing description', async () => {
        const result = await getDescription('nonexistent');
        expect(result).toBeUndefined();
    });

    it('should get all descriptions', async () => {
        await putDescription(testDescription);
        const results = await getAllDescriptions();
        expect(results).toHaveLength(1);
    });

    it('should get descriptions by body region', async () => {
        await putDescription(testDescription);
        const results = await getDescriptionsByBodyRegion('stomach');
        expect(results).toHaveLength(1);
        expect(results[0].bodyRegion).toBe('stomach');
    });

    it('should return empty array for body region with no descriptions', async () => {
        const results = await getDescriptionsByBodyRegion('heart');
        expect(results).toHaveLength(0);
    });

    it('should delete a description', async () => {
        await putDescription(testDescription);
        await deleteDescription(descriptionId);
        const result = await getDescription(descriptionId);
        expect(result).toBeUndefined();
    });
});

// =============================================================================
// Confirmations
// =============================================================================

describe('confirmations', () => {
    it('should put and get a confirmation', async () => {
        await putConfirmation(testConfirmation);
        const result = await getConfirmation(confirmationId);
        expect(result?.userId).toBe(userId);
    });

    it('should return undefined for missing confirmation', async () => {
        const result = await getConfirmation('nonexistent');
        expect(result).toBeUndefined();
    });

    it('should get confirmations by description', async () => {
        await putConfirmation(testConfirmation);
        const results = await getConfirmationsByDescription(descriptionId);
        expect(results).toHaveLength(1);
        expect(results[0].sharedDescriptionId).toBe(descriptionId);
    });

    it('should delete a confirmation', async () => {
        await putConfirmation(testConfirmation);
        await deleteConfirmation(confirmationId);
        const result = await getConfirmation(confirmationId);
        expect(result).toBeUndefined();
    });
});

// =============================================================================
// Assessments
// =============================================================================

describe('assessments', () => {
    it('should put and get an assessment', async () => {
        await putAssessment(testAssessment);
        const result = await getAssessment(assessmentId);
        expect(result?.responses).toHaveLength(37);
    });

    it('should return undefined for missing assessment', async () => {
        const result = await getAssessment('nonexistent');
        expect(result).toBeUndefined();
    });

    it('should get all assessments', async () => {
        await putAssessment(testAssessment);
        const results = await getAllAssessments();
        expect(results).toHaveLength(1);
    });

    it('should delete an assessment', async () => {
        await putAssessment(testAssessment);
        await deleteAssessment(assessmentId);
        const result = await getAssessment(assessmentId);
        expect(result).toBeUndefined();
    });
});

// =============================================================================
// Settings
// =============================================================================

describe('settings', () => {
    it('should return undefined when no settings stored', async () => {
        const result = await getSettings();
        expect(result).toBeUndefined();
    });

    it('should put and get settings', async () => {
        await putSettings(testProfile);
        const result = await getSettings();
        expect(result?.id).toBe(profileId);
        expect(result?.onboardingComplete).toBe(false);
    });

    it('should overwrite settings on repeated put', async () => {
        await putSettings(testProfile);
        const updated: UserProfile = { ...testProfile, onboardingComplete: true };
        await putSettings(updated);
        const result = await getSettings();
        expect(result?.onboardingComplete).toBe(true);
    });
});

// =============================================================================
// Offline Queue
// =============================================================================

describe('offlineQueue', () => {
    it('should enqueue and get queue', async () => {
        await enqueue(testOperation);
        const results = await getQueue();
        expect(results).toHaveLength(1);
        expect(results[0].type).toBe('share');
    });

    it('should dequeue an operation', async () => {
        await enqueue(testOperation);
        await dequeue(queueId);
        const results = await getQueue();
        expect(results).toHaveLength(0);
    });

    it('should clear the entire queue', async () => {
        await enqueue(testOperation);
        const second: PendingOperation = {
            ...testOperation,
            id: '550e8400-e29b-41d4-a716-446655440099',
        };
        await enqueue(second);
        await clearQueue();
        const results = await getQueue();
        expect(results).toHaveLength(0);
    });

    it('should return empty array when queue is empty', async () => {
        const results = await getQueue();
        expect(results).toHaveLength(0);
    });
});
