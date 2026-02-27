import { describe, it, expect } from 'vitest';
import { groupByBodyRegion, formatLabel, formatDate } from './vocabularyList';
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

describe('formatDate', () => {
    it('formats a date as a readable string', () => {
        const result = formatDate(new Date('2026-01-15T00:00:00.000Z'));
        expect(result).toContain('2026');
        expect(result).toMatch(/Jan|15/);
    });
});
