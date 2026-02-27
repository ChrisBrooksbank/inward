/**
 * Svelte stores for global app state, wired to IndexedDB.
 */

import { writable } from 'svelte/store';
import type {
    UserProfile,
    SensationDescription,
    ExerciseSession,
    SharedDescription,
} from '$lib/types/domain';
import type { SyncStatus } from '$lib/types/sync';
import {
    getSettings,
    putSettings,
    getAllDescriptions,
    putDescription,
    deleteDescription,
    getAllSessions,
    putSession,
    getAllSharedDescriptions,
    putSharedDescription,
    putConfirmation,
    getAllConfirmations,
    getSyncMeta,
} from '$lib/db';
import { initSeedVocabulary } from '$lib/core/vocabulary';
import { computeConfirmationStatus } from '$lib/core/sharedVocabulary';
import type { VocabularyConfirmation } from '$lib/types/domain';

// =============================================================================
// userProfile
// =============================================================================

function createUserProfileStore() {
    const { subscribe, set } = writable<UserProfile | null>(null);

    async function init(): Promise<void> {
        const profile = await getSettings();
        set(profile ?? null);
    }

    async function save(profile: UserProfile): Promise<void> {
        await putSettings(profile);
        set(profile);
    }

    function reset(): void {
        set(null);
    }

    return { subscribe, init, save, reset };
}

export const userProfile = createUserProfileStore();

// =============================================================================
// exerciseState
// =============================================================================

function isActiveSession(session: ExerciseSession): boolean {
    return session.state === 'playing' || session.state === 'paused';
}

function createExerciseStateStore() {
    const { subscribe, set } = writable<ExerciseSession | null>(null);

    async function init(): Promise<void> {
        const sessions = await getAllSessions();
        const active = sessions.find(isActiveSession);
        set(active ?? null);
    }

    async function save(session: ExerciseSession): Promise<void> {
        await putSession(session);
        set(session);
    }

    function clear(): void {
        set(null);
    }

    function reset(): void {
        set(null);
    }

    return { subscribe, init, save, clear, reset };
}

export const exerciseState = createExerciseStateStore();

// =============================================================================
// vocabularyStore
// =============================================================================

function applyUpsert(
    items: SensationDescription[],
    description: SensationDescription
): SensationDescription[] {
    const idx = items.findIndex(d => d.id === description.id);
    if (idx >= 0) {
        const next = [...items];
        next[idx] = description;
        return next;
    }
    return [...items, description];
}

function createVocabularyStore() {
    const { subscribe, set, update } = writable<SensationDescription[]>([]);

    async function init(): Promise<void> {
        const descriptions = await getAllDescriptions();
        set(descriptions);
    }

    async function add(description: SensationDescription): Promise<void> {
        await putDescription(description);
        update(d => [...d, description]);
    }

    async function remove(id: string): Promise<void> {
        await deleteDescription(id);
        update(d => d.filter(desc => desc.id !== id));
    }

    async function upsert(description: SensationDescription): Promise<void> {
        await putDescription(description);
        update(d => applyUpsert(d, description));
    }

    function reset(): void {
        set([]);
    }

    return { subscribe, init, add, remove, upsert, reset };
}

export const vocabularyStore = createVocabularyStore();

// =============================================================================
// syncStatus
// =============================================================================

function getInitialSyncStatus(): SyncStatus {
    return {
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        isSyncing: false,
        pendingOperations: 0,
        failedOperations: 0,
    };
}

function createSyncStatusStore() {
    const { subscribe, set, update } = writable<SyncStatus>(getInitialSyncStatus());

    function onOnline(): void {
        update(s => ({ ...s, isOnline: true }));
    }

    function onOffline(): void {
        update(s => ({ ...s, isOnline: false }));
    }

    async function init(): Promise<void> {
        if (typeof window === 'undefined') return;
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        const meta = await getSyncMeta();
        if (meta?.lastSyncAt) {
            update(s => ({ ...s, lastSyncAt: meta.lastSyncAt ?? undefined }));
        }
    }

    function patch(status: Partial<SyncStatus>): void {
        update(s => ({ ...s, ...status }));
    }

    function reset(): void {
        set(getInitialSyncStatus());
    }

    return { subscribe, init, patch, set, reset };
}

export const syncStatus = createSyncStatusStore();

// =============================================================================
// sharedVocabularyStore
// =============================================================================

function applySharedUpsert(
    items: SharedDescription[],
    description: SharedDescription
): SharedDescription[] {
    const idx = items.findIndex(d => d.id === description.id);
    if (idx >= 0) {
        const next = [...items];
        next[idx] = description;
        return next;
    }
    return [...items, description];
}

// Tracks which shared description IDs the local user has confirmed.
export const confirmedDescriptionIds = writable<string[]>([]);

function createSharedVocabularyStore() {
    const { subscribe, set, update } = writable<SharedDescription[]>([]);

    async function init(): Promise<void> {
        await initSeedVocabulary();
        const descriptions = await getAllSharedDescriptions();
        set(descriptions);
        const confirmations = await getAllConfirmations();
        confirmedDescriptionIds.set(confirmations.map(c => c.sharedDescriptionId));
    }

    async function upsert(description: SharedDescription): Promise<void> {
        await putSharedDescription(description);
        update(d => applySharedUpsert(d, description));
    }

    async function confirm(sharedDescriptionId: string, userId: string): Promise<void> {
        let target: SharedDescription | undefined;
        update(items => {
            target = items.find(d => d.id === sharedDescriptionId);
            return items;
        });
        if (!target) return;

        const newCount = target.confirmationCount + 1;
        const updated: SharedDescription = {
            ...target,
            confirmationCount: newCount,
            confirmationStatus: computeConfirmationStatus(newCount),
            lastConfirmedAt: new Date(),
        };
        const confirmation: VocabularyConfirmation = {
            id: crypto.randomUUID(),
            sharedDescriptionId,
            userId,
            confirmedAt: new Date(),
        };
        await putConfirmation(confirmation);
        await putSharedDescription(updated);
        confirmedDescriptionIds.update(ids => [...ids, sharedDescriptionId]);
        update(items => applySharedUpsert(items, updated));
    }

    function reset(): void {
        set([]);
        confirmedDescriptionIds.set([]);
    }

    return { subscribe, init, upsert, confirm, reset };
}

export const sharedVocabularyStore = createSharedVocabularyStore();
