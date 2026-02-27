import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getBackoffMs,
    MAX_BACKOFF_MS,
    queueDescription,
    queueConfirmation,
    flushQueue,
    startOnlineListener,
} from './offlineQueue';
import type { PendingOperation } from '$lib/types/sync';

// ---------------------------------------------------------------------------
// Mock $lib/db
// ---------------------------------------------------------------------------

const mockQueue: PendingOperation[] = [];

vi.mock('$lib/db', () => ({
    enqueue: vi.fn(async (op: PendingOperation) => {
        const idx = mockQueue.findIndex(o => o.id === op.id);
        if (idx >= 0) {
            mockQueue[idx] = op;
        } else {
            mockQueue.push(op);
        }
    }),
    getQueue: vi.fn(async () => [...mockQueue]),
    dequeue: vi.fn(async (id: string) => {
        const idx = mockQueue.findIndex(o => o.id === id);
        if (idx >= 0) mockQueue.splice(idx, 1);
    }),
}));

// ---------------------------------------------------------------------------
// Mock RelayApiError
// ---------------------------------------------------------------------------

vi.mock('$lib/core/apiClient', async () => {
    const actual =
        await vi.importActual<typeof import('$lib/core/apiClient')>('$lib/core/apiClient');
    return { ...actual };
});

import { RelayApiError } from '$lib/core/apiClient';
import type { RelayApiClient } from '$lib/core/apiClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeClient(overrides: Partial<RelayApiClient> = {}): RelayApiClient {
    return {
        postDescription: vi.fn().mockResolvedValue({}),
        postConfirmation: vi.fn().mockResolvedValue({}),
        getDescriptions: vi.fn(),
        getDescription: vi.fn(),
        getSyncDelta: vi.fn(),
        ...overrides,
    } as unknown as RelayApiClient;
}

const DESC_ID = '11111111-1111-1111-1111-111111111111';
const DEVICE_ID = '22222222-2222-2222-2222-222222222222';
const DESC_ID_2 = '33333333-3333-3333-3333-333333333333';

const descPayload = {
    id: DESC_ID,
    text: 'butterflies',
    category: 'metaphorical' as const,
    bodyRegion: 'stomach' as const,
    sharingLevel: 'anonymous' as const,
    deviceId: DEVICE_ID,
};

const confirmPayload = {
    descriptionId: DESC_ID,
    deviceId: DEVICE_ID,
};

beforeEach(() => {
    mockQueue.length = 0;
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getBackoffMs
// ---------------------------------------------------------------------------

describe('getBackoffMs', () => {
    it('returns 1000ms on first retry (retryCount=0)', () => {
        expect(getBackoffMs(0)).toBe(1000);
    });

    it('returns 2000ms on second retry (retryCount=1)', () => {
        expect(getBackoffMs(1)).toBe(2000);
    });

    it('returns 4000ms on third retry (retryCount=2)', () => {
        expect(getBackoffMs(2)).toBe(4000);
    });

    it('caps at MAX_BACKOFF_MS (30s)', () => {
        expect(getBackoffMs(10)).toBe(MAX_BACKOFF_MS);
        expect(getBackoffMs(100)).toBe(MAX_BACKOFF_MS);
    });

    it('MAX_BACKOFF_MS is 30 seconds', () => {
        expect(MAX_BACKOFF_MS).toBe(30_000);
    });
});

// ---------------------------------------------------------------------------
// queueDescription
// ---------------------------------------------------------------------------

describe('queueDescription', () => {
    it('enqueues a share operation with the given payload', async () => {
        await queueDescription(descPayload);
        expect(mockQueue).toHaveLength(1);
        expect(mockQueue[0].type).toBe('share');
        expect(mockQueue[0].payload).toEqual(descPayload);
    });

    it('assigns a UUID id and createdAt date', async () => {
        await queueDescription(descPayload);
        const op = mockQueue[0];
        expect(op.id).toMatch(/^[0-9a-f-]{36}$/i);
        expect(op.createdAt).toBeInstanceOf(Date);
    });

    it('starts with retryCount 0', async () => {
        await queueDescription(descPayload);
        expect(mockQueue[0].retryCount).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// queueConfirmation
// ---------------------------------------------------------------------------

describe('queueConfirmation', () => {
    it('enqueues a confirm operation with the given payload', async () => {
        await queueConfirmation(confirmPayload);
        expect(mockQueue).toHaveLength(1);
        expect(mockQueue[0].type).toBe('confirm');
        expect(mockQueue[0].payload).toEqual(confirmPayload);
    });

    it('assigns a UUID id and retryCount 0', async () => {
        await queueConfirmation(confirmPayload);
        const op = mockQueue[0];
        expect(op.id).toMatch(/^[0-9a-f-]{36}$/i);
        expect(op.retryCount).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// flushQueue
// ---------------------------------------------------------------------------

describe('flushQueue', () => {
    it('returns zero counts when queue is empty', async () => {
        const client = makeClient();
        const result = await flushQueue(client);
        expect(result.processed).toBe(0);
        expect(result.failed).toBe(0);
    });

    it('calls postDescription for share operations', async () => {
        await queueDescription(descPayload);
        const client = makeClient();
        await flushQueue(client);
        expect(client.postDescription).toHaveBeenCalledWith(descPayload);
    });

    it('calls postConfirmation for confirm operations', async () => {
        await queueConfirmation(confirmPayload);
        const client = makeClient();
        await flushQueue(client);
        expect(client.postConfirmation).toHaveBeenCalledWith(confirmPayload);
    });

    it('removes successful operations from the queue', async () => {
        await queueDescription(descPayload);
        await flushQueue(makeClient());
        expect(mockQueue).toHaveLength(0);
    });

    it('reports processed count for successful operations', async () => {
        await queueDescription(descPayload);
        await queueConfirmation(confirmPayload);
        const result = await flushQueue(makeClient());
        expect(result.processed).toBe(2);
        expect(result.failed).toBe(0);
    });

    it('re-queues failed operations with incremented retryCount', async () => {
        await queueDescription(descPayload);
        const client = makeClient({
            postDescription: vi.fn().mockRejectedValue(new Error('network error')),
        });
        const result = await flushQueue(client);
        expect(result.failed).toBe(1);
        expect(result.processed).toBe(0);
        expect(mockQueue).toHaveLength(1);
        expect(mockQueue[0].retryCount).toBe(1);
    });

    it('sets lastError on re-queued operations', async () => {
        await queueDescription(descPayload);
        const client = makeClient({
            postDescription: vi.fn().mockRejectedValue(new Error('timeout')),
        });
        await flushQueue(client);
        expect(mockQueue[0].lastError).toBe('timeout');
    });

    it('sets nextRetryAt on re-queued operations', async () => {
        await queueDescription(descPayload);
        const before = Date.now();
        const client = makeClient({
            postDescription: vi.fn().mockRejectedValue(new Error('fail')),
        });
        await flushQueue(client);
        const op = mockQueue[0];
        expect(op.nextRetryAt).toBeInstanceOf(Date);
        expect(op.nextRetryAt!.getTime()).toBeGreaterThanOrEqual(before + 1000);
    });

    it('treats 409 conflict as success for share operations', async () => {
        await queueDescription(descPayload);
        const err = new RelayApiError('conflict', 409, {});
        const client = makeClient({ postDescription: vi.fn().mockRejectedValue(err) });
        const result = await flushQueue(client);
        expect(result.processed).toBe(1);
        expect(result.failed).toBe(0);
        expect(mockQueue).toHaveLength(0);
    });

    it('treats 409 conflict as success for confirm operations', async () => {
        await queueConfirmation(confirmPayload);
        const err = new RelayApiError('conflict', 409, {});
        const client = makeClient({ postConfirmation: vi.fn().mockRejectedValue(err) });
        const result = await flushQueue(client);
        expect(result.processed).toBe(1);
        expect(mockQueue).toHaveLength(0);
    });

    it('skips operations where nextRetryAt is in the future', async () => {
        const futureOp: PendingOperation = {
            id: DESC_ID_2,
            type: 'share',
            payload: descPayload,
            createdAt: new Date(),
            retryCount: 1,
            nextRetryAt: new Date(Date.now() + 60_000),
        };
        mockQueue.push(futureOp);
        const client = makeClient();
        const result = await flushQueue(client);
        expect(result.processed).toBe(0);
        expect(client.postDescription).not.toHaveBeenCalled();
    });

    it('processes operations where nextRetryAt has passed', async () => {
        const pastOp: PendingOperation = {
            id: DESC_ID_2,
            type: 'share',
            payload: descPayload,
            createdAt: new Date(),
            retryCount: 1,
            nextRetryAt: new Date(Date.now() - 1000),
        };
        mockQueue.push(pastOp);
        const client = makeClient();
        const result = await flushQueue(client);
        expect(result.processed).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// startOnlineListener
// ---------------------------------------------------------------------------

describe('startOnlineListener', () => {
    it('returns a no-op cleanup when window is undefined', () => {
        const origWindow = global.window;
        // @ts-expect-error — simulate SSR environment
        delete global.window;
        const cleanup = startOnlineListener(() => makeClient());
        expect(() => cleanup()).not.toThrow();
        global.window = origWindow;
    });

    it('flushes the queue when online event fires', async () => {
        await queueDescription(descPayload);
        const client = makeClient();
        const cleanup = startOnlineListener(() => client);
        window.dispatchEvent(new Event('online'));
        // Allow the async flush to settle
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(client.postDescription).toHaveBeenCalled();
        cleanup();
    });

    it('cleanup removes the online listener', async () => {
        const client = makeClient();
        const cleanup = startOnlineListener(() => client);
        cleanup();
        await queueDescription(descPayload);
        window.dispatchEvent(new Event('online'));
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(client.postDescription).not.toHaveBeenCalled();
    });
});
