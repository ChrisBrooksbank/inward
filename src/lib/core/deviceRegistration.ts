/**
 * Device registration: generate and persist an anonymous device ID to IndexedDB.
 * The device ID is a random UUID that never leaves the device unless the user
 * explicitly opts in to sync. It is regeneratable via resetDeviceId().
 */

import { getSyncMeta, putSyncMeta } from '$lib/db';
import type { DeviceRegistration, SyncMetadata } from '$lib/types/sync';

async function getOrCreateMeta(): Promise<SyncMetadata> {
    const existing = await getSyncMeta();
    if (existing) return existing;
    const meta: SyncMetadata = {
        deviceId: crypto.randomUUID(),
        registeredAt: new Date(),
        lastSyncAt: null,
    };
    await putSyncMeta(meta);
    return meta;
}

/** Returns the persisted device ID, generating and saving one on first call. */
export async function getOrCreateDeviceId(): Promise<string> {
    const meta = await getOrCreateMeta();
    return meta.deviceId;
}

/** Returns the full device registration record, creating it if absent. */
export async function getDeviceRegistration(): Promise<DeviceRegistration> {
    const meta = await getOrCreateMeta();
    return {
        deviceId: meta.deviceId,
        registeredAt: meta.registeredAt,
        lastSyncAt: meta.lastSyncAt ?? undefined,
    };
}

/** Replaces the device ID with a freshly generated UUID (regeneratable). */
export async function resetDeviceId(): Promise<string> {
    const meta: SyncMetadata = {
        deviceId: crypto.randomUUID(),
        registeredAt: new Date(),
        lastSyncAt: null,
    };
    await putSyncMeta(meta);
    return meta.deviceId;
}
