/**
 * Delta sync: fetch changes from the relay server since the last sync cursor,
 * apply them to local IndexedDB, and update the cursor.
 * Supports background sync on app focus and a periodic interval.
 */

import {
    getSyncMeta,
    putSyncMeta,
    putSharedDescription,
    deleteSharedDescription,
    getSharedDescription,
} from '$lib/db';
import { getOrCreateDeviceId } from '$lib/core/deviceRegistration';
import { computeConfirmationStatus } from '$lib/core/sharedVocabulary';
import type { RelayApiClient } from '$lib/core/apiClient';
import type { DescriptionResponse, SyncResponse, SyncResult } from '$lib/types/sync';
import type { SharedDescription } from '$lib/types/domain';

export const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapDescriptionResponse(resp: DescriptionResponse): SharedDescription {
    return {
        id: resp.id,
        text: resp.text,
        category: resp.category,
        bodyRegion: resp.bodyRegion,
        signalType: resp.signalType,
        emotionConnection: resp.emotionConnection,
        sharingLevel: resp.sharingLevel,
        contributorName: resp.contributorName,
        confirmationCount: resp.confirmationCount,
        confirmationStatus: resp.confirmationStatus,
        sharedAt: new Date(resp.sharedAt),
        lastConfirmedAt: resp.lastConfirmedAt ? new Date(resp.lastConfirmedAt) : undefined,
    };
}

// ---------------------------------------------------------------------------
// Apply sync response to IndexedDB
// ---------------------------------------------------------------------------

async function applyDescriptionUpdates(
    created: DescriptionResponse[],
    updated: DescriptionResponse[]
): Promise<void> {
    for (const desc of [...created, ...updated]) {
        await putSharedDescription(mapDescriptionResponse(desc));
    }
}

async function applyDeletions(deleted: string[]): Promise<void> {
    for (const id of deleted) {
        await deleteSharedDescription(id);
    }
}

async function applyConfirmationCounts(counts: Record<string, number>): Promise<void> {
    for (const [id, count] of Object.entries(counts)) {
        const existing = await getSharedDescription(id);
        if (existing) {
            await putSharedDescription({
                ...existing,
                confirmationCount: count,
                confirmationStatus: computeConfirmationStatus(count),
            });
        }
    }
}

async function applyResponse(response: SyncResponse): Promise<void> {
    const { created, updated, deleted } = response.descriptions;
    await applyDescriptionUpdates(created, updated);
    await applyDeletions(deleted);
    await applyConfirmationCounts(response.confirmationCounts);
}

// ---------------------------------------------------------------------------
// Cursor update
// ---------------------------------------------------------------------------

async function updateCursor(deviceId: string, serverTime: string): Promise<void> {
    const meta = await getSyncMeta();
    await putSyncMeta({
        deviceId,
        registeredAt: meta?.registeredAt ?? new Date(),
        lastSyncAt: new Date(serverTime),
    });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Perform one delta sync cycle. Returns a summary of changes applied. */
export async function runDeltaSync(client: RelayApiClient): Promise<SyncResult> {
    const deviceId = await getOrCreateDeviceId();
    const meta = await getSyncMeta();
    const since = meta?.lastSyncAt?.toISOString();

    const response = await client.getSyncDelta({ deviceId, since });

    await applyResponse(response);
    await updateCursor(deviceId, response.serverTime);

    const { created, updated, deleted } = response.descriptions;
    return {
        success: true,
        created: created.length,
        updated: updated.length,
        deleted: deleted.length,
        errors: [],
    };
}

/**
 * Start background sync: runs on app focus (visibilitychange to visible)
 * and every 15 minutes. Returns a cleanup function.
 */
export function startBackgroundSync(
    getClient: () => RelayApiClient,
    intervalMs: number = SYNC_INTERVAL_MS
): () => void {
    if (typeof window === 'undefined') return () => {};

    const runSync = (): void => {
        runDeltaSync(getClient()).catch(() => {});
    };

    const onVisibilityChange = (): void => {
        if (document.visibilityState === 'visible') runSync();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', runSync);
    const timerId = setInterval(runSync, intervalMs);

    return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('focus', runSync);
        clearInterval(timerId);
    };
}
