import { describe, it, expect } from 'vitest';
import { MAIA_QUESTIONS, SUBSCALE_ITEM_COUNTS, scoreMaiaAssessment } from './maia';
import type { MAIASubscale } from '$lib/types/domain';

const ALL_SUBSCALES: MAIASubscale[] = [
    'noticing',
    'not-distracting',
    'not-worrying',
    'attention-regulation',
    'emotional-awareness',
    'self-regulation',
    'body-listening',
    'trusting',
];

describe('MAIA_QUESTIONS', () => {
    it('has exactly 37 items', () => {
        expect(MAIA_QUESTIONS).toHaveLength(37);
    });

    it('has sequential IDs from 1 to 37', () => {
        const ids = MAIA_QUESTIONS.map(q => q.id);
        for (let i = 1; i <= 37; i++) {
            expect(ids).toContain(i);
        }
    });

    it('has correct item counts per subscale', () => {
        for (const subscale of ALL_SUBSCALES) {
            const count = MAIA_QUESTIONS.filter(q => q.subscale === subscale).length;
            expect(count).toBe(SUBSCALE_ITEM_COUNTS[subscale]);
        }
    });

    it('marks all Not-Distracting items as reversed', () => {
        const items = MAIA_QUESTIONS.filter(q => q.subscale === 'not-distracting');
        expect(items).toHaveLength(6);
        items.forEach(q => expect(q.reversed).toBe(true));
    });

    it('marks correct Not-Worrying items as reversed', () => {
        const items = MAIA_QUESTIONS.filter(q => q.subscale === 'not-worrying');
        const reversedIds = items.filter(q => q.reversed).map(q => q.id);
        const forwardIds = items.filter(q => !q.reversed).map(q => q.id);
        // Items 11, 12, 14, 15 are reversed; item 13 is forward
        expect(reversedIds.sort()).toEqual([11, 12, 14, 15]);
        expect(forwardIds).toEqual([13]);
    });

    it('marks all Noticing items as forward', () => {
        const items = MAIA_QUESTIONS.filter(q => q.subscale === 'noticing');
        items.forEach(q => expect(q.reversed).toBe(false));
    });

    it('all items have non-empty text', () => {
        MAIA_QUESTIONS.forEach(q => expect(q.text.length).toBeGreaterThan(0));
    });
});

describe('SUBSCALE_ITEM_COUNTS', () => {
    it('sums to 37', () => {
        const total = Object.values(SUBSCALE_ITEM_COUNTS).reduce((a, b) => a + b, 0);
        expect(total).toBe(37);
    });
});

describe('scoreMaiaAssessment', () => {
    const now = new Date('2026-01-01T12:00:00Z');

    it('returns 8 subscale scores', () => {
        const scores = scoreMaiaAssessment(Array(37).fill(3), now);
        expect(scores).toHaveLength(8);
    });

    it('returns one score per subscale', () => {
        const scores = scoreMaiaAssessment(Array(37).fill(3), now);
        const subscales = scores.map(s => s.subscale);
        expect(new Set(subscales).size).toBe(8);
        ALL_SUBSCALES.forEach(sub => expect(subscales).toContain(sub));
    });

    it('attaches the provided measuredAt date', () => {
        const scores = scoreMaiaAssessment(Array(37).fill(0), now);
        scores.forEach(s => expect(s.measuredAt).toBe(now));
    });

    it('all responses 0: forward-only subscales score 0', () => {
        const scores = scoreMaiaAssessment(Array(37).fill(0), now);
        const noticing = scores.find(s => s.subscale === 'noticing')!;
        expect(noticing.score).toBe(0);
    });

    it('all responses 0: all-reversed subscale (not-distracting) scores 5', () => {
        const scores = scoreMaiaAssessment(Array(37).fill(0), now);
        const notDistracting = scores.find(s => s.subscale === 'not-distracting')!;
        expect(notDistracting.score).toBe(5);
    });

    it('all responses 5: forward-only subscales score 5', () => {
        const scores = scoreMaiaAssessment(Array(37).fill(5), now);
        const noticing = scores.find(s => s.subscale === 'noticing')!;
        expect(noticing.score).toBe(5);
    });

    it('all responses 5: all-reversed subscale (not-distracting) scores 0', () => {
        const scores = scoreMaiaAssessment(Array(37).fill(5), now);
        const notDistracting = scores.find(s => s.subscale === 'not-distracting')!;
        expect(notDistracting.score).toBe(0);
    });

    it('all responses 3: forward-only subscales score 3', () => {
        // noticing, attention-regulation, emotional-awareness, self-regulation,
        // body-listening, trusting are all forward-scored
        const scores = scoreMaiaAssessment(Array(37).fill(3), now);
        const forwardOnlySubscales: MAIASubscale[] = [
            'noticing',
            'attention-regulation',
            'emotional-awareness',
            'self-regulation',
            'body-listening',
            'trusting',
        ];
        for (const sub of forwardOnlySubscales) {
            const s = scores.find(x => x.subscale === sub)!;
            expect(s.score).toBe(3);
        }
    });

    it('all responses 3: not-distracting (all reversed) scores 2', () => {
        const scores = scoreMaiaAssessment(Array(37).fill(3), now);
        const nd = scores.find(s => s.subscale === 'not-distracting')!;
        expect(nd.score).toBe(2); // 5 - 3 = 2 for each of 6 items
    });

    it('all responses 2: mid-score subscale scores equal 2', () => {
        // 2 forward → 2; reversed → 5-2 = 3; 3+3+3+3+2+3+3+3 avg for not-worrying
        const scores = scoreMaiaAssessment(Array(37).fill(2), now);
        const noticing = scores.find(s => s.subscale === 'noticing')!;
        expect(noticing.score).toBe(2);
    });

    it('not-worrying: mixed scoring is calculated correctly', () => {
        // Set all responses to 4
        // Items 11,12,14,15 reversed: 5-4=1; item 13 forward: 4
        // Mean = (1+1+4+1+1) / 5 = 8/5 = 1.6
        const responses = Array(37).fill(4) as number[];
        const scores = scoreMaiaAssessment(responses, now);
        const notWorrying = scores.find(s => s.subscale === 'not-worrying')!;
        expect(notWorrying.score).toBeCloseTo(1.6);
    });

    it('attention-regulation: all 7 items averaged correctly', () => {
        // Items 16-22 are forward scored
        // Set items 16-22 to 2, all others to 0
        const responses = Array(37).fill(0) as number[];
        for (let i = 15; i <= 21; i++) responses[i] = 2; // 0-indexed
        const scores = scoreMaiaAssessment(responses, now);
        const attn = scores.find(s => s.subscale === 'attention-regulation')!;
        // All 7 forward items = 2, not-distracting reversed = 5-0=5
        expect(attn.score).toBe(2);
    });

    it('scores are within valid 0–5 range', () => {
        const responses = Array.from({ length: 37 }, (_, i) => i % 6) as number[];
        const scores = scoreMaiaAssessment(responses, now);
        scores.forEach(s => {
            expect(s.score).toBeGreaterThanOrEqual(0);
            expect(s.score).toBeLessThanOrEqual(5);
        });
    });

    it('throws if responses array is wrong length', () => {
        expect(() => scoreMaiaAssessment(Array(36).fill(3), now)).toThrow();
        expect(() => scoreMaiaAssessment(Array(38).fill(3), now)).toThrow();
        expect(() => scoreMaiaAssessment([], now)).toThrow();
    });
});
