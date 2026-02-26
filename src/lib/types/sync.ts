/**
 * Sync protocol types for P2P vocabulary sharing.
 * Based on P2P-SYNC-PROTOCOL.md specification.
 */

import { z } from 'zod';
import { BodyRegion, SignalType, VocabularyCategory, ConfirmationStatus } from './domain';

// =============================================================================
// API Request Schemas
// =============================================================================

/**
 * Request to share a description with the relay server.
 */
export const CreateDescriptionRequest = z.object({
    id: z.string().uuid(),
    text: z.string().min(1).max(200),
    category: VocabularyCategory,
    bodyRegion: BodyRegion,
    signalType: SignalType.optional(),
    emotionConnection: z.string().max(50).optional(),
    sharingLevel: z.enum(['anonymous', 'attributed']),
    deviceId: z.string().uuid(),
    contributorName: z.string().max(50).optional(),
});

export type CreateDescriptionRequest = z.infer<typeof CreateDescriptionRequest>;

/**
 * Request to confirm a shared description.
 */
export const CreateConfirmationRequest = z.object({
    descriptionId: z.string().uuid(),
    deviceId: z.string().uuid(),
    bodyRegion: BodyRegion.optional(),
    note: z.string().max(100).optional(),
});

export type CreateConfirmationRequest = z.infer<typeof CreateConfirmationRequest>;

/**
 * Query parameters for discovering descriptions.
 */
export const DiscoveryQueryParams = z.object({
    bodyRegion: BodyRegion.optional(),
    signalType: SignalType.optional(),
    category: VocabularyCategory.optional(),
    emotionConnection: z.string().optional(),
    query: z.string().optional(),
    minConfirmations: z.coerce.number().optional(),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).default(0),
});

export type DiscoveryQueryParams = z.infer<typeof DiscoveryQueryParams>;

/**
 * Query parameters for delta sync.
 */
export const SyncQueryParams = z.object({
    since: z.string().datetime().optional(),
    deviceId: z.string().uuid(),
});

export type SyncQueryParams = z.infer<typeof SyncQueryParams>;

// =============================================================================
// API Response Schemas
// =============================================================================

/**
 * Description as returned from the API (wire format with ISO strings).
 */
export const DescriptionResponse = z.object({
    id: z.string().uuid(),
    text: z.string(),
    category: VocabularyCategory,
    bodyRegion: BodyRegion,
    signalType: SignalType.optional(),
    emotionConnection: z.string().optional(),
    sharingLevel: z.enum(['anonymous', 'attributed']),
    contributorName: z.string().optional(),
    confirmationCount: z.number(),
    confirmationStatus: ConfirmationStatus,
    sharedAt: z.string().datetime(),
    lastConfirmedAt: z.string().datetime().optional(),
});

export type DescriptionResponse = z.infer<typeof DescriptionResponse>;

/**
 * Response for discovery queries.
 */
export const DiscoveryResponse = z.object({
    descriptions: z.array(DescriptionResponse),
    totalCount: z.number(),
    hasMore: z.boolean(),
});

export type DiscoveryResponse = z.infer<typeof DiscoveryResponse>;

/**
 * Response after creating a description.
 */
export const CreateDescriptionResponse = z.object({
    id: z.string().uuid(),
    sharedAt: z.string().datetime(),
    confirmationCount: z.number(),
    confirmationStatus: ConfirmationStatus,
});

export type CreateDescriptionResponse = z.infer<typeof CreateDescriptionResponse>;

/**
 * Response after creating a confirmation.
 */
export const CreateConfirmationResponse = z.object({
    id: z.string().uuid(),
    confirmedAt: z.string().datetime(),
    newConfirmationCount: z.number(),
});

export type CreateConfirmationResponse = z.infer<typeof CreateConfirmationResponse>;

/**
 * Response for delta sync requests.
 */
export const SyncResponse = z.object({
    descriptions: z.object({
        created: z.array(DescriptionResponse),
        updated: z.array(DescriptionResponse),
        deleted: z.array(z.string().uuid()),
    }),
    confirmationCounts: z.record(z.string().uuid(), z.number()),
    serverTime: z.string().datetime(),
});

export type SyncResponse = z.infer<typeof SyncResponse>;

// =============================================================================
// Offline Queue Types
// =============================================================================

/**
 * Operation types for the pending operations queue.
 */
export const OperationType = z.enum(['share', 'confirm', 'unshare']);

export type OperationType = z.infer<typeof OperationType>;

/**
 * Pending operation stored in IndexedDB for offline support.
 */
export const PendingOperation = z.object({
    id: z.string().uuid(),
    type: OperationType,
    payload: z.unknown(),
    createdAt: z.date(),
    retryCount: z.number().default(0),
    lastError: z.string().optional(),
    nextRetryAt: z.date().optional(),
});

export type PendingOperation = z.infer<typeof PendingOperation>;

// =============================================================================
// Device & Sync Metadata
// =============================================================================

/**
 * Device registration stored locally.
 */
export const DeviceRegistration = z.object({
    deviceId: z.string().uuid(),
    registeredAt: z.date(),
    lastSyncAt: z.date().optional(),
});

export type DeviceRegistration = z.infer<typeof DeviceRegistration>;

/**
 * Sync metadata stored in IndexedDB.
 */
export const SyncMetadata = z.object({
    deviceId: z.string().uuid(),
    lastSyncAt: z.date().nullable(),
    registeredAt: z.date(),
});

export type SyncMetadata = z.infer<typeof SyncMetadata>;

// =============================================================================
// Wire Format Payloads
// =============================================================================

/**
 * Wire format for description payloads (used in API requests).
 */
export const DescriptionPayload = z.object({
    id: z.string().uuid(),
    text: z.string().min(1).max(200),
    category: VocabularyCategory,
    bodyRegion: BodyRegion,
    signalType: SignalType.optional(),
    emotionConnection: z.string().max(50).optional(),
    sharingLevel: z.enum(['anonymous', 'attributed']),
    deviceId: z.string().uuid(),
    contributorName: z.string().max(50).optional(),
});

export type DescriptionPayload = z.infer<typeof DescriptionPayload>;

/**
 * Wire format for confirmation payloads.
 */
export const ConfirmationPayload = z.object({
    descriptionId: z.string().uuid(),
    deviceId: z.string().uuid(),
    bodyRegion: BodyRegion.optional(),
    note: z.string().max(100).optional(),
});

export type ConfirmationPayload = z.infer<typeof ConfirmationPayload>;

// =============================================================================
// Sync Status (for UI)
// =============================================================================

/**
 * Sync status for display in the UI.
 */
export const SyncStatus = z.object({
    lastSyncAt: z.date().optional(),
    pendingOperations: z.number(),
    failedOperations: z.number(),
    isOnline: z.boolean(),
    isSyncing: z.boolean(),
});

export type SyncStatus = z.infer<typeof SyncStatus>;

/**
 * Result of a sync operation.
 */
export const SyncResult = z.object({
    success: z.boolean(),
    created: z.number(),
    updated: z.number(),
    deleted: z.number(),
    errors: z.array(
        z.object({
            operationId: z.string(),
            type: OperationType,
            error: z.string(),
        })
    ),
});

export type SyncResult = z.infer<typeof SyncResult>;

// =============================================================================
// Error Types
// =============================================================================

/**
 * API error response.
 */
export const ApiError = z.object({
    error: z.string(),
    details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiError>;

/**
 * Validation error response.
 */
export const ValidationError = z.object({
    error: z.literal('validation_failed'),
    details: z.array(
        z.object({
            path: z.array(z.string()),
            message: z.string(),
        })
    ),
});

export type ValidationError = z.infer<typeof ValidationError>;

/**
 * Rate limit error response.
 */
export const RateLimitError = z.object({
    error: z.literal('rate_limit_exceeded'),
    retryAfter: z.number(), // seconds
    limit: z.number(),
    remaining: z.number(),
});

export type RateLimitError = z.infer<typeof RateLimitError>;

/**
 * Conflict error response.
 */
export const ConflictError = z.object({
    error: z.literal('conflict'),
    serverValue: z.unknown(),
});

export type ConflictError = z.infer<typeof ConflictError>;
