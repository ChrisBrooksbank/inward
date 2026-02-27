import { describe, it, expect } from 'vitest';
import { getSyncDisplayState, formatLastSync } from './sync-status';
import type { SyncStatus } from '$lib/types/sync';

function makeStatus(overrides: Partial<SyncStatus> = {}): SyncStatus {
    return {
        isOnline: true,
        isSyncing: false,
        pendingOperations: 0,
        failedOperations: 0,
        ...overrides,
    };
}

describe('getSyncDisplayState', () => {
    it('returns offline when not online', () => {
        expect(getSyncDisplayState(makeStatus({ isOnline: false }))).toBe('offline');
    });

    it('returns syncing when isSyncing is true', () => {
        expect(getSyncDisplayState(makeStatus({ isSyncing: true }))).toBe('syncing');
    });

    it('returns synced when online, not syncing, and has lastSyncAt', () => {
        const status = makeStatus({ lastSyncAt: new Date() });
        expect(getSyncDisplayState(status)).toBe('synced');
    });

    it('returns never-synced when online, not syncing, and no lastSyncAt', () => {
        expect(getSyncDisplayState(makeStatus())).toBe('never-synced');
    });

    it('offline takes precedence over syncing', () => {
        const status = makeStatus({ isOnline: false, isSyncing: true });
        expect(getSyncDisplayState(status)).toBe('offline');
    });
});

describe('formatLastSync', () => {
    const base = new Date('2025-01-01T12:00:00Z');

    it('returns "just now" for < 60 seconds ago', () => {
        const past = new Date(base.getTime() - 30_000);
        expect(formatLastSync(past, base)).toBe('just now');
    });

    it('returns "1 min ago" for exactly 60 seconds', () => {
        const past = new Date(base.getTime() - 60_000);
        expect(formatLastSync(past, base)).toBe('1 min ago');
    });

    it('returns "45 min ago" for 45 minutes ago', () => {
        const past = new Date(base.getTime() - 45 * 60_000);
        expect(formatLastSync(past, base)).toBe('45 min ago');
    });

    it('returns "2h ago" for 2 hours ago', () => {
        const past = new Date(base.getTime() - 2 * 3600_000);
        expect(formatLastSync(past, base)).toBe('2h ago');
    });

    it('returns "3d ago" for 3 days ago', () => {
        const past = new Date(base.getTime() - 3 * 86400_000);
        expect(formatLastSync(past, base)).toBe('3d ago');
    });

    it('returns "just now" for 0 seconds ago', () => {
        expect(formatLastSync(base, base)).toBe('just now');
    });
});
