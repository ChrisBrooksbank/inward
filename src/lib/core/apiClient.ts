/**
 * REST API client for the Inward relay server.
 * Handles POST/GET descriptions, POST confirmations, and GET sync delta.
 */

import {
    CreateDescriptionResponse,
    CreateConfirmationResponse,
    DiscoveryResponse,
    DescriptionResponse,
    SyncResponse,
} from '$lib/types/sync';
import type {
    CreateDescriptionRequest,
    CreateConfirmationRequest,
    SyncQueryParams,
} from '$lib/types/sync';

export const DEFAULT_BASE_URL = 'https://api.inward.app/v1';

/** Error thrown when the relay server returns a non-2xx response. */
export class RelayApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly body: unknown
    ) {
        super(message);
        this.name = 'RelayApiError';
    }
}

type QueryValue = string | number | boolean;

function toQueryString(params: Record<string, QueryValue | undefined>): string {
    const pairs = Object.entries(params)
        .filter((e): e is [string, QueryValue] => e[1] !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

async function parseResponse<T>(
    response: Response,
    schema: { parse: (data: unknown) => T }
): Promise<T> {
    const data: unknown = await response.json();
    if (!response.ok) {
        throw new RelayApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            data
        );
    }
    return schema.parse(data);
}

export interface DiscoveryFilters {
    bodyRegion?: string;
    signalType?: string;
    category?: string;
    emotionConnection?: string;
    query?: string;
    minConfirmations?: number;
    limit?: number;
    offset?: number;
}

/** Client for the Inward relay server REST API. */
export class RelayApiClient {
    constructor(private readonly baseUrl: string = DEFAULT_BASE_URL) {}

    /** Share a description with the relay server. */
    async postDescription(req: CreateDescriptionRequest): Promise<CreateDescriptionResponse> {
        const resp = await fetch(`${this.baseUrl}/descriptions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req),
        });
        return parseResponse(resp, CreateDescriptionResponse);
    }

    /** Discover shared descriptions with optional filters. */
    async getDescriptions(filters: DiscoveryFilters = {}): Promise<DiscoveryResponse> {
        const qs = toQueryString(filters as Record<string, QueryValue | undefined>);
        const resp = await fetch(`${this.baseUrl}/descriptions${qs}`);
        return parseResponse(resp, DiscoveryResponse);
    }

    /** Fetch a single shared description by ID. */
    async getDescription(id: string): Promise<DescriptionResponse> {
        const resp = await fetch(`${this.baseUrl}/descriptions/${encodeURIComponent(id)}`);
        return parseResponse(resp, DescriptionResponse);
    }

    /** Post a "Yes, I feel this too" confirmation. */
    async postConfirmation(req: CreateConfirmationRequest): Promise<CreateConfirmationResponse> {
        const resp = await fetch(`${this.baseUrl}/confirmations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req),
        });
        return parseResponse(resp, CreateConfirmationResponse);
    }

    /** Fetch delta sync payload for descriptions changed since a cursor. */
    async getSyncDelta(params: SyncQueryParams): Promise<SyncResponse> {
        const qs = toQueryString(params as unknown as Record<string, QueryValue | undefined>);
        const resp = await fetch(`${this.baseUrl}/sync${qs}`);
        return parseResponse(resp, SyncResponse);
    }
}
