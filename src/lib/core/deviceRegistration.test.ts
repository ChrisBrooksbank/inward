import { describe, it, expect, beforeEach } from 'vitest';
import { getOrCreateDeviceId, getDeviceRegistration, resetDeviceId } from './deviceRegistration';
import { DB_NAME, resetDb } from '$lib/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

describe('getOrCreateDeviceId', () => {
    it('generates a valid UUID on first call', async () => {
        const id = await getOrCreateDeviceId();
        expect(id).toMatch(UUID_PATTERN);
    });

    it('returns the same ID on subsequent calls', async () => {
        const first = await getOrCreateDeviceId();
        const second = await getOrCreateDeviceId();
        expect(second).toBe(first);
    });

    it('persists across separate function calls (simulates app restart)', async () => {
        const id = await getOrCreateDeviceId();
        resetDb();
        const reloaded = await getOrCreateDeviceId();
        expect(reloaded).toBe(id);
    });
});

describe('getDeviceRegistration', () => {
    it('returns a DeviceRegistration with a UUID deviceId', async () => {
        const reg = await getDeviceRegistration();
        expect(reg.deviceId).toMatch(UUID_PATTERN);
    });

    it('returns registeredAt as a Date', async () => {
        const reg = await getDeviceRegistration();
        expect(reg.registeredAt).toBeInstanceOf(Date);
    });

    it('returns undefined lastSyncAt on fresh registration', async () => {
        const reg = await getDeviceRegistration();
        expect(reg.lastSyncAt).toBeUndefined();
    });

    it('returns the same deviceId as getOrCreateDeviceId', async () => {
        const id = await getOrCreateDeviceId();
        const reg = await getDeviceRegistration();
        expect(reg.deviceId).toBe(id);
    });
});

describe('resetDeviceId', () => {
    it('generates a new UUID different from the old one', async () => {
        const original = await getOrCreateDeviceId();
        const fresh = await resetDeviceId();
        expect(fresh).toMatch(UUID_PATTERN);
        expect(fresh).not.toBe(original);
    });

    it('subsequent getOrCreateDeviceId returns the reset ID', async () => {
        await getOrCreateDeviceId();
        const resetId = await resetDeviceId();
        const fetched = await getOrCreateDeviceId();
        expect(fetched).toBe(resetId);
    });
});
