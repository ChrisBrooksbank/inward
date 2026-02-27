import { describe, it, expect } from 'vitest';
import { groupByBodyRegion, formatLabel, formatDate, filterDescriptions } from './vocabularyList';
import type { SensationDescription } from '$lib/types/domain';

function makeDesc(
    id: string,
    bodyRegion: SensationDescription['bodyRegion'],
    text = 'tight'
): SensationDescription {
    return {
        id,
        text,
        category: 'physical',
        bodyRegion,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        sharingLevel: 'private',
    };
}

describe('groupByBodyRegion', () => {
    it('returns empty array for empty input', () => {
        expect(groupByBodyRegion([])).toEqual([]);
    });

    it('groups descriptions by region', () => {
        const items = [
            makeDesc('1', 'heart', 'pounding'),
            makeDesc('2', 'heart', 'racing'),
            makeDesc('3', 'stomach', 'hollow'),
        ];
        const groups = groupByBodyRegion(items);
        expect(groups).toHaveLength(2);
        expect(groups[0].region).toBe('heart');
        expect(groups[0].items).toHaveLength(2);
        expect(groups[1].region).toBe('stomach');
        expect(groups[1].items).toHaveLength(1);
    });

    it('preserves canonical BodyRegion order', () => {
        // stomach comes before heart in canonical order? Let's check:
        // BodyRegion order: heart, stomach, lungs, throat, hands, ...
        const items = [makeDesc('1', 'stomach', 'hollow'), makeDesc('2', 'heart', 'pounding')];
        const groups = groupByBodyRegion(items);
        expect(groups[0].region).toBe('heart');
        expect(groups[1].region).toBe('stomach');
    });

    it('only includes regions with items', () => {
        const items = [makeDesc('1', 'jaw', 'clenched')];
        const groups = groupByBodyRegion(items);
        expect(groups).toHaveLength(1);
        expect(groups[0].region).toBe('jaw');
    });
});

describe('formatLabel', () => {
    it('capitalises a single word', () => {
        expect(formatLabel('heart')).toBe('Heart');
    });

    it('capitalises hyphenated words', () => {
        expect(formatLabel('body-scan')).toBe('Body Scan');
    });
});

describe('filterDescriptions', () => {
    const noFilters = { search: '', region: null, signalType: null, category: null };

    function makeFullDesc(
        id: string,
        overrides: Partial<SensationDescription>
    ): SensationDescription {
        return {
            id,
            text: 'tight chest',
            category: 'physical',
            bodyRegion: 'chest',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            sharingLevel: 'private',
            ...overrides,
        };
    }

    it('returns all items when no filters are active', () => {
        const items = [makeFullDesc('1', {}), makeFullDesc('2', { bodyRegion: 'heart' })];
        expect(filterDescriptions(items, noFilters)).toHaveLength(2);
    });

    it('filters by body region', () => {
        const items = [
            makeFullDesc('1', { bodyRegion: 'chest' }),
            makeFullDesc('2', { bodyRegion: 'heart' }),
        ];
        const result = filterDescriptions(items, { ...noFilters, region: 'heart' });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('filters by signal type', () => {
        const items = [
            makeFullDesc('1', { signalType: 'cardiac' }),
            makeFullDesc('2', { signalType: 'thermal' }),
            makeFullDesc('3', {}),
        ];
        const result = filterDescriptions(items, { ...noFilters, signalType: 'cardiac' });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('filters by category', () => {
        const items = [
            makeFullDesc('1', { category: 'physical' }),
            makeFullDesc('2', { category: 'emotional' }),
        ];
        const result = filterDescriptions(items, { ...noFilters, category: 'emotional' });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('filters by search text (case-insensitive)', () => {
        const items = [
            makeFullDesc('1', { text: 'warm glow' }),
            makeFullDesc('2', { text: 'tight pressure' }),
        ];
        const result = filterDescriptions(items, { ...noFilters, search: 'WARM' });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('matches search against emotionConnection', () => {
        const items = [makeFullDesc('1', { emotionConnection: 'anxious' }), makeFullDesc('2', {})];
        const result = filterDescriptions(items, { ...noFilters, search: 'anxi' });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('combines multiple filters (AND logic)', () => {
        const items = [
            makeFullDesc('1', { bodyRegion: 'heart', category: 'emotional' }),
            makeFullDesc('2', { bodyRegion: 'heart', category: 'physical' }),
            makeFullDesc('3', { bodyRegion: 'stomach', category: 'emotional' }),
        ];
        const result = filterDescriptions(items, {
            ...noFilters,
            region: 'heart',
            category: 'emotional',
        });
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });

    it('returns empty array when no items match', () => {
        const items = [makeFullDesc('1', { bodyRegion: 'chest' })];
        const result = filterDescriptions(items, { ...noFilters, region: 'heart' });
        expect(result).toHaveLength(0);
    });
});

describe('formatDate', () => {
    it('formats a date as a readable string', () => {
        const result = formatDate(new Date('2026-01-15T00:00:00.000Z'));
        expect(result).toContain('2026');
        expect(result).toMatch(/Jan|15/);
    });
});
