/**
 * IndexedDB database module for Inward.
 * Provides stores for sessions, descriptions, confirmations,
 * assessments, settings, and offline queue.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
    ExerciseSession,
    SensationDescription,
    SharedDescription,
    VocabularyConfirmation,
    MAIAAssessment,
    UserProfile,
    BodyRegion,
} from '$lib/types/domain';
import type { PendingOperation } from '$lib/types/sync';

export const DB_NAME = 'inward-db';
export const DB_VERSION = 2;

export interface InwardDB extends DBSchema {
    sessions: {
        key: string;
        value: ExerciseSession;
        indexes: { exerciseId: string; state: string };
    };
    descriptions: {
        key: string;
        value: SensationDescription;
        indexes: { bodyRegion: string; sharingLevel: string };
    };
    sharedDescriptions: {
        key: string;
        value: SharedDescription;
        indexes: { bodyRegion: string; category: string; confirmationStatus: string };
    };
    confirmations: {
        key: string;
        value: VocabularyConfirmation;
        indexes: { sharedDescriptionId: string };
    };
    assessments: {
        key: string;
        value: MAIAAssessment;
    };
    settings: {
        key: string;
        value: UserProfile;
    };
    offlineQueue: {
        key: string;
        value: PendingOperation;
        indexes: { type: string };
    };
}

type Db = IDBPDatabase<InwardDB>;
let _db: Db | null = null;

function createSessionsStore(db: Db): void {
    const store = db.createObjectStore('sessions', { keyPath: 'id' });
    store.createIndex('exerciseId', 'exerciseId');
    store.createIndex('state', 'state');
}

function createDescriptionsStore(db: Db): void {
    const store = db.createObjectStore('descriptions', { keyPath: 'id' });
    store.createIndex('bodyRegion', 'bodyRegion');
    store.createIndex('sharingLevel', 'sharingLevel');
}

function createSharedDescriptionsStore(db: Db): void {
    const store = db.createObjectStore('sharedDescriptions', { keyPath: 'id' });
    store.createIndex('bodyRegion', 'bodyRegion');
    store.createIndex('category', 'category');
    store.createIndex('confirmationStatus', 'confirmationStatus');
}

function createConfirmationsStore(db: Db): void {
    const store = db.createObjectStore('confirmations', { keyPath: 'id' });
    store.createIndex('sharedDescriptionId', 'sharedDescriptionId');
}

function createOfflineQueueStore(db: Db): void {
    const store = db.createObjectStore('offlineQueue', { keyPath: 'id' });
    store.createIndex('type', 'type');
}

function upgradeDb(db: Db, oldVersion: number): void {
    if (oldVersion < 1) {
        createSessionsStore(db);
        createDescriptionsStore(db);
        createConfirmationsStore(db);
        db.createObjectStore('assessments', { keyPath: 'id' });
        db.createObjectStore('settings', { keyPath: 'id' });
        createOfflineQueueStore(db);
    }
    if (oldVersion < 2) {
        createSharedDescriptionsStore(db);
    }
}

export async function getDb(): Promise<Db> {
    if (_db) return _db;
    _db = await openDB<InwardDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            upgradeDb(db, oldVersion);
        },
    });
    return _db;
}

/** Reset cached DB instance — call in tests before each test case. */
export function resetDb(): void {
    _db?.close();
    _db = null;
}

// =============================================================================
// Sessions
// =============================================================================

export async function putSession(session: ExerciseSession): Promise<void> {
    const db = await getDb();
    await db.put('sessions', session);
}

export async function getSession(id: string): Promise<ExerciseSession | undefined> {
    const db = await getDb();
    return db.get('sessions', id);
}

export async function getAllSessions(): Promise<ExerciseSession[]> {
    const db = await getDb();
    return db.getAll('sessions');
}

export async function getSessionsByExercise(exerciseId: string): Promise<ExerciseSession[]> {
    const db = await getDb();
    return db.getAllFromIndex('sessions', 'exerciseId', exerciseId);
}

export async function deleteSession(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('sessions', id);
}

// =============================================================================
// Descriptions
// =============================================================================

export async function putDescription(description: SensationDescription): Promise<void> {
    const db = await getDb();
    await db.put('descriptions', description);
}

export async function getDescription(id: string): Promise<SensationDescription | undefined> {
    const db = await getDb();
    return db.get('descriptions', id);
}

export async function getAllDescriptions(): Promise<SensationDescription[]> {
    const db = await getDb();
    return db.getAll('descriptions');
}

export async function getDescriptionsByBodyRegion(
    bodyRegion: BodyRegion
): Promise<SensationDescription[]> {
    const db = await getDb();
    return db.getAllFromIndex('descriptions', 'bodyRegion', bodyRegion);
}

export async function deleteDescription(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('descriptions', id);
}

// =============================================================================
// Shared Descriptions
// =============================================================================

export async function putSharedDescription(description: SharedDescription): Promise<void> {
    const db = await getDb();
    await db.put('sharedDescriptions', description);
}

export async function getSharedDescription(id: string): Promise<SharedDescription | undefined> {
    const db = await getDb();
    return db.get('sharedDescriptions', id);
}

export async function getAllSharedDescriptions(): Promise<SharedDescription[]> {
    const db = await getDb();
    return db.getAll('sharedDescriptions');
}

export async function getSharedDescriptionsByBodyRegion(
    bodyRegion: BodyRegion
): Promise<SharedDescription[]> {
    const db = await getDb();
    return db.getAllFromIndex('sharedDescriptions', 'bodyRegion', bodyRegion);
}

export async function countSharedDescriptions(): Promise<number> {
    const db = await getDb();
    return db.count('sharedDescriptions');
}

export async function deleteSharedDescription(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('sharedDescriptions', id);
}

// =============================================================================
// Confirmations
// =============================================================================

export async function putConfirmation(confirmation: VocabularyConfirmation): Promise<void> {
    const db = await getDb();
    await db.put('confirmations', confirmation);
}

export async function getConfirmation(id: string): Promise<VocabularyConfirmation | undefined> {
    const db = await getDb();
    return db.get('confirmations', id);
}

export async function getAllConfirmations(): Promise<VocabularyConfirmation[]> {
    const db = await getDb();
    return db.getAll('confirmations');
}

export async function getConfirmationsByDescription(
    sharedDescriptionId: string
): Promise<VocabularyConfirmation[]> {
    const db = await getDb();
    return db.getAllFromIndex('confirmations', 'sharedDescriptionId', sharedDescriptionId);
}

export async function deleteConfirmation(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('confirmations', id);
}

// =============================================================================
// Assessments
// =============================================================================

export async function putAssessment(assessment: MAIAAssessment): Promise<void> {
    const db = await getDb();
    await db.put('assessments', assessment);
}

export async function getAssessment(id: string): Promise<MAIAAssessment | undefined> {
    const db = await getDb();
    return db.get('assessments', id);
}

export async function getAllAssessments(): Promise<MAIAAssessment[]> {
    const db = await getDb();
    return db.getAll('assessments');
}

export async function deleteAssessment(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('assessments', id);
}

// =============================================================================
// Settings (UserProfile)
// =============================================================================

export async function getSettings(): Promise<UserProfile | undefined> {
    const db = await getDb();
    const all = await db.getAll('settings');
    return all[0];
}

export async function putSettings(profile: UserProfile): Promise<void> {
    const db = await getDb();
    await db.put('settings', profile);
}

// =============================================================================
// Offline Queue
// =============================================================================

export async function enqueue(operation: PendingOperation): Promise<void> {
    const db = await getDb();
    await db.put('offlineQueue', operation);
}

export async function getQueue(): Promise<PendingOperation[]> {
    const db = await getDb();
    return db.getAll('offlineQueue');
}

export async function dequeue(id: string): Promise<void> {
    const db = await getDb();
    await db.delete('offlineQueue', id);
}

export async function clearQueue(): Promise<void> {
    const db = await getDb();
    await db.clear('offlineQueue');
}
