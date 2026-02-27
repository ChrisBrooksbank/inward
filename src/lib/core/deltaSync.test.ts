import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runDeltaSync, startBackgroundSync, SYNC_INTERVAL_MS } from './deltaSync';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockDb = {
    meta: null as { deviceId: string; registeredAt: Date; lastSyncAt: Date | null } | null,
    sharedDescriptions: new Map<string, object>(),
};

vi.mock('$lib/db', () => ({
    getSyncMeta: vi.fn(async () => mockDb.meta),
    putSyncMeta: vi.fn(async (meta: object) => {
        mockDb.meta = meta as typeof mockDb.meta;
    }),
    putSharedDescription: vi.fn(async (desc: { id: string }) => {
        mockDb.sharedDescriptions.set(desc.id, desc);
    }),
    deleteSharedDescription: vi.fn(async (id: string) => {
        mockDb.sharedDescriptions.delete(id);
    }),
    getSharedDescription: vi.fn(async (id: string) => mockDb.sharedDescriptions.get(id)),
}));

vi.mock('$lib/core/deviceRegistration', () => ({
    getOrCreateDeviceId: vi.fn(async () => DEVICE_ID),
}));

vi.mock('$lib/core/sharedVocabulary', () => ({
    computeConfirmationStatus: vi.fn((count: number) => {
        if (count === 0) return 'unconfirmed';
        if (count >= 5) return 'popular';
        return 'confirmed';
    }),
}));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEVICE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const DESC_ID_1 = '11111111-1111-1111-1111-111111111111';
const DESC_ID_2 = '22222222-2222-2222-2222-222222222222';
const SERVER_TIME = '2026-01-15T12:00:00.000Z';

const BASE_DESC_RESPONSE = {
    id: DESC_ID_1,
    text: 'butterflies',
    category: 'metaphorical' as const,
    bodyRegion: 'stomach' as const,
    sharingLevel: 'anonymous' as const,
    confirmationCount: 0,
    confirmationStatus: 'unconfirmed' as const,
    sharedAt: '2026-01-01T00:00:00.000Z',
};

const EMPTY_SYNC_RESPONSE = {
    descriptions: { created: [], updated: [], deleted: [] },
    confirmationCounts: {},
    serverTime: SERVER_TIME,
};

function makeClient(overrides: { getSyncDelta?: ReturnType<typeof vi.fn> } = {}): {
    getSyncDelta: ReturnType<typeof vi.fn>;
    postDescription: ReturnType<typeof vi.fn>;
    postConfirmation: ReturnType<typeof vi.fn>;
    getDescriptions: ReturnType<typeof vi.fn>;
    getDescription: ReturnType<typeof vi.fn>;
} {
    return {
        getSyncDelta: vi.fn().mockResolvedValue(EMPTY_SYNC_RESPONSE),
        postDescription: vi.fn(),
        postConfirmation: vi.fn(),
        getDescriptions: vi.fn(),
        getDescription: vi.fn(),
        ...overrides,
    };
}

beforeEach(() => {
    mockDb.meta = null;
    mockDb.sharedDescriptions.clear();
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// runDeltaSync
// ---------------------------------------------------------------------------

describe('runDeltaSync', () => {
    it('calls getSyncDelta with deviceId and no since when no prior sync', async () => {
        const client = makeClient();
        await runDeltaSync(client as never);
        expect(client.getSyncDelta).toHaveBeenCalledWith({
            deviceId: DEVICE_ID,
            since: undefined,
        });
    });

    it('passes lastSyncAt as since cursor when meta exists', async () => {
        mockDb.meta = {
            deviceId: DEVICE_ID,
            registeredAt: new Date('2026-01-01'),
            lastSyncAt: new Date('2026-01-10T08:00:00.000Z'),
        };
        const client = makeClient();
        await runDeltaSync(client as never);
        expect(client.getSyncDelta).toHaveBeenCalledWith({
            deviceId: DEVICE_ID,
            since: '2026-01-10T08:00:00.000Z',
        });
    });

    it('upserts created descriptions into IndexedDB', async () => {
        const { putSharedDescription } = await import('$lib/db');
        const client = makeClient({
            getSyncDelta: vi.fn().mockResolvedValue({
                ...EMPTY_SYNC_RESPONSE,
                descriptions: {
                    created: [BASE_DESC_RESPONSE],
                    updated: [],
                    deleted: [],
                },
            }),
        });
        await runDeltaSync(client as never);
        expect(putSharedDescription).toHaveBeenCalledOnce();
        const call = vi.mocked(putSharedDescription).mock.calls[0][0];
        expect(call.id).toBe(DESC_ID_1);
        expect(call.sharedAt).toBeInstanceOf(Date);
    });

    it('upserts updated descriptions into IndexedDB', async () => {
        const { putSharedDescription } = await import('$lib/db');
        const client = makeClient({
            getSyncDelta: vi.fn().mockResolvedValue({
                ...EMPTY_SYNC_RESPONSE,
                descriptions: {
                    created: [],
                    updated: [{ ...BASE_DESC_RESPONSE, confirmationCount: 2 }],
                    deleted: [],
                },
            }),
        });
        await runDeltaSync(client as never);
        expect(putSharedDescription).toHaveBeenCalledOnce();
        expect(vi.mocked(putSharedDescription).mock.calls[0][0].confirmationCount).toBe(2);
    });

    it('deletes removed descriptions from IndexedDB', async () => {
        const { deleteSharedDescription } = await import('$lib/db');
        const client = makeClient({
            getSyncDelta: vi.fn().mockResolvedValue({
                ...EMPTY_SYNC_RESPONSE,
                descriptions: { created: [], updated: [], deleted: [DESC_ID_2] },
            }),
        });
        await runDeltaSync(client as never);
        expect(deleteSharedDescription).toHaveBeenCalledWith(DESC_ID_2);
    });

    it('updates confirmation counts for existing local descriptions', async () => {
        mockDb.sharedDescriptions.set(DESC_ID_1, {
            id: DESC_ID_1,
            text: 'butterflies',
            category: 'metaphorical',
            bodyRegion: 'stomach',
            sharingLevel: 'anonymous',
            confirmationCount: 1,
            confirmationStatus: 'confirmed',
            sharedAt: new Date(),
        });
        const { putSharedDescription } = await import('$lib/db');
        const client = makeClient({
            getSyncDelta: vi.fn().mockResolvedValue({
                ...EMPTY_SYNC_RESPONSE,
                confirmationCounts: { [DESC_ID_1]: 7 },
            }),
        });
        await runDeltaSync(client as never);
        expect(putSharedDescription).toHaveBeenCalledOnce();
        const updated = vi.mocked(putSharedDescription).mock.calls[0][0];
        expect(updated.confirmationCount).toBe(7);
        expect(updated.confirmationStatus).toBe('popular');
    });

    it('skips confirmation count update for unknown IDs', async () => {
        const { putSharedDescription } = await import('$lib/db');
        const client = makeClient({
            getSyncDelta: vi.fn().mockResolvedValue({
                ...EMPTY_SYNC_RESPONSE,
                confirmationCounts: { 'unknown-id': 3 },
            }),
        });
        await runDeltaSync(client as never);
        expect(putSharedDescription).not.toHaveBeenCalled();
    });

    it('updates the sync cursor (lastSyncAt) in IndexedDB', async () => {
        const { putSyncMeta } = await import('$lib/db');
        const client = makeClient();
        await runDeltaSync(client as never);
        expect(putSyncMeta).toHaveBeenCalledOnce();
        const saved = vi.mocked(putSyncMeta).mock.calls[0][0];
        expect(saved.lastSyncAt).toEqual(new Date(SERVER_TIME));
        expect(saved.deviceId).toBe(DEVICE_ID);
    });

    it('preserves registeredAt when meta exists', async () => {
        const registeredAt = new Date('2025-12-01');
        mockDb.meta = { deviceId: DEVICE_ID, registeredAt, lastSyncAt: null };
        const { putSyncMeta } = await import('$lib/db');
        const client = makeClient();
        await runDeltaSync(client as never);
        expect(vi.mocked(putSyncMeta).mock.calls[0][0].registeredAt).toEqual(registeredAt);
    });

    it('returns correct counts in SyncResult', async () => {
        const client = makeClient({
            getSyncDelta: vi.fn().mockResolvedValue({
                descriptions: {
                    created: [BASE_DESC_RESPONSE],
                    updated: [{ ...BASE_DESC_RESPONSE, id: DESC_ID_2 }],
                    deleted: ['dddddddd-dddd-dddd-dddd-dddddddddddd'],
                },
                confirmationCounts: {},
                serverTime: SERVER_TIME,
            }),
        });
        const result = await runDeltaSync(client as never);
        expect(result.success).toBe(true);
        expect(result.created).toBe(1);
        expect(result.updated).toBe(1);
        expect(result.deleted).toBe(1);
        expect(result.errors).toHaveLength(0);
    });

    it('maps sharedAt ISO string to Date object', async () => {
        const { putSharedDescription } = await import('$lib/db');
        const client = makeClient({
            getSyncDelta: vi.fn().mockResolvedValue({
                ...EMPTY_SYNC_RESPONSE,
                descriptions: {
                    created: [
                        { ...BASE_DESC_RESPONSE, lastConfirmedAt: '2026-01-02T00:00:00.000Z' },
                    ],
                    updated: [],
                    deleted: [],
                },
            }),
        });
        await runDeltaSync(client as never);
        const mapped = vi.mocked(putSharedDescription).mock.calls[0][0];
        expect(mapped.sharedAt).toBeInstanceOf(Date);
        expect(mapped.lastConfirmedAt).toBeInstanceOf(Date);
    });
});

// ---------------------------------------------------------------------------
// SYNC_INTERVAL_MS
// ---------------------------------------------------------------------------

describe('SYNC_INTERVAL_MS', () => {
    it('is 15 minutes (900000ms)', () => {
        expect(SYNC_INTERVAL_MS).toBe(900_000);
    });
});

// ---------------------------------------------------------------------------
// startBackgroundSync
// ---------------------------------------------------------------------------

describe('startBackgroundSync', () => {
    it('returns a no-op cleanup when window is undefined', () => {
        const origWindow = global.window;
        // @ts-expect-error — simulate SSR
        delete global.window;
        const cleanup = startBackgroundSync(() => makeClient() as never);
        expect(() => cleanup()).not.toThrow();
        global.window = origWindow;
    });

    it('triggers sync on visibilitychange to visible', async () => {
        const client = makeClient();
        const cleanup = startBackgroundSync(() => client as never, 999_999);
        Object.defineProperty(document, 'visibilityState', {
            value: 'visible',
            configurable: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
        // Flush async chain: getOrCreateDeviceId -> getSyncMeta -> getSyncDelta
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(client.getSyncDelta).toHaveBeenCalled();
        cleanup();
    });

    it('does not trigger sync on visibilitychange to hidden', () => {
        const client = makeClient();
        const cleanup = startBackgroundSync(() => client as never, 999_999);
        Object.defineProperty(document, 'visibilityState', {
            value: 'hidden',
            configurable: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(client.getSyncDelta).not.toHaveBeenCalled();
        cleanup();
    });

    it('triggers sync on window focus', async () => {
        const client = makeClient();
        const cleanup = startBackgroundSync(() => client as never, 999_999);
        window.dispatchEvent(new Event('focus'));
        // Flush async chain: getOrCreateDeviceId -> getSyncMeta -> getSyncDelta
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(client.getSyncDelta).toHaveBeenCalled();
        cleanup();
    });

    it('triggers sync on the periodic interval', async () => {
        vi.useFakeTimers();
        const client = makeClient();
        const cleanup = startBackgroundSync(() => client as never, 1000);
        await vi.advanceTimersByTimeAsync(2500);
        expect(client.getSyncDelta).toHaveBeenCalledTimes(2);
        cleanup();
        vi.useRealTimers();
    });

    it('cleanup stops the interval', async () => {
        vi.useFakeTimers();
        const client = makeClient();
        const cleanup = startBackgroundSync(() => client as never, 1000);
        cleanup();
        await vi.advanceTimersByTimeAsync(3000);
        expect(client.getSyncDelta).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('cleanup removes visibilitychange listener', () => {
        const client = makeClient();
        const cleanup = startBackgroundSync(() => client as never, 999_999);
        cleanup();
        Object.defineProperty(document, 'visibilityState', {
            value: 'visible',
            configurable: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
        expect(client.getSyncDelta).not.toHaveBeenCalled();
    });

    it('cleanup removes focus listener', () => {
        const client = makeClient();
        const cleanup = startBackgroundSync(() => client as never, 999_999);
        cleanup();
        window.dispatchEvent(new Event('focus'));
        expect(client.getSyncDelta).not.toHaveBeenCalled();
    });
});
