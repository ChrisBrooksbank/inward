/**
 * Offline queue: write pending operations to IndexedDB and flush on connectivity restored.
 * Implements exponential backoff retry and conflict resolution.
 */

import { enqueue, getQueue, dequeue } from '$lib/db';
import type { PendingOperation } from '$lib/types/sync';
import type { CreateDescriptionRequest, CreateConfirmationRequest } from '$lib/types/sync';
import { RelayApiError } from '$lib/core/apiClient';
import type { RelayApiClient } from '$lib/core/apiClient';

export const MAX_BACKOFF_MS = 30_000;

/** Returns delay in ms for a given retry count: 1s → 2s → 4s → … → max 30s. */
export function getBackoffMs(retryCount: number): number {
    return Math.min(1000 * 2 ** retryCount, MAX_BACKOFF_MS);
}

function isDue(op: PendingOperation): boolean {
    if (!op.nextRetryAt) return true;
    return op.nextRetryAt <= new Date();
}

/** Enqueue a share-description operation for later delivery. */
export async function queueDescription(payload: CreateDescriptionRequest): Promise<void> {
    const op: PendingOperation = {
        id: crypto.randomUUID(),
        type: 'share',
        payload,
        createdAt: new Date(),
        retryCount: 0,
    };
    await enqueue(op);
}

/** Enqueue a confirm-description operation for later delivery. */
export async function queueConfirmation(payload: CreateConfirmationRequest): Promise<void> {
    const op: PendingOperation = {
        id: crypto.randomUUID(),
        type: 'confirm',
        payload,
        createdAt: new Date(),
        retryCount: 0,
    };
    await enqueue(op);
}

async function dispatchOp(op: PendingOperation, client: RelayApiClient): Promise<void> {
    if (op.type === 'share') {
        await client.postDescription(op.payload as CreateDescriptionRequest);
    } else if (op.type === 'confirm') {
        await client.postConfirmation(op.payload as CreateConfirmationRequest);
    }
    // 'unshare' not yet supported by relay API — treat as no-op
}

async function processOp(op: PendingOperation, client: RelayApiClient): Promise<boolean> {
    try {
        await dispatchOp(op, client);
        await dequeue(op.id);
        return true;
    } catch (err) {
        // 409 Conflict = last-write-wins for descriptions, additive for confirmations
        // Either way the server already has the data — treat as success
        if (err instanceof RelayApiError && err.status === 409) {
            await dequeue(op.id);
            return true;
        }
        const updated: PendingOperation = {
            ...op,
            retryCount: op.retryCount + 1,
            lastError: err instanceof Error ? err.message : String(err),
            nextRetryAt: new Date(Date.now() + getBackoffMs(op.retryCount)),
        };
        await enqueue(updated);
        return false;
    }
}

export interface FlushResult {
    processed: number;
    failed: number;
}

/** Process all due pending operations. Returns counts of processed and failed ops. */
export async function flushQueue(client: RelayApiClient): Promise<FlushResult> {
    const ops = await getQueue();
    const due = ops.filter(isDue);
    let processed = 0;
    let failed = 0;
    for (const op of due) {
        const ok = await processOp(op, client);
        if (ok) {
            processed++;
        } else {
            failed++;
        }
    }
    return { processed, failed };
}

/**
 * Register a window 'online' event listener that flushes the queue when
 * connectivity is restored. Returns a cleanup function to remove the listener.
 */
export function startOnlineListener(getClient: () => RelayApiClient): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = (): void => {
        void flushQueue(getClient());
    };
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
}
