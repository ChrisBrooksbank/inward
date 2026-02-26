import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { userProfile, exerciseState, vocabularyStore, syncStatus } from './index';
import {
    DB_NAME,
    resetDb,
    putSettings,
    putSession,
    putDescription,
    getAllDescriptions,
} from '$lib/db';
import type { UserProfile, ExerciseSession, SensationDescription } from '$lib/types/domain';

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
    userProfile.reset();
    exerciseState.reset();
    vocabularyStore.reset();
    syncStatus.reset();
});

// =============================================================================
// Fixtures
// =============================================================================

const profileId = '550e8400-e29b-41d4-a716-446655440011';
const sessionId = '550e8400-e29b-41d4-a716-446655440012';
const exerciseId = '550e8400-e29b-41d4-a716-446655440013';
const descriptionId = '550e8400-e29b-41d4-a716-446655440014';
const description2Id = '550e8400-e29b-41d4-a716-446655440015';

const testProfile: UserProfile = {
    id: profileId,
    onboardingComplete: false,
    onboardingStep: 0,
    settings: { reducedMotion: false, fontSize: 'default', notificationsEnabled: false },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const testSession: ExerciseSession = {
    id: sessionId,
    exerciseId,
    state: 'playing',
    startedAt: new Date('2026-01-01T10:00:00Z'),
    phasesCompleted: 1,
    totalPhases: 4,
    descriptions: [],
    emotionConnections: [],
};

const testDescription: SensationDescription = {
    id: descriptionId,
    text: 'butterflies in my stomach',
    category: 'metaphorical',
    bodyRegion: 'stomach',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    sharingLevel: 'private',
};

// =============================================================================
// userProfile
// =============================================================================

describe('userProfile', () => {
    it('starts as null', () => {
        expect(get(userProfile)).toBeNull();
    });

    it('init loads null when DB is empty', async () => {
        await userProfile.init();
        expect(get(userProfile)).toBeNull();
    });

    it('init loads profile from DB', async () => {
        await putSettings(testProfile);
        await userProfile.init();
        expect(get(userProfile)?.id).toBe(profileId);
        expect(get(userProfile)?.onboardingComplete).toBe(false);
    });

    it('save persists to DB and updates store', async () => {
        await userProfile.save(testProfile);
        expect(get(userProfile)?.id).toBe(profileId);
        // Reload from DB to confirm persistence
        userProfile.reset();
        await userProfile.init();
        expect(get(userProfile)?.id).toBe(profileId);
    });

    it('save updates onboarding state correctly', async () => {
        await userProfile.save(testProfile);
        await userProfile.save({ ...testProfile, onboardingComplete: true });
        expect(get(userProfile)?.onboardingComplete).toBe(true);
    });
});

// =============================================================================
// exerciseState
// =============================================================================

describe('exerciseState', () => {
    it('starts as null', () => {
        expect(get(exerciseState)).toBeNull();
    });

    it('init loads null when no sessions exist', async () => {
        await exerciseState.init();
        expect(get(exerciseState)).toBeNull();
    });

    it('init loads an active playing session', async () => {
        await putSession(testSession);
        await exerciseState.init();
        expect(get(exerciseState)?.id).toBe(sessionId);
        expect(get(exerciseState)?.state).toBe('playing');
    });

    it('init loads an active paused session', async () => {
        await putSession({ ...testSession, state: 'paused' });
        await exerciseState.init();
        expect(get(exerciseState)?.state).toBe('paused');
    });

    it('init ignores completed sessions', async () => {
        await putSession({ ...testSession, state: 'completed' });
        await exerciseState.init();
        expect(get(exerciseState)).toBeNull();
    });

    it('init ignores abandoned sessions', async () => {
        await putSession({ ...testSession, state: 'abandoned' });
        await exerciseState.init();
        expect(get(exerciseState)).toBeNull();
    });

    it('save persists session and updates store', async () => {
        await exerciseState.save(testSession);
        expect(get(exerciseState)?.id).toBe(sessionId);
        // Reload to confirm DB persistence
        exerciseState.reset();
        await exerciseState.init();
        expect(get(exerciseState)?.id).toBe(sessionId);
    });

    it('clear resets store to null', async () => {
        await exerciseState.save(testSession);
        exerciseState.clear();
        expect(get(exerciseState)).toBeNull();
    });
});

// =============================================================================
// vocabularyStore
// =============================================================================

describe('vocabularyStore', () => {
    it('starts empty', () => {
        expect(get(vocabularyStore)).toHaveLength(0);
    });

    it('init loads all descriptions from DB', async () => {
        await putDescription(testDescription);
        await vocabularyStore.init();
        expect(get(vocabularyStore)).toHaveLength(1);
        expect(get(vocabularyStore)[0].text).toBe('butterflies in my stomach');
    });

    it('add saves to DB and appends to store', async () => {
        await vocabularyStore.add(testDescription);
        expect(get(vocabularyStore)).toHaveLength(1);
        const dbItems = await getAllDescriptions();
        expect(dbItems).toHaveLength(1);
    });

    it('remove deletes from DB and removes from store', async () => {
        await vocabularyStore.add(testDescription);
        await vocabularyStore.remove(descriptionId);
        expect(get(vocabularyStore)).toHaveLength(0);
        const dbItems = await getAllDescriptions();
        expect(dbItems).toHaveLength(0);
    });

    it('upsert updates an existing item in place', async () => {
        await vocabularyStore.add(testDescription);
        const updated: SensationDescription = { ...testDescription, text: 'stomach flutter' };
        await vocabularyStore.upsert(updated);
        const items = get(vocabularyStore);
        expect(items).toHaveLength(1);
        expect(items[0].text).toBe('stomach flutter');
    });

    it('upsert adds a new item when id not found', async () => {
        await vocabularyStore.upsert(testDescription);
        expect(get(vocabularyStore)).toHaveLength(1);
    });

    it('upsert preserves other items when updating', async () => {
        const second: SensationDescription = {
            ...testDescription,
            id: description2Id,
            text: 'heavy chest',
            bodyRegion: 'chest',
        };
        await vocabularyStore.add(testDescription);
        await vocabularyStore.add(second);
        await vocabularyStore.upsert({ ...testDescription, text: 'fluttering' });
        const items = get(vocabularyStore);
        expect(items).toHaveLength(2);
        const first = items.find(i => i.id === descriptionId);
        expect(first?.text).toBe('fluttering');
    });
});

// =============================================================================
// syncStatus
// =============================================================================

describe('syncStatus', () => {
    it('starts with default offline state values', () => {
        const status = get(syncStatus);
        expect(status.isSyncing).toBe(false);
        expect(status.pendingOperations).toBe(0);
        expect(status.failedOperations).toBe(0);
    });

    it('patch updates partial state without touching other fields', () => {
        syncStatus.patch({ isSyncing: true, pendingOperations: 3 });
        const status = get(syncStatus);
        expect(status.isSyncing).toBe(true);
        expect(status.pendingOperations).toBe(3);
        expect(status.failedOperations).toBe(0);
    });

    it('reflects online when window online event fires after init', () => {
        syncStatus.init();
        syncStatus.patch({ isOnline: false });
        window.dispatchEvent(new Event('online'));
        expect(get(syncStatus).isOnline).toBe(true);
    });

    it('reflects offline when window offline event fires after init', () => {
        syncStatus.init();
        window.dispatchEvent(new Event('offline'));
        expect(get(syncStatus).isOnline).toBe(false);
    });

    it('reset restores initial state', () => {
        syncStatus.patch({ isSyncing: true, pendingOperations: 5, failedOperations: 2 });
        syncStatus.reset();
        const status = get(syncStatus);
        expect(status.isSyncing).toBe(false);
        expect(status.pendingOperations).toBe(0);
        expect(status.failedOperations).toBe(0);
    });
});
