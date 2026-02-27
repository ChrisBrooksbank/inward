import { describe, it, expect } from 'vitest';
import type { MAIAAssessment, MAIAScore } from '$lib/types/domain';
import { sortAssessments, selectProgressScores } from './maia-progress';

const now = new Date('2026-01-15T10:00:00Z');
const earlier = new Date('2026-01-01T10:00:00Z');
const earliest = new Date('2025-12-01T10:00:00Z');

function makeScore(subscale: string, score: number): MAIAScore {
    return { subscale: subscale as MAIAScore['subscale'], score, measuredAt: now };
}

function makeAssessment(id: string, completedAt: Date, baseScore = 3): MAIAAssessment {
    const subscales = [
        'noticing',
        'not-distracting',
        'not-worrying',
        'attention-regulation',
        'emotional-awareness',
        'self-regulation',
        'body-listening',
        'trusting',
    ] as const;

    return {
        id,
        responses: Array(37).fill(baseScore),
        scores: subscales.map(s => makeScore(s, baseScore)),
        completedAt,
    };
}

describe('sortAssessments', () => {
    it('returns empty array for empty input', () => {
        expect(sortAssessments([])).toEqual([]);
    });

    it('returns single item unchanged', () => {
        const a = makeAssessment('a', now);
        expect(sortAssessments([a])).toEqual([a]);
    });

    it('sorts chronologically oldest first', () => {
        const a = makeAssessment('a', now);
        const b = makeAssessment('b', earlier);
        const c = makeAssessment('c', earliest);
        const sorted = sortAssessments([a, b, c]);
        expect(sorted[0].id).toBe('c');
        expect(sorted[1].id).toBe('b');
        expect(sorted[2].id).toBe('a');
    });

    it('does not mutate the original array', () => {
        const a = makeAssessment('a', now);
        const b = makeAssessment('b', earlier);
        const original = [a, b];
        sortAssessments(original);
        expect(original[0].id).toBe('a');
    });
});

describe('selectProgressScores', () => {
    it('returns null for empty array', () => {
        expect(selectProgressScores([])).toBeNull();
    });

    it('returns current scores and no baseline for single assessment', () => {
        const a = makeAssessment('a', now, 4);
        const result = selectProgressScores([a]);
        expect(result).not.toBeNull();
        expect(result!.currentScores).toEqual(a.scores);
        expect(result!.baselineScores).toBeNull();
        expect(result!.currentDate).toEqual(now);
        expect(result!.baselineDate).toBeNull();
    });

    it('returns current (latest) and baseline (oldest) for two assessments', () => {
        const base = makeAssessment('base', earlier, 2);
        const current = makeAssessment('current', now, 4);
        const result = selectProgressScores([current, base]);
        expect(result!.currentScores).toEqual(current.scores);
        expect(result!.baselineScores).toEqual(base.scores);
        expect(result!.currentDate).toEqual(now);
        expect(result!.baselineDate).toEqual(earlier);
    });

    it('uses oldest as baseline and latest as current for three assessments', () => {
        const a = makeAssessment('a', earliest, 1);
        const b = makeAssessment('b', earlier, 3);
        const c = makeAssessment('c', now, 5);
        const result = selectProgressScores([c, a, b]);
        expect(result!.currentScores).toEqual(c.scores);
        expect(result!.baselineScores).toEqual(a.scores);
    });
});
