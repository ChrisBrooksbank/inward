/**
 * Pure utility functions for the sync status indicator.
 * Kept separate for testability.
 */

import type { SyncStatus } from '$lib/types/sync';

export type SyncDisplayState = 'offline' | 'syncing' | 'synced' | 'never-synced';

/**
 * Returns the display state based on the current sync status.
 */
export function getSyncDisplayState(status: SyncStatus): SyncDisplayState {
    if (!status.isOnline) return 'offline';
    if (status.isSyncing) return 'syncing';
    if (!status.lastSyncAt) return 'never-synced';
    return 'synced';
}

/**
 * Returns a human-readable relative time string for the last sync date.
 * Accepts an optional `now` parameter for testability.
 */
export function formatLastSync(date: Date, now: Date = new Date()): string {
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}
