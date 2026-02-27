import { describe, it, expect } from 'vitest';
import { circumference, arcOffset, formatSeconds } from './circular-timer';

describe('circumference', () => {
    it('returns 0 for radius 0', () => {
        expect(circumference(0)).toBe(0);
    });

    it('returns 2πr for a positive radius', () => {
        expect(circumference(40)).toBeCloseTo(2 * Math.PI * 40);
    });

    it('scales linearly with radius', () => {
        expect(circumference(20)).toBeCloseTo(circumference(40) / 2);
    });
});

describe('arcOffset', () => {
    const R = 40;
    const C = circumference(R);

    it('returns 0 when remaining equals total (full arc)', () => {
        expect(arcOffset(R, 30, 30)).toBeCloseTo(0);
    });

    it('returns circumference when remaining is 0 (no arc)', () => {
        expect(arcOffset(R, 0, 30)).toBeCloseTo(C);
    });

    it('returns half circumference at the halfway point', () => {
        expect(arcOffset(R, 15, 30)).toBeCloseTo(C * 0.5);
    });

    it('clamps to 0 when remaining exceeds total', () => {
        expect(arcOffset(R, 40, 30)).toBeCloseTo(0);
    });

    it('clamps to circumference when remaining is negative', () => {
        expect(arcOffset(R, -5, 30)).toBeCloseTo(C);
    });

    it('returns 0 when total is 0 (guard against division by zero)', () => {
        expect(arcOffset(R, 5, 0)).toBe(0);
    });

    it('returns 0 when total is negative', () => {
        expect(arcOffset(R, 5, -10)).toBe(0);
    });
});

describe('formatSeconds', () => {
    it('formats 0 as "0"', () => {
        expect(formatSeconds(0)).toBe('0');
    });

    it('formats single-digit seconds', () => {
        expect(formatSeconds(5)).toBe('5');
    });

    it('formats double-digit seconds', () => {
        expect(formatSeconds(25)).toBe('25');
    });

    it('formats 59 as "59"', () => {
        expect(formatSeconds(59)).toBe('59');
    });

    it('formats 60 as "1:00"', () => {
        expect(formatSeconds(60)).toBe('1:00');
    });

    it('formats 65 as "1:05"', () => {
        expect(formatSeconds(65)).toBe('1:05');
    });

    it('pads seconds with leading zero in M:SS format', () => {
        expect(formatSeconds(61)).toBe('1:01');
    });

    it('formats 120 as "2:00"', () => {
        expect(formatSeconds(120)).toBe('2:00');
    });

    it('clamps negative values to "0"', () => {
        expect(formatSeconds(-1)).toBe('0');
    });

    it('rounds fractional seconds', () => {
        expect(formatSeconds(1.7)).toBe('2');
        expect(formatSeconds(1.2)).toBe('1');
    });

    it('rounds at the minute boundary correctly', () => {
        expect(formatSeconds(59.6)).toBe('1:00');
    });
});
