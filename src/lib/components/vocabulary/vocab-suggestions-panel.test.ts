import { describe, it, expect } from 'vitest';
import {
    getContextualSuggestions,
    descriptionFromShared,
    MAX_SUGGESTIONS,
} from './vocab-suggestions-panel';
import type { SharedDescription, SensationDescription } from '$lib/types/domain';

// =============================================================================
// Fixtures
// =============================================================================

function makeShared(overrides: Partial<SharedDescription> = {}): SharedDescription {
    return {
        id: crypto.randomUUID(),
        text: 'pounding',
        category: 'physical',
        bodyRegion: 'heart',
        sharingLevel: 'anonymous',
        confirmationCount: 0,
        confirmationStatus: 'unconfirmed',
        sharedAt: new Date('2026-01-01T00:00:00Z'),
        ...overrides,
    };
}

function makePersonal(overrides: Partial<SensationDescription> = {}): SensationDescription {
    const now = new Date('2026-01-01T00:00:00Z');
    return {
        id: crypto.randomUUID(),
        text: 'tight',
        category: 'physical',
        bodyRegion: 'chest',
        createdAt: now,
        updatedAt: now,
        sharingLevel: 'private',
        ...overrides,
    };
}

// =============================================================================
// getContextualSuggestions
// =============================================================================

describe('getContextualSuggestions', () => {
    it('returns empty array when allShared is empty', () => {
        const result = getContextualSuggestions(['heart'], [], []);
        expect(result).toHaveLength(0);
    });

    it('filters to only items matching the given body regions', () => {
        const heartItem = makeShared({ bodyRegion: 'heart', text: 'pounding' });
        const stomachItem = makeShared({ bodyRegion: 'stomach', text: 'churning' });
        const result = getContextualSuggestions(['heart'], [heartItem, stomachItem], []);
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe('pounding');
    });

    it('accepts multiple body regions', () => {
        const heartItem = makeShared({ bodyRegion: 'heart', text: 'pounding' });
        const stomachItem = makeShared({ bodyRegion: 'stomach', text: 'churning' });
        const chestItem = makeShared({ bodyRegion: 'chest', text: 'heavy' });
        const result = getContextualSuggestions(
            ['heart', 'stomach'],
            [heartItem, stomachItem, chestItem],
            []
        );
        expect(result).toHaveLength(2);
    });

    it('excludes items whose text is already in personal vocabulary (case-insensitive)', () => {
        const shared = makeShared({ bodyRegion: 'heart', text: 'Pounding' });
        const personal = makePersonal({ text: 'pounding', bodyRegion: 'heart' });
        const result = getContextualSuggestions(['heart'], [shared], [personal]);
        expect(result).toHaveLength(0);
    });

    it('excludes owned items with different casing', () => {
        const shared = makeShared({ bodyRegion: 'heart', text: 'RACING' });
        const personal = makePersonal({ text: 'racing', bodyRegion: 'heart' });
        const result = getContextualSuggestions(['heart'], [shared], [personal]);
        expect(result).toHaveLength(0);
    });

    it('sorts by confirmationCount descending', () => {
        const low = makeShared({ bodyRegion: 'heart', text: 'low', confirmationCount: 1 });
        const high = makeShared({ bodyRegion: 'heart', text: 'high', confirmationCount: 10 });
        const mid = makeShared({ bodyRegion: 'heart', text: 'mid', confirmationCount: 5 });
        const result = getContextualSuggestions(['heart'], [low, high, mid], []);
        expect(result[0].text).toBe('high');
        expect(result[1].text).toBe('mid');
        expect(result[2].text).toBe('low');
    });

    it(`limits results to MAX_SUGGESTIONS (${MAX_SUGGESTIONS})`, () => {
        const items = Array.from({ length: 10 }, (_, i) =>
            makeShared({ id: crypto.randomUUID(), bodyRegion: 'heart', text: `word-${i}` })
        );
        const result = getContextualSuggestions(['heart'], items, []);
        expect(result).toHaveLength(MAX_SUGGESTIONS);
    });

    it('returns empty array when bodyRegions is empty', () => {
        const item = makeShared({ bodyRegion: 'heart' });
        const result = getContextualSuggestions([], [item], []);
        expect(result).toHaveLength(0);
    });
});

// =============================================================================
// descriptionFromShared
// =============================================================================

describe('descriptionFromShared', () => {
    const exerciseId = '550e8400-e29b-41d4-a716-446655440001';
    const sessionId = '550e8400-e29b-41d4-a716-446655440002';

    it('copies text, category, and bodyRegion from the shared description', () => {
        const shared = makeShared({
            text: 'flutter',
            category: 'metaphorical',
            bodyRegion: 'stomach',
        });
        const desc = descriptionFromShared(shared, exerciseId, sessionId);
        expect(desc.text).toBe('flutter');
        expect(desc.category).toBe('metaphorical');
        expect(desc.bodyRegion).toBe('stomach');
    });

    it('copies optional signalType when present', () => {
        const shared = makeShared({ signalType: 'cardiac' });
        const desc = descriptionFromShared(shared, exerciseId, sessionId);
        expect(desc.signalType).toBe('cardiac');
    });

    it('leaves signalType undefined when absent', () => {
        const shared = makeShared();
        const desc = descriptionFromShared(shared, exerciseId, sessionId);
        expect(desc.signalType).toBeUndefined();
    });

    it('copies optional emotionConnection when present', () => {
        const shared = makeShared({ emotionConnection: 'anxious' });
        const desc = descriptionFromShared(shared, exerciseId, sessionId);
        expect(desc.emotionConnection).toBe('anxious');
    });

    it('sets exerciseId and sessionId from arguments', () => {
        const shared = makeShared();
        const desc = descriptionFromShared(shared, exerciseId, sessionId);
        expect(desc.exerciseId).toBe(exerciseId);
        expect(desc.sessionId).toBe(sessionId);
    });

    it('sets sharingLevel to private', () => {
        const shared = makeShared({ sharingLevel: 'attributed' });
        const desc = descriptionFromShared(shared, exerciseId, sessionId);
        expect(desc.sharingLevel).toBe('private');
    });

    it('generates a unique UUID for id', () => {
        const shared = makeShared();
        const desc1 = descriptionFromShared(shared, exerciseId, sessionId);
        const desc2 = descriptionFromShared(shared, exerciseId, sessionId);
        expect(desc1.id).not.toBe(desc2.id);
    });

    it('sets createdAt and updatedAt to the same value', () => {
        const shared = makeShared();
        const desc = descriptionFromShared(shared, exerciseId, sessionId);
        expect(desc.createdAt.getTime()).toBe(desc.updatedAt.getTime());
    });
});
