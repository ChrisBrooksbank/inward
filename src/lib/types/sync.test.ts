import { describe, it, expect } from 'vitest';
import {
    BodyRegion,
    SignalType,
    VocabularyCategory,
    SharingLevel,
    ConfirmationStatus,
    SensationDescription,
    SharedDescription,
} from './domain';
import {
    CreateDescriptionRequest,
    CreateConfirmationRequest,
    DescriptionResponse,
    SyncResponse,
    PendingOperation,
    SyncStatus,
} from './sync';

describe('Domain Types', () => {
    describe('BodyRegion', () => {
        it('should validate valid body regions', () => {
            expect(BodyRegion.parse('heart')).toBe('heart');
            expect(BodyRegion.parse('stomach')).toBe('stomach');
            expect(BodyRegion.parse('forehead')).toBe('forehead');
        });

        it('should reject invalid body regions', () => {
            expect(() => BodyRegion.parse('invalid')).toThrow();
        });
    });

    describe('SignalType', () => {
        it('should validate valid signal types', () => {
            expect(SignalType.parse('cardiac')).toBe('cardiac');
            expect(SignalType.parse('respiratory')).toBe('respiratory');
        });

        it('should reject invalid signal types', () => {
            expect(() => SignalType.parse('invalid')).toThrow();
        });
    });

    describe('VocabularyCategory', () => {
        it('should validate valid categories', () => {
            expect(VocabularyCategory.parse('physical')).toBe('physical');
            expect(VocabularyCategory.parse('metaphorical')).toBe('metaphorical');
        });
    });

    describe('SharingLevel', () => {
        it('should validate sharing levels', () => {
            expect(SharingLevel.parse('private')).toBe('private');
            expect(SharingLevel.parse('anonymous')).toBe('anonymous');
            expect(SharingLevel.parse('attributed')).toBe('attributed');
        });
    });

    describe('ConfirmationStatus', () => {
        it('should validate confirmation statuses', () => {
            expect(ConfirmationStatus.parse('unconfirmed')).toBe('unconfirmed');
            expect(ConfirmationStatus.parse('confirmed')).toBe('confirmed');
            expect(ConfirmationStatus.parse('popular')).toBe('popular');
        });
    });

    describe('SensationDescription', () => {
        it('should validate a complete sensation description', () => {
            const description = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                text: 'butterflies',
                category: 'metaphorical',
                bodyRegion: 'stomach',
                signalType: 'gastric',
                emotionConnection: 'anxiety',
                createdAt: new Date(),
                updatedAt: new Date(),
                sharingLevel: 'private',
            };

            const result = SensationDescription.parse(description);
            expect(result.text).toBe('butterflies');
            expect(result.bodyRegion).toBe('stomach');
        });

        it('should reject text exceeding max length', () => {
            const description = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                text: 'a'.repeat(201),
                category: 'physical',
                bodyRegion: 'heart',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            expect(() => SensationDescription.parse(description)).toThrow();
        });
    });

    describe('SharedDescription', () => {
        it('should validate a shared description with defaults', () => {
            const shared = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                text: 'pounding',
                category: 'physical',
                bodyRegion: 'heart',
                sharingLevel: 'anonymous',
                sharedAt: new Date(),
            };

            const result = SharedDescription.parse(shared);
            expect(result.confirmationCount).toBe(0);
            expect(result.confirmationStatus).toBe('unconfirmed');
        });
    });
});

describe('Sync Types', () => {
    describe('CreateDescriptionRequest', () => {
        it('should validate a valid request', () => {
            const request = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                text: 'fluttering',
                category: 'physical',
                bodyRegion: 'heart',
                sharingLevel: 'anonymous',
                deviceId: '550e8400-e29b-41d4-a716-446655440001',
            };

            const result = CreateDescriptionRequest.parse(request);
            expect(result.text).toBe('fluttering');
        });

        it('should reject private sharing level', () => {
            const request = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                text: 'fluttering',
                category: 'physical',
                bodyRegion: 'heart',
                sharingLevel: 'private',
                deviceId: '550e8400-e29b-41d4-a716-446655440001',
            };

            expect(() => CreateDescriptionRequest.parse(request)).toThrow();
        });
    });

    describe('CreateConfirmationRequest', () => {
        it('should validate a valid confirmation request', () => {
            const request = {
                descriptionId: '550e8400-e29b-41d4-a716-446655440000',
                deviceId: '550e8400-e29b-41d4-a716-446655440001',
            };

            const result = CreateConfirmationRequest.parse(request);
            expect(result.descriptionId).toBe('550e8400-e29b-41d4-a716-446655440000');
        });

        it('should accept optional fields', () => {
            const request = {
                descriptionId: '550e8400-e29b-41d4-a716-446655440000',
                deviceId: '550e8400-e29b-41d4-a716-446655440001',
                bodyRegion: 'stomach',
                note: 'exactly how it feels',
            };

            const result = CreateConfirmationRequest.parse(request);
            expect(result.bodyRegion).toBe('stomach');
            expect(result.note).toBe('exactly how it feels');
        });
    });

    describe('DescriptionResponse', () => {
        it('should validate a server response', () => {
            const response = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                text: 'butterflies',
                category: 'metaphorical',
                bodyRegion: 'stomach',
                sharingLevel: 'anonymous',
                confirmationCount: 42,
                confirmationStatus: 'popular',
                sharedAt: '2026-02-01T12:00:00Z',
            };

            const result = DescriptionResponse.parse(response);
            expect(result.confirmationCount).toBe(42);
        });
    });

    describe('SyncResponse', () => {
        it('should validate a sync response', () => {
            const response = {
                descriptions: {
                    created: [],
                    updated: [],
                    deleted: [],
                },
                confirmationCounts: {},
                serverTime: '2026-02-01T12:00:00Z',
            };

            const result = SyncResponse.parse(response);
            expect(result.serverTime).toBe('2026-02-01T12:00:00Z');
        });
    });

    describe('PendingOperation', () => {
        it('should validate a pending operation', () => {
            const operation = {
                id: '550e8400-e29b-41d4-a716-446655440000',
                type: 'share',
                payload: { text: 'test' },
                createdAt: new Date(),
            };

            const result = PendingOperation.parse(operation);
            expect(result.type).toBe('share');
            expect(result.retryCount).toBe(0);
        });
    });

    describe('SyncStatus', () => {
        it('should validate sync status', () => {
            const status = {
                pendingOperations: 5,
                failedOperations: 1,
                isOnline: true,
                isSyncing: false,
            };

            const result = SyncStatus.parse(status);
            expect(result.pendingOperations).toBe(5);
        });
    });
});
