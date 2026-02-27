import { describe, it, expect } from 'vitest';
import { groupSharedByBodyRegion, filterSharedByRegion } from './sharedVocabulary';
import type { SharedDescription } from '$lib/types/domain';

function makeShared(
    id: string,
    bodyRegion: SharedDescription['bodyRegion'],
    confirmationCount = 0,
    text = 'pounding'
): SharedDescription {
    return {
        id,
        text,
        category: 'physical',
        bodyRegion,
        sharingLevel: 'anonymous',
        confirmationCount,
        confirmationStatus: confirmationCount === 0 ? 'unconfirmed' : 'confirmed',
        sharedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
}

describe('groupSharedByBodyRegion', () => {
    it('returns empty array for empty input', () => {
        expect(groupSharedByBodyRegion([])).toEqual([]);
    });

    it('groups descriptions by region', () => {
        const items = [
            makeShared('1', 'heart'),
            makeShared('2', 'heart'),
            makeShared('3', 'stomach'),
        ];
        const groups = groupSharedByBodyRegion(items);
        expect(groups).toHaveLength(2);
        expect(groups[0].region).toBe('heart');
        expect(groups[0].items).toHaveLength(2);
        expect(groups[1].region).toBe('stomach');
    });

    it('preserves canonical BodyRegion order', () => {
        const items = [makeShared('1', 'stomach'), makeShared('2', 'heart')];
        const groups = groupSharedByBodyRegion(items);
        expect(groups[0].region).toBe('heart');
        expect(groups[1].region).toBe('stomach');
    });

    it('sorts items within each group by confirmationCount descending', () => {
        const items = [
            makeShared('1', 'heart', 2),
            makeShared('2', 'heart', 5),
            makeShared('3', 'heart', 0),
        ];
        const groups = groupSharedByBodyRegion(items);
        expect(groups[0].items[0].confirmationCount).toBe(5);
        expect(groups[0].items[1].confirmationCount).toBe(2);
        expect(groups[0].items[2].confirmationCount).toBe(0);
    });

    it('does not mutate the original array', () => {
        const items = [makeShared('1', 'heart', 1), makeShared('2', 'heart', 3)];
        const original = [...items];
        groupSharedByBodyRegion(items);
        expect(items[0].id).toBe(original[0].id);
    });

    it('only includes regions with at least one item', () => {
        const items = [makeShared('1', 'jaw', 1)];
        const groups = groupSharedByBodyRegion(items);
        expect(groups).toHaveLength(1);
        expect(groups[0].region).toBe('jaw');
    });
});

describe('filterSharedByRegion', () => {
    const items = [makeShared('1', 'heart'), makeShared('2', 'stomach'), makeShared('3', 'heart')];

    it('returns all items when region is null', () => {
        expect(filterSharedByRegion(items, null)).toHaveLength(3);
    });

    it('filters to matching region only', () => {
        const result = filterSharedByRegion(items, 'heart');
        expect(result).toHaveLength(2);
        expect(result.every(d => d.bodyRegion === 'heart')).toBe(true);
    });

    it('returns empty array when no items match', () => {
        expect(filterSharedByRegion(items, 'lungs')).toHaveLength(0);
    });
});
