import { describe, it, expect } from 'vitest';
import type { MAIAScore, MAIASubscale } from '$lib/types/domain';
import {
    SUBSCALE_ORDER,
    SUBSCALE_LABELS,
    GRID_LEVELS,
    MAX_SCORE,
    axisAngle,
    polarToCart,
    buildPath,
    labelTextAnchor,
    labelDy,
    getScoreValue,
} from './radar-chart';

describe('SUBSCALE_ORDER', () => {
    it('has 8 entries', () => {
        expect(SUBSCALE_ORDER).toHaveLength(8);
    });

    it('starts with noticing', () => {
        expect(SUBSCALE_ORDER[0]).toBe('noticing');
    });

    it('ends with trusting', () => {
        expect(SUBSCALE_ORDER[SUBSCALE_ORDER.length - 1]).toBe('trusting');
    });

    it('contains all expected subscales', () => {
        const expected: MAIASubscale[] = [
            'noticing',
            'not-distracting',
            'not-worrying',
            'attention-regulation',
            'emotional-awareness',
            'self-regulation',
            'body-listening',
            'trusting',
        ];
        expect(SUBSCALE_ORDER).toEqual(expected);
    });
});

describe('SUBSCALE_LABELS', () => {
    it('has an entry for every subscale in SUBSCALE_ORDER', () => {
        for (const subscale of SUBSCALE_ORDER) {
            expect(SUBSCALE_LABELS[subscale]).toBeDefined();
        }
    });

    it('all labels are non-empty strings', () => {
        for (const label of Object.values(SUBSCALE_LABELS)) {
            expect(typeof label).toBe('string');
            expect(label.length).toBeGreaterThan(0);
        }
    });

    it('has exactly 8 labels', () => {
        expect(Object.keys(SUBSCALE_LABELS)).toHaveLength(8);
    });
});

describe('GRID_LEVELS', () => {
    it('has 5 levels', () => {
        expect(GRID_LEVELS).toHaveLength(5);
    });

    it('runs from 1 to 5', () => {
        expect(GRID_LEVELS[0]).toBe(1);
        expect(GRID_LEVELS[GRID_LEVELS.length - 1]).toBe(5);
    });
});

describe('MAX_SCORE', () => {
    it('is 5', () => {
        expect(MAX_SCORE).toBe(5);
    });
});

describe('axisAngle', () => {
    const N = 8;

    it('axis 0 points upward (−π/2)', () => {
        expect(axisAngle(0, N)).toBeCloseTo(-Math.PI / 2);
    });

    it('axis 2 (3rd) points right (0)', () => {
        // i=2 → (2/8)*2π − π/2 = π/2 − π/2 = 0
        expect(axisAngle(2, N)).toBeCloseTo(0);
    });

    it('axis 4 points downward (π/2)', () => {
        expect(axisAngle(4, N)).toBeCloseTo(Math.PI / 2);
    });

    it('axis 6 points left (π)', () => {
        expect(axisAngle(6, N)).toBeCloseTo(Math.PI);
    });

    it('angles increase monotonically', () => {
        for (let i = 1; i < N; i++) {
            expect(axisAngle(i, N)).toBeGreaterThan(axisAngle(i - 1, N));
        }
    });

    it('spans exactly 2π across all N axes', () => {
        const span = axisAngle(N, N) - axisAngle(0, N);
        expect(span).toBeCloseTo(2 * Math.PI);
    });
});

describe('polarToCart', () => {
    it('angle 0 (right) returns point to the right of center', () => {
        const pt = polarToCart(0, 0, 100, 0);
        expect(pt.x).toBeCloseTo(100);
        expect(pt.y).toBeCloseTo(0);
    });

    it('angle π/2 (down) returns point below center', () => {
        const pt = polarToCart(0, 0, 100, Math.PI / 2);
        expect(pt.x).toBeCloseTo(0);
        expect(pt.y).toBeCloseTo(100);
    });

    it('angle π (left) returns point to the left of center', () => {
        const pt = polarToCart(0, 0, 100, Math.PI);
        expect(pt.x).toBeCloseTo(-100);
        expect(pt.y).toBeCloseTo(0);
    });

    it('respects cx and cy offsets', () => {
        const pt = polarToCart(50, 60, 10, 0);
        expect(pt.x).toBeCloseTo(60);
        expect(pt.y).toBeCloseTo(60);
    });

    it('r=0 always returns the center', () => {
        const pt = polarToCart(100, 200, 0, 1.23);
        expect(pt.x).toBeCloseTo(100);
        expect(pt.y).toBeCloseTo(200);
    });
});

describe('buildPath', () => {
    it('starts with M for single point', () => {
        const path = buildPath([{ x: 10, y: 20 }]);
        expect(path).toMatch(/^M /);
    });

    it('ends with Z', () => {
        const path = buildPath([
            { x: 0, y: 0 },
            { x: 10, y: 0 },
        ]);
        expect(path).toMatch(/Z$/);
    });

    it('uses L for subsequent points', () => {
        const path = buildPath([
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 5, y: 10 },
        ]);
        expect(path).toContain('L');
        expect(path).toMatch(/^M .+ L .+ L .+ Z$/);
    });

    it('formats coordinates to 1 decimal place', () => {
        const path = buildPath([{ x: 1.23456, y: 7.89012 }]);
        expect(path).toContain('1.2');
        expect(path).toContain('7.9');
    });

    it('empty array returns just Z', () => {
        const path = buildPath([]);
        expect(path).toBe(' Z');
    });
});

describe('labelTextAnchor', () => {
    const N = 8;

    it('returns "middle" for top axis (i=0)', () => {
        // cos(−π/2) ≈ 0
        expect(labelTextAnchor(0, N)).toBe('middle');
    });

    it('returns "start" for right axis (i=2)', () => {
        // cos(0) = 1 > 0.1
        expect(labelTextAnchor(2, N)).toBe('start');
    });

    it('returns "middle" for bottom axis (i=4)', () => {
        // cos(π/2) ≈ 0
        expect(labelTextAnchor(4, N)).toBe('middle');
    });

    it('returns "end" for left axis (i=6)', () => {
        // cos(π) = -1 < -0.1
        expect(labelTextAnchor(6, N)).toBe('end');
    });

    it('returns "start" for top-right axis (i=1)', () => {
        // cos(−π/4) ≈ 0.707 > 0.1
        expect(labelTextAnchor(1, N)).toBe('start');
    });

    it('returns "end" for bottom-left axis (i=5)', () => {
        // cos(3π/4) ≈ -0.707 < -0.1
        expect(labelTextAnchor(5, N)).toBe('end');
    });
});

describe('labelDy', () => {
    const N = 8;

    it('returns negative dy for top axis (i=0)', () => {
        // sin(−π/2) = -1 < -0.3
        expect(labelDy(0, N)).toBe('-0.4em');
    });

    it('returns positive dy for bottom axis (i=4)', () => {
        // sin(π/2) = 1 > 0.3
        expect(labelDy(4, N)).toBe('1em');
    });

    it('returns mid dy for right axis (i=2)', () => {
        // sin(0) = 0, |0| ≤ 0.3
        expect(labelDy(2, N)).toBe('0.35em');
    });

    it('returns mid dy for left axis (i=6)', () => {
        // sin(π) ≈ 0
        expect(labelDy(6, N)).toBe('0.35em');
    });

    it('returns negative dy for top-right axis (i=1)', () => {
        // sin(−π/4) ≈ -0.707 < -0.3
        expect(labelDy(1, N)).toBe('-0.4em');
    });

    it('returns positive dy for bottom-left axis (i=5)', () => {
        // sin(3π/4) ≈ 0.707 > 0.3
        expect(labelDy(5, N)).toBe('1em');
    });
});

describe('getScoreValue', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const scores: MAIAScore[] = [
        { subscale: 'noticing', score: 3.5, measuredAt: now },
        { subscale: 'trusting', score: 4.0, measuredAt: now },
    ];

    it('returns score for a present subscale', () => {
        expect(getScoreValue(scores, 'noticing')).toBe(3.5);
    });

    it('returns score for another present subscale', () => {
        expect(getScoreValue(scores, 'trusting')).toBe(4.0);
    });

    it('returns 0 for a missing subscale', () => {
        expect(getScoreValue(scores, 'not-distracting')).toBe(0);
    });

    it('returns 0 for empty scores array', () => {
        expect(getScoreValue([], 'noticing')).toBe(0);
    });

    it('returns correct value for all subscales in a full set', () => {
        const full: MAIAScore[] = SUBSCALE_ORDER.map((subscale, i) => ({
            subscale,
            score: i + 0.5,
            measuredAt: now,
        }));
        for (let i = 0; i < SUBSCALE_ORDER.length; i++) {
            expect(getScoreValue(full, SUBSCALE_ORDER[i])).toBe(i + 0.5);
        }
    });
});
