# P2P Sync Protocol Specification

Technical specification for the Inward vocabulary sharing sync protocol using a lightweight relay server architecture.

---

## Table of Contents

1. [Overview](#overview)
2. [Data Flow Model](#data-flow-model)
3. [API Specification](#api-specification)
4. [Sync Protocol](#sync-protocol)
5. [Offline Support](#offline-support)
6. [Privacy & Anonymity](#privacy--anonymity)
7. [Security](#security)
8. [Data Retention](#data-retention)
9. [TypeScript Types](#typescript-types)
10. [IndexedDB Schema Updates](#indexeddb-schema-updates)
11. [Store Interface Updates](#store-interface-updates)
12. [Server Implementation Notes](#server-implementation-notes)
13. [Error Handling](#error-handling)
14. [Sequence Diagrams](#sequence-diagrams)

---

## Overview

### Goals

The P2P sync protocol enables three core capabilities:

1. **Vocabulary Discovery** - Users discover sensation descriptions shared by others
2. **Confirmation Propagation** - "Yes, I feel this too" confirmations sync across devices
3. **Privacy Preservation** - Anonymous sharing with minimal data collection

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           P2P Sync Architecture                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐                                      ┌──────────────┐    │
│   │   Client A   │                                      │   Client B   │    │
│   │  (IndexedDB) │                                      │  (IndexedDB) │    │
│   └──────┬───────┘                                      └───────┬──────┘    │
│          │                                                      │           │
│          │  HTTPS/REST                              HTTPS/REST  │           │
│          │                                                      │           │
│          │              ┌────────────────────┐                  │           │
│          └──────────────┤   Relay Server     ├──────────────────┘           │
│                         │   (Stateless)      │                              │
│                         │                    │                              │
│                         │  - REST API        │                              │
│                         │  - WebSocket (opt) │                              │
│                         │  - Edge Database   │                              │
│                         └────────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Design Principles

| Principle                | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| **Offline-first**        | All operations work offline; sync happens in background              |
| **Privacy-by-default**   | Anonymous sharing; no accounts required                              |
| **Eventual consistency** | Clients reconcile via delta sync; server is authoritative for counts |
| **Minimal server state** | Server is a stateless relay; clients own their data                  |

---

## Data Flow Model

### What Stays Local-Only

These data types **never leave the device**:

- Personal `SensationDescription` with `sharingLevel: 'private'`
- `UserVocabularyProfile` (aggregated locally)
- Exercise session data
- User preferences and settings

### What Gets Synced

These data types are synced via the relay server:

| Data Type                | Sync Direction  | Notes                                         |
| ------------------------ | --------------- | --------------------------------------------- |
| `SharedDescription`      | Bidirectional   | User shares → server → other clients discover |
| `VocabularyConfirmation` | Client → Server | Confirmations aggregate on server             |
| `confirmationCount`      | Server → Client | Aggregated count flows back                   |

### Sync Direction Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Sync Data Flows                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SHARE FLOW (Client → Server → Clients)                                     │
│  ─────────────────────────────────────────                                  │
│  User creates description → marks as shared → queued locally →              │
│  background sync → server stores → available for discovery                   │
│                                                                              │
│  DISCOVER FLOW (Server → Client)                                            │
│  ────────────────────────────────                                           │
│  User browses/searches → client queries server → results returned →         │
│  cached in local sharedDescriptions store                                    │
│                                                                              │
│  CONFIRM FLOW (Client → Server → Clients)                                   │
│  ─────────────────────────────────────────                                  │
│  User confirms description → queued locally → background sync →             │
│  server increments count → count propagates to all clients                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## API Specification

### Base URL

```
https://api.inward.app/v1
```

### Endpoints

#### Share a Description

```http
POST /api/v1/descriptions
Content-Type: application/json

{
  "id": "uuid",
  "text": "butterflies",
  "category": "metaphorical",
  "bodyRegion": "stomach",
  "signalType": "gastric",
  "emotionConnection": "anxiety",
  "sharingLevel": "anonymous",
  "deviceId": "uuid"
}
```

**Response:**

```http
201 Created
Content-Type: application/json

{
  "id": "uuid",
  "sharedAt": "2026-02-01T12:00:00Z",
  "confirmationCount": 0,
  "confirmationStatus": "unconfirmed"
}
```

#### Discover Descriptions

```http
GET /api/v1/descriptions?bodyRegion=stomach&category=metaphorical&limit=20&offset=0
```

**Query Parameters:**

| Parameter           | Type   | Description                              |
| ------------------- | ------ | ---------------------------------------- |
| `bodyRegion`        | string | Filter by body region                    |
| `signalType`        | string | Filter by signal type                    |
| `category`          | string | Filter by vocabulary category            |
| `emotionConnection` | string | Filter by emotion (partial match)        |
| `query`             | string | Text search in description text          |
| `minConfirmations`  | number | Minimum confirmation count               |
| `limit`             | number | Results per page (default: 20, max: 100) |
| `offset`            | number | Pagination offset                        |

**Response:**

```http
200 OK
Content-Type: application/json

{
  "descriptions": [
    {
      "id": "uuid",
      "text": "butterflies",
      "category": "metaphorical",
      "bodyRegion": "stomach",
      "signalType": "gastric",
      "emotionConnection": "anxiety",
      "sharingLevel": "anonymous",
      "confirmationCount": 42,
      "confirmationStatus": "popular",
      "sharedAt": "2026-01-15T10:30:00Z",
      "lastConfirmedAt": "2026-02-01T08:15:00Z"
    }
  ],
  "totalCount": 156,
  "hasMore": true
}
```

#### Get Single Description

```http
GET /api/v1/descriptions/:id
```

**Response:**

```http
200 OK
Content-Type: application/json

{
  "id": "uuid",
  "text": "butterflies",
  "category": "metaphorical",
  "bodyRegion": "stomach",
  "signalType": "gastric",
  "emotionConnection": "anxiety",
  "sharingLevel": "anonymous",
  "confirmationCount": 42,
  "confirmationStatus": "popular",
  "sharedAt": "2026-01-15T10:30:00Z",
  "lastConfirmedAt": "2026-02-01T08:15:00Z"
}
```

#### Confirm a Description

```http
POST /api/v1/confirmations
Content-Type: application/json

{
  "descriptionId": "uuid",
  "deviceId": "uuid",
  "bodyRegion": "stomach",
  "note": "exactly how it feels before a presentation"
}
```

**Response:**

```http
201 Created
Content-Type: application/json

{
  "id": "uuid",
  "confirmedAt": "2026-02-01T12:00:00Z",
  "newConfirmationCount": 43
}
```

#### Bulk Sync (Delta)

```http
GET /api/v1/sync?since=2026-01-31T00:00:00Z&deviceId=uuid
```

**Query Parameters:**

| Parameter  | Type     | Description                                       |
| ---------- | -------- | ------------------------------------------------- |
| `since`    | ISO 8601 | Last sync timestamp                               |
| `deviceId` | uuid     | Device identifier for filtering own confirmations |

**Response:**

```http
200 OK
Content-Type: application/json

{
  "descriptions": {
    "created": [...],
    "updated": [...],
    "deleted": ["uuid", "uuid"]
  },
  "confirmationCounts": {
    "uuid": 43,
    "uuid": 12
  },
  "serverTime": "2026-02-01T12:00:00Z"
}
```

### Request/Response Schemas (Zod)

```typescript
import { z } from 'zod';
import { BodyRegion, SignalType } from './exercise-system';
import { VocabularyCategory, SharingLevel, ConfirmationStatus } from './sensation-vocabulary';

// API Request Schemas
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

export const CreateConfirmationRequest = z.object({
    descriptionId: z.string().uuid(),
    deviceId: z.string().uuid(),
    bodyRegion: BodyRegion.optional(),
    note: z.string().max(100).optional(),
});

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

export const SyncQueryParams = z.object({
    since: z.string().datetime(),
    deviceId: z.string().uuid(),
});

// API Response Schemas
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

export const DiscoveryResponse = z.object({
    descriptions: z.array(DescriptionResponse),
    totalCount: z.number(),
    hasMore: z.boolean(),
});

export const CreateDescriptionResponse = z.object({
    id: z.string().uuid(),
    sharedAt: z.string().datetime(),
    confirmationCount: z.number(),
    confirmationStatus: ConfirmationStatus,
});

export const CreateConfirmationResponse = z.object({
    id: z.string().uuid(),
    confirmedAt: z.string().datetime(),
    newConfirmationCount: z.number(),
});

export const SyncResponse = z.object({
    descriptions: z.object({
        created: z.array(DescriptionResponse),
        updated: z.array(DescriptionResponse),
        deleted: z.array(z.string().uuid()),
    }),
    confirmationCounts: z.record(z.string().uuid(), z.number()),
    serverTime: z.string().datetime(),
});
```

---

## Sync Protocol

### Client-Generated UUIDs

Clients generate UUIDs for descriptions before syncing:

```typescript
import { v4 as uuidv4 } from 'uuid';

function createDescription(text: string, ...): SensationDescription {
    return {
        id: uuidv4(), // Client generates
        text,
        // ...
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
```

### Server Canonical Timestamps

The server assigns authoritative timestamps:

- `sharedAt` - Set by server when description first synced
- `lastConfirmedAt` - Updated by server on each confirmation
- `serverTime` - Returned in sync responses for client clock sync

### Delta Sync Protocol

Clients track their last successful sync and request only changes since then:

```typescript
interface SyncState {
    lastSyncAt: string | null; // ISO 8601 timestamp
    deviceId: string;
}

async function performDeltaSync(state: SyncState): Promise<SyncResponse> {
    const params = new URLSearchParams({
        deviceId: state.deviceId,
        ...(state.lastSyncAt && { since: state.lastSyncAt }),
    });

    const response = await fetch(`/api/v1/sync?${params}`);
    return SyncResponse.parse(await response.json());
}
```

### Conflict Resolution

| Conflict Type            | Resolution Strategy                       |
| ------------------------ | ----------------------------------------- |
| `confirmationCount`      | Server is authoritative (last-write-wins) |
| Duplicate description ID | Server rejects with 409 Conflict          |
| Stale update             | Server timestamp wins                     |
| Deleted description      | Tombstone for 90 days, then hard delete   |

```typescript
function mergeServerResponse(
    local: SharedDescription,
    server: DescriptionResponse
): SharedDescription {
    return {
        ...local,
        confirmationCount: server.confirmationCount, // Server authoritative
        confirmationStatus: server.confirmationStatus,
        lastConfirmedAt: server.lastConfirmedAt ? new Date(server.lastConfirmedAt) : undefined,
    };
}
```

### Background Sync via Service Worker

```typescript
// service-worker.ts
self.addEventListener('periodicsync', (event: PeriodicSyncEvent) => {
    if (event.tag === 'vocabulary-sync') {
        event.waitUntil(performBackgroundSync());
    }
});

async function performBackgroundSync(): Promise<void> {
    // 1. Process pending operations queue
    await processPendingOperations();

    // 2. Perform delta sync
    const syncState = await getSyncState();
    const response = await performDeltaSync(syncState);

    // 3. Merge server data into IndexedDB
    await mergeServerData(response);

    // 4. Update sync state
    await updateSyncState({ lastSyncAt: response.serverTime });
}
```

---

## Offline Support

### Operation Queue Structure

Pending operations are stored in IndexedDB until sync succeeds:

```typescript
export const PendingOperation = z.object({
    id: z.string().uuid(),
    type: z.enum(['share', 'confirm', 'unshare']),
    payload: z.unknown(), // Type depends on operation type
    createdAt: z.date(),
    retryCount: z.number().default(0),
    lastError: z.string().optional(),
    nextRetryAt: z.date().optional(),
});

export type PendingOperation = z.infer<typeof PendingOperation>;
```

### Queue Operations

```typescript
interface OperationQueue {
    // Add operation to queue
    enqueue(operation: Omit<PendingOperation, 'id' | 'createdAt' | 'retryCount'>): Promise<string>;

    // Get operations ready for processing
    getReady(): Promise<PendingOperation[]>;

    // Mark operation as completed
    complete(id: string): Promise<void>;

    // Mark operation as failed (with retry logic)
    fail(id: string, error: string): Promise<void>;

    // Get queue status
    getStatus(): Promise<{ pending: number; failed: number }>;
}
```

### Background Sync Worker

```typescript
async function processPendingOperations(): Promise<void> {
    const queue = await getOperationQueue();
    const operations = await queue.getReady();

    for (const op of operations) {
        try {
            switch (op.type) {
                case 'share':
                    await syncShareOperation(op.payload as CreateDescriptionRequest);
                    break;
                case 'confirm':
                    await syncConfirmOperation(op.payload as CreateConfirmationRequest);
                    break;
                case 'unshare':
                    await syncUnshareOperation(op.payload as { id: string });
                    break;
            }
            await queue.complete(op.id);
        } catch (error) {
            await queue.fail(op.id, error.message);
        }
    }
}
```

### Optimistic UI Updates

```typescript
async function shareDescription(description: SensationDescription): Promise<void> {
    // 1. Optimistic update - immediately show as shared locally
    await updateLocalDescription(description.id, {
        sharingLevel: 'anonymous',
        sharedAt: new Date(),
    });

    // 2. Queue for background sync
    await operationQueue.enqueue({
        type: 'share',
        payload: createSharePayload(description),
    });

    // 3. Trigger sync if online
    if (navigator.onLine) {
        await triggerBackgroundSync();
    }
}

async function rollbackShare(descriptionId: string): Promise<void> {
    await updateLocalDescription(descriptionId, {
        sharingLevel: 'private',
        sharedAt: undefined,
    });
    // Notify user of sync failure
    showNotification('Failed to share - will retry when online');
}
```

---

## Privacy & Anonymity

### No Accounts Required

Users can share vocabulary without creating an account:

```typescript
interface DeviceRegistration {
    deviceId: string; // UUID generated on first launch
    registeredAt: Date;
    // No email, no username, no password
}

function getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('inward_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('inward_device_id', deviceId);
    }
    return deviceId;
}
```

### Anonymous Sharing

When `sharingLevel: 'anonymous'`:

```typescript
function createSharePayload(description: SensationDescription): CreateDescriptionRequest {
    return {
        id: description.id,
        text: description.text,
        category: description.category,
        bodyRegion: description.bodyRegion,
        signalType: description.signalType,
        emotionConnection: description.emotionConnection,
        sharingLevel: 'anonymous',
        deviceId: getDeviceId(),
        // contributorId and contributorName are OMITTED
    };
}
```

### Confirmation Anonymity

Confirmations never reveal the confirmer's identity:

```typescript
// Stored on server
interface ServerConfirmation {
    id: string;
    descriptionId: string;
    deviceId: string; // Hashed before storage
    confirmedAt: Date;
    // No user identity stored
}

// What other users see
interface PublicConfirmationData {
    count: number; // Just the aggregate count
    // No list of who confirmed
}
```

### Server Data Minimization

| Data Point            | Stored                   | Retention              |
| --------------------- | ------------------------ | ---------------------- |
| IP Address            | Hashed for rate limiting | 24 hours               |
| Device ID             | Hashed                   | Until deletion request |
| User Agent            | No                       | -                      |
| Confirmation identity | No                       | -                      |
| Request logs          | Anonymized               | 7 days                 |

### GDPR Compliance

```typescript
// Data export endpoint
GET /api/v1/user/export?deviceId=uuid

// Returns all data associated with device
{
    "descriptions": [...],
    "confirmations": [...], // Only this device's confirmations
    "exportedAt": "2026-02-01T12:00:00Z"
}

// Data deletion endpoint
DELETE /api/v1/user?deviceId=uuid

// Response
{
    "deleted": {
        "descriptions": 5,
        "confirmations": 12
    },
    "deletedAt": "2026-02-01T12:00:00Z"
}
```

---

## Security

### Rate Limiting

| Operation           | Limit | Window   |
| ------------------- | ----- | -------- |
| Share description   | 100   | 24 hours |
| Confirm description | 500   | 24 hours |
| Discovery queries   | 1000  | 1 hour   |
| Sync requests       | 60    | 1 minute |

```typescript
// Rate limit response
{
    "error": "rate_limit_exceeded",
    "retryAfter": 3600, // seconds
    "limit": 100,
    "remaining": 0
}
```

### Payload Validation

All payloads validated on both client and server using Zod schemas:

```typescript
// Server-side validation
app.post('/api/v1/descriptions', async (req, res) => {
    const result = CreateDescriptionRequest.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: 'validation_failed',
            details: result.error.issues,
        });
    }
    // Process valid request
});
```

### Content Moderation

```typescript
interface ContentFlag {
    id: string;
    descriptionId: string;
    reason: 'inappropriate' | 'spam' | 'harassment' | 'other';
    reportedAt: Date;
}

// Automatic actions
const MODERATION_THRESHOLDS = {
    autoHide: 3, // Hide after 3 flags
    autoDelete: 10, // Delete after 10 flags
};
```

### Spam Prevention

- Captcha required after exceeding soft limits
- Duplicate content detection (fuzzy matching)
- Burst detection (too many operations too fast)

```typescript
interface SpamCheck {
    isDuplicate: boolean;
    isBurst: boolean;
    requiresCaptcha: boolean;
}
```

### Transport Security

- HTTPS only (HTTP redirects to HTTPS)
- TLS 1.3 minimum
- HSTS enabled with 1-year max-age
- Certificate pinning recommended for mobile apps

---

## Data Retention

### Retention Policies

| Data Type                  | Retention Period | Condition                          |
| -------------------------- | ---------------- | ---------------------------------- |
| Descriptions (confirmed)   | Indefinite       | At least 1 confirmation            |
| Descriptions (unconfirmed) | 90 days          | Zero confirmations                 |
| Confirmations (individual) | 30 days          | Aggregated into count, then pruned |
| Sync metadata              | 7 days           | Used for delta sync                |
| Rate limit data            | 24 hours         | Rolling window                     |
| Flagged content            | Until reviewed   | Manual moderation queue            |

### Pruning Process

```sql
-- Daily cleanup job
DELETE FROM descriptions
WHERE confirmation_count = 0
AND shared_at < NOW() - INTERVAL '90 days';

DELETE FROM confirmations
WHERE confirmed_at < NOW() - INTERVAL '30 days';

DELETE FROM sync_metadata
WHERE created_at < NOW() - INTERVAL '7 days';
```

---

## TypeScript Types

### Sync-Specific Types

```typescript
import { z } from 'zod';

// Sync request/response
export const SyncRequest = z.object({
    since: z.string().datetime().optional(),
    deviceId: z.string().uuid(),
});
export type SyncRequest = z.infer<typeof SyncRequest>;

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

// Pending operation for offline queue
export const PendingOperation = z.object({
    id: z.string().uuid(),
    type: z.enum(['share', 'confirm', 'unshare']),
    payload: z.unknown(),
    createdAt: z.date(),
    retryCount: z.number().default(0),
    lastError: z.string().optional(),
    nextRetryAt: z.date().optional(),
});
export type PendingOperation = z.infer<typeof PendingOperation>;

// Device registration
export const DeviceRegistration = z.object({
    deviceId: z.string().uuid(),
    registeredAt: z.date(),
    lastSyncAt: z.date().optional(),
});
export type DeviceRegistration = z.infer<typeof DeviceRegistration>;

// Wire format for descriptions (API payloads)
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

// Wire format for confirmations
export const ConfirmationPayload = z.object({
    descriptionId: z.string().uuid(),
    deviceId: z.string().uuid(),
    bodyRegion: BodyRegion.optional(),
    note: z.string().max(100).optional(),
});
export type ConfirmationPayload = z.infer<typeof ConfirmationPayload>;

// Sync status for UI display
export const SyncStatus = z.object({
    lastSyncAt: z.date().optional(),
    pendingOperations: z.number(),
    failedOperations: z.number(),
    isOnline: z.boolean(),
    isSyncing: z.boolean(),
});
export type SyncStatus = z.infer<typeof SyncStatus>;
```

---

## IndexedDB Schema Updates

### New Stores

Add to existing `VocabularyDatabase`:

```typescript
interface VocabularyDatabase {
    // ... existing stores from SENSATION-VOCABULARY.md ...

    // NEW: Pending operations queue for offline support
    pendingOperations: {
        key: string; // operation.id
        value: PendingOperation;
        indexes: {
            'by-type': 'share' | 'confirm' | 'unshare';
            'by-created': Date;
            'by-next-retry': Date;
        };
    };

    // NEW: Sync metadata
    syncMetadata: {
        key: 'current';
        value: {
            deviceId: string;
            lastSyncAt: Date | null;
            registeredAt: Date;
        };
    };
}
```

### Index Updates for Sync

Add to existing stores for efficient sync queries:

```typescript
// Add to sharedDescriptions store
sharedDescriptions: {
    // ... existing indexes ...
    indexes: {
        // ... existing indexes ...
        'by-shared-at': Date;        // NEW: For delta sync
        'by-updated-at': Date;       // NEW: For change tracking
    };
};
```

### Database Version Migration

```typescript
const DB_VERSION = 2; // Increment from 1

function upgradeDB(db: IDBDatabase, oldVersion: number): void {
    if (oldVersion < 2) {
        // Add pendingOperations store
        const pendingOps = db.createObjectStore('pendingOperations', { keyPath: 'id' });
        pendingOps.createIndex('by-type', 'type');
        pendingOps.createIndex('by-created', 'createdAt');
        pendingOps.createIndex('by-next-retry', 'nextRetryAt');

        // Add syncMetadata store
        db.createObjectStore('syncMetadata', { keyPath: 'key' });

        // Add new indexes to existing stores
        const sharedDesc = db
            .transaction('sharedDescriptions', 'readwrite')
            .objectStore('sharedDescriptions');
        sharedDesc.createIndex('by-shared-at', 'sharedAt');
        sharedDesc.createIndex('by-updated-at', 'updatedAt');
    }
}
```

---

## Store Interface Updates

### Extended VocabularyStore

```typescript
interface VocabularyStore {
    // ... existing methods from SENSATION-VOCABULARY.md ...

    // NEW: Sync operations
    sync(): Promise<SyncResult>;
    getSyncStatus(): SyncStatus;

    // NEW: Registration
    getDeviceId(): string;
    registerDevice(): Promise<void>;

    // NEW: Data export/deletion (GDPR)
    exportData(): Promise<ExportData>;
    deleteAllData(): Promise<void>;
}

interface SyncResult {
    success: boolean;
    created: number;
    updated: number;
    deleted: number;
    errors: SyncError[];
}

interface SyncError {
    operationId: string;
    type: 'share' | 'confirm' | 'unshare';
    error: string;
}

interface ExportData {
    descriptions: SensationDescription[];
    sharedDescriptions: SharedDescription[];
    confirmations: VocabularyConfirmation[];
    exportedAt: Date;
}
```

### Sync Status Store

```typescript
import { writable, derived } from 'svelte/store';

interface SyncState {
    lastSyncAt: Date | null;
    pendingCount: number;
    failedCount: number;
    isOnline: boolean;
    isSyncing: boolean;
}

export const syncState = writable<SyncState>({
    lastSyncAt: null,
    pendingCount: 0,
    failedCount: 0,
    isOnline: navigator.onLine,
    isSyncing: false,
});

// Derived store for UI display
export const syncStatusText = derived(syncState, $state => {
    if ($state.isSyncing) return 'Syncing...';
    if (!$state.isOnline) return 'Offline';
    if ($state.pendingCount > 0) return `${$state.pendingCount} pending`;
    if ($state.failedCount > 0) return `${$state.failedCount} failed`;
    if ($state.lastSyncAt) {
        const ago = Date.now() - $state.lastSyncAt.getTime();
        if (ago < 60000) return 'Just synced';
        return `Synced ${formatTimeAgo($state.lastSyncAt)}`;
    }
    return 'Not synced';
});
```

### Background Sync Registration

```typescript
async function registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;

        // Request permission for periodic background sync
        const status = await navigator.permissions.query({
            name: 'periodic-background-sync' as PermissionName,
        });

        if (status.state === 'granted') {
            await registration.periodicSync.register('vocabulary-sync', {
                minInterval: 60 * 60 * 1000, // 1 hour minimum
            });
        }
    }
}

// Fallback: sync on visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
        vocabularyStore.sync();
    }
});

// Fallback: sync on online event
window.addEventListener('online', () => {
    vocabularyStore.sync();
});
```

---

## Server Implementation Notes

### Recommended Stack

| Component     | Recommendation                        | Rationale                          |
| ------------- | ------------------------------------- | ---------------------------------- |
| **Runtime**   | Cloudflare Workers / Deno Deploy      | Edge deployment, low latency       |
| **Database**  | D1 (Cloudflare) / Turso / PlanetScale | SQLite-compatible, edge-replicated |
| **Framework** | Hono / Elysia                         | Lightweight, TypeScript-native     |

### Cost Estimation

| Tier   | Users    | Requests/month | Estimated Cost |
| ------ | -------- | -------------- | -------------- |
| Free   | <1,000   | <1M            | $0             |
| Growth | <10,000  | <10M           | ~$20/month     |
| Scale  | <100,000 | <100M          | ~$200/month    |

### Database Schema (SQL)

```sql
CREATE TABLE descriptions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    body_region TEXT NOT NULL,
    signal_type TEXT,
    emotion_connection TEXT,
    sharing_level TEXT NOT NULL,
    device_id_hash TEXT NOT NULL,
    contributor_name TEXT,
    confirmation_count INTEGER DEFAULT 0,
    confirmation_status TEXT DEFAULT 'unconfirmed',
    shared_at TEXT NOT NULL,
    last_confirmed_at TEXT,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE confirmations (
    id TEXT PRIMARY KEY,
    description_id TEXT NOT NULL REFERENCES descriptions(id),
    device_id_hash TEXT NOT NULL,
    body_region TEXT,
    note TEXT,
    confirmed_at TEXT NOT NULL,
    UNIQUE(description_id, device_id_hash)
);

CREATE TABLE rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0,
    window_start TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_descriptions_body_region ON descriptions(body_region);
CREATE INDEX idx_descriptions_shared_at ON descriptions(shared_at);
CREATE INDEX idx_descriptions_updated_at ON descriptions(updated_at);
CREATE INDEX idx_confirmations_description ON confirmations(description_id);
```

### No Server Code in This Spec

This specification defines the protocol only. Server implementation is a separate project that will implement this API specification.

---

## Error Handling

### Network Errors

```typescript
async function syncWithRetry(maxRetries = 5): Promise<void> {
    let retryCount = 0;
    let delay = 1000; // Start with 1 second

    while (retryCount < maxRetries) {
        try {
            await performSync();
            return;
        } catch (error) {
            if (!isRetryableError(error)) {
                throw error;
            }
            retryCount++;
            await sleep(delay);
            delay = Math.min(delay * 2, 30000); // Exponential backoff, max 30s
        }
    }
    throw new Error('Sync failed after max retries');
}

function isRetryableError(error: unknown): boolean {
    if (error instanceof TypeError) return true; // Network error
    if (error instanceof Response) {
        return error.status >= 500 || error.status === 429;
    }
    return false;
}
```

### Validation Errors

```typescript
interface ValidationError {
    error: 'validation_failed';
    details: Array<{
        path: string[];
        message: string;
    }>;
}

async function handleShareError(error: ValidationError): Promise<void> {
    // Remove from queue - won't succeed on retry
    await operationQueue.remove(operationId);

    // Notify user
    showError(`Could not share: ${error.details[0].message}`);

    // Rollback optimistic update
    await rollbackShare(descriptionId);
}
```

### Conflict Errors

```typescript
interface ConflictError {
    error: 'conflict';
    serverValue: unknown;
}

async function handleConflict(error: ConflictError, local: SharedDescription): Promise<void> {
    // Server wins - merge server value
    const merged = mergeServerResponse(local, error.serverValue as DescriptionResponse);
    await updateLocalDescription(merged);

    // Remove conflicting operation from queue
    await operationQueue.remove(operationId);
}
```

### Rate Limit Errors

```typescript
interface RateLimitError {
    error: 'rate_limit_exceeded';
    retryAfter: number; // seconds
}

async function handleRateLimit(error: RateLimitError, operation: PendingOperation): Promise<void> {
    // Schedule retry after cooldown
    const nextRetryAt = new Date(Date.now() + error.retryAfter * 1000);
    await operationQueue.update(operation.id, { nextRetryAt });

    // Notify user if interactive
    showWarning(`Rate limited. Will retry in ${formatDuration(error.retryAfter)}`);
}
```

---

## Sequence Diagrams

### Share Flow

```
┌──────────┐          ┌───────────────┐          ┌──────────────┐
│  User A  │          │  IndexedDB    │          │    Server    │
└────┬─────┘          └───────┬───────┘          └──────┬───────┘
     │                        │                         │
     │ 1. Share description   │                         │
     │───────────────────────>│                         │
     │                        │                         │
     │ 2. Save locally        │                         │
     │                        │ (sharingLevel=anonymous) │
     │                        │                         │
     │ 3. Queue operation     │                         │
     │                        │ (pendingOperations)      │
     │                        │                         │
     │ 4. Show "Shared" UI    │                         │
     │<───────────────────────│                         │
     │                        │                         │
     │                        │ 5. Background sync      │
     │                        │────────────────────────>│
     │                        │                         │
     │                        │ 6. Confirm receipt      │
     │                        │<────────────────────────│
     │                        │                         │
     │                        │ 7. Remove from queue    │
     │                        │                         │
     │ 8. Show "Synced" UI    │                         │
     │<───────────────────────│                         │
     │                        │                         │
```

### Discover Flow

```
┌──────────┐          ┌───────────────┐          ┌──────────────┐
│  User B  │          │  IndexedDB    │          │    Server    │
└────┬─────┘          └───────┬───────┘          └──────┬───────┘
     │                        │                         │
     │ 1. Search "butterflies"│                         │
     │───────────────────────>│                         │
     │                        │                         │
     │ 2. Check local cache   │                         │
     │<───────────────────────│                         │
     │                        │                         │
     │ 3. Query server        │                         │
     │─────────────────────────────────────────────────>│
     │                        │                         │
     │ 4. Return results      │                         │
     │<─────────────────────────────────────────────────│
     │                        │                         │
     │ 5. Cache results       │                         │
     │───────────────────────>│                         │
     │                        │ (sharedDescriptions)    │
     │                        │                         │
     │ 6. Display results     │                         │
     │<───────────────────────│                         │
     │                        │                         │
```

### Confirm Flow

```
┌──────────┐          ┌───────────────┐          ┌──────────────┐          ┌──────────┐
│  User B  │          │  IndexedDB B  │          │    Server    │          │  User A  │
└────┬─────┘          └───────┬───────┘          └──────┬───────┘          └────┬─────┘
     │                        │                         │                       │
     │ 1. Tap "Me too"        │                         │                       │
     │───────────────────────>│                         │                       │
     │                        │                         │                       │
     │ 2. Save confirmation   │                         │                       │
     │                        │ (confirmations store)    │                       │
     │                        │                         │                       │
     │ 3. Queue operation     │                         │                       │
     │                        │ (pendingOperations)      │                       │
     │                        │                         │                       │
     │ 4. Update count locally│                         │                       │
     │<───────────────────────│                         │                       │
     │                        │                         │                       │
     │                        │ 5. Sync confirmation    │                       │
     │                        │────────────────────────>│                       │
     │                        │                         │                       │
     │                        │ 6. Increment count      │                       │
     │                        │                         │ 7. Propagate on sync  │
     │                        │                         │──────────────────────>│
     │                        │                         │                       │
     │                        │ 8. Return new count     │                       │
     │                        │<────────────────────────│                       │
     │                        │                         │                       │
```

### Offline → Online Flow

```
┌──────────┐          ┌───────────────┐          ┌──────────────┐
│   User   │          │  IndexedDB    │          │    Server    │
└────┬─────┘          └───────┬───────┘          └──────┬───────┘
     │                        │                         │
     │ [OFFLINE]              │                         │
     │                        │                         │
     │ 1. Share description   │                         │
     │───────────────────────>│                         │
     │                        │                         │
     │ 2. Save + queue        │                         │
     │<───────────────────────│                         │
     │                        │                         │
     │ 3. Confirm another     │                         │
     │───────────────────────>│                         │
     │                        │                         │
     │ 4. Save + queue        │                         │
     │<───────────────────────│                         │
     │                        │                         │
     │ [COMES ONLINE]         │                         │
     │                        │                         │
     │                        │ 5. Process queue        │
     │                        │────────────────────────>│
     │                        │                         │
     │                        │ 6. Delta sync           │
     │                        │────────────────────────>│
     │                        │                         │
     │                        │ 7. Return changes       │
     │                        │<────────────────────────│
     │                        │                         │
     │                        │ 8. Merge + clear queue  │
     │                        │                         │
     │ 9. Update UI           │                         │
     │<───────────────────────│                         │
     │                        │                         │
```

---

## Related Specifications

- [Sensation Vocabulary](./SENSATION-VOCABULARY.md) - Vocabulary types and P2P sharing model
- [Exercise System](./EXERCISE-SYSTEM.md) - Exercise definitions and sessions
- [Interoception Research](./INTEROCEPTION-RESEARCH.md) - Scientific foundation

---

_Last updated: February 2026_
