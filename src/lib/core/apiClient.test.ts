import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RelayApiClient, RelayApiError, DEFAULT_BASE_URL } from './apiClient';

const BASE = 'https://test.example.com/v1';

function mockFetch(status: number, body: unknown): void {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            ok: status >= 200 && status < 300,
            status,
            statusText: status === 200 ? 'OK' : 'Error',
            json: () => Promise.resolve(body),
        })
    );
}

const DESCRIPTION_RESPONSE = {
    id: '11111111-1111-1111-1111-111111111111',
    text: 'butterflies',
    category: 'metaphorical',
    bodyRegion: 'stomach',
    sharingLevel: 'anonymous',
    confirmationCount: 0,
    confirmationStatus: 'unconfirmed',
    sharedAt: '2026-01-01T00:00:00Z',
};

const CREATE_DESCRIPTION_RESPONSE = {
    id: '11111111-1111-1111-1111-111111111111',
    sharedAt: '2026-01-01T00:00:00Z',
    confirmationCount: 0,
    confirmationStatus: 'unconfirmed',
};

const CREATE_CONFIRMATION_RESPONSE = {
    id: '22222222-2222-2222-2222-222222222222',
    confirmedAt: '2026-01-01T00:00:00Z',
    newConfirmationCount: 1,
};

const SYNC_RESPONSE = {
    descriptions: { created: [], updated: [], deleted: [] },
    confirmationCounts: {},
    serverTime: '2026-01-01T00:00:00Z',
};

let client: RelayApiClient;

beforeEach(() => {
    client = new RelayApiClient(BASE);
    vi.restoreAllMocks();
});

describe('RelayApiClient', () => {
    it('uses DEFAULT_BASE_URL when no base URL provided', () => {
        const c = new RelayApiClient();
        expect(c).toBeInstanceOf(RelayApiClient);
        // DEFAULT_BASE_URL is exported for inspection
        expect(DEFAULT_BASE_URL).toContain('inward.app');
    });

    describe('postDescription', () => {
        it('sends POST to /descriptions and returns parsed response', async () => {
            mockFetch(201, CREATE_DESCRIPTION_RESPONSE);
            const result = await client.postDescription({
                id: '11111111-1111-1111-1111-111111111111',
                text: 'butterflies',
                category: 'metaphorical',
                bodyRegion: 'stomach',
                sharingLevel: 'anonymous',
                deviceId: '33333333-3333-3333-3333-333333333333',
            });
            expect(result.id).toBe('11111111-1111-1111-1111-111111111111');
            expect(result.confirmationCount).toBe(0);

            const fetchMock = vi.mocked(fetch);
            const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
            expect(url).toBe(`${BASE}/descriptions`);
            expect(init.method).toBe('POST');
        });

        it('throws RelayApiError on non-2xx response', async () => {
            mockFetch(422, { error: 'validation_failed' });
            await expect(
                client.postDescription({
                    id: '11111111-1111-1111-1111-111111111111',
                    text: 'x',
                    category: 'metaphorical',
                    bodyRegion: 'stomach',
                    sharingLevel: 'anonymous',
                    deviceId: '33333333-3333-3333-3333-333333333333',
                })
            ).rejects.toBeInstanceOf(RelayApiError);
        });
    });

    describe('getDescriptions', () => {
        it('sends GET to /descriptions with no params', async () => {
            mockFetch(200, {
                descriptions: [DESCRIPTION_RESPONSE],
                totalCount: 1,
                hasMore: false,
            });
            const result = await client.getDescriptions();
            expect(result.descriptions).toHaveLength(1);
            const [url] = vi.mocked(fetch).mock.calls[0] as [string];
            expect(url).toBe(`${BASE}/descriptions`);
        });

        it('appends query string with filters', async () => {
            mockFetch(200, { descriptions: [], totalCount: 0, hasMore: false });
            await client.getDescriptions({ bodyRegion: 'chest', limit: 10 });
            const [url] = vi.mocked(fetch).mock.calls[0] as [string];
            expect(url).toContain('bodyRegion=chest');
            expect(url).toContain('limit=10');
        });

        it('omits undefined filters from query string', async () => {
            mockFetch(200, { descriptions: [], totalCount: 0, hasMore: false });
            await client.getDescriptions({ bodyRegion: 'chest', signalType: undefined });
            const [url] = vi.mocked(fetch).mock.calls[0] as [string];
            expect(url).not.toContain('signalType');
        });
    });

    describe('getDescription', () => {
        it('sends GET to /descriptions/:id', async () => {
            mockFetch(200, DESCRIPTION_RESPONSE);
            const result = await client.getDescription('11111111-1111-1111-1111-111111111111');
            expect(result.text).toBe('butterflies');
            const [url] = vi.mocked(fetch).mock.calls[0] as [string];
            expect(url).toBe(`${BASE}/descriptions/11111111-1111-1111-1111-111111111111`);
        });

        it('throws RelayApiError on 404', async () => {
            mockFetch(404, { error: 'not_found' });
            await expect(
                client.getDescription('99999999-9999-9999-9999-999999999999')
            ).rejects.toBeInstanceOf(RelayApiError);
        });
    });

    describe('postConfirmation', () => {
        it('sends POST to /confirmations and returns response', async () => {
            mockFetch(201, CREATE_CONFIRMATION_RESPONSE);
            const result = await client.postConfirmation({
                descriptionId: '11111111-1111-1111-1111-111111111111',
                deviceId: '33333333-3333-3333-3333-333333333333',
            });
            expect(result.newConfirmationCount).toBe(1);
            const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
            expect(url).toBe(`${BASE}/confirmations`);
            expect(init.method).toBe('POST');
        });
    });

    describe('getSyncDelta', () => {
        it('sends GET to /sync with params', async () => {
            mockFetch(200, SYNC_RESPONSE);
            const result = await client.getSyncDelta({
                deviceId: '33333333-3333-3333-3333-333333333333',
                since: '2026-01-01T00:00:00Z',
            });
            expect(result.descriptions.created).toHaveLength(0);
            const [url] = vi.mocked(fetch).mock.calls[0] as [string];
            expect(url).toContain(`${BASE}/sync`);
            expect(url).toContain('deviceId=33333333');
            expect(url).toContain('since=');
        });

        it('sends GET to /sync without since param', async () => {
            mockFetch(200, SYNC_RESPONSE);
            await client.getSyncDelta({
                deviceId: '33333333-3333-3333-3333-333333333333',
            });
            const [url] = vi.mocked(fetch).mock.calls[0] as [string];
            expect(url).toContain('deviceId=33333333');
        });
    });

    describe('RelayApiError', () => {
        it('exposes status and body', async () => {
            mockFetch(429, { error: 'rate_limit_exceeded', retryAfter: 30 });
            try {
                await client.getDescription('11111111-1111-1111-1111-111111111111');
                expect.fail('should have thrown');
            } catch (err) {
                expect(err).toBeInstanceOf(RelayApiError);
                const apiErr = err as RelayApiError;
                expect(apiErr.status).toBe(429);
                expect(apiErr.name).toBe('RelayApiError');
            }
        });
    });
});
