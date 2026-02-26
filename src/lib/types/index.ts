/**
 * Type exports for Inward.
 */

// Domain types
export {
    // Body & Signal
    BodyRegion,
    SignalType,
    // Vocabulary
    VocabularyCategory,
    SharingLevel,
    ConfirmationStatus,
    SensationDescription,
    SharedDescription,
    VocabularyConfirmation,
    UserVocabularyProfile,
} from './domain';

export type {
    BodyRegion as BodyRegionType,
    SignalType as SignalTypeType,
    VocabularyCategory as VocabularyCategoryType,
    SharingLevel as SharingLevelType,
    ConfirmationStatus as ConfirmationStatusType,
} from './domain';

// Sync types
export {
    // API Requests
    CreateDescriptionRequest,
    CreateConfirmationRequest,
    DiscoveryQueryParams,
    SyncQueryParams,
    // API Responses
    DescriptionResponse,
    DiscoveryResponse,
    CreateDescriptionResponse,
    CreateConfirmationResponse,
    SyncResponse,
    // Offline Queue
    OperationType,
    PendingOperation,
    // Device & Metadata
    DeviceRegistration,
    SyncMetadata,
    // Wire Formats
    DescriptionPayload,
    ConfirmationPayload,
    // Status
    SyncStatus,
    SyncResult,
    // Errors
    ApiError,
    ValidationError,
    RateLimitError,
    ConflictError,
} from './sync';
