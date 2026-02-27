/**
 * Pure geometry and data helpers for the MAIA-2 radar chart.
 * Exported separately so they can be unit-tested without a browser.
 */

import type { MAIAScore, MAIASubscale } from '$lib/types/domain';

export interface Point {
    x: number;
    y: number;
}

export const SUBSCALE_ORDER: MAIASubscale[] = [
    'noticing',
    'not-distracting',
    'not-worrying',
    'attention-regulation',
    'emotional-awareness',
    'self-regulation',
    'body-listening',
    'trusting',
];

export const SUBSCALE_LABELS: Record<MAIASubscale, string> = {
    noticing: 'Noticing',
    'not-distracting': 'Not Distr.',
    'not-worrying': 'Not Worry.',
    'attention-regulation': 'Attention',
    'emotional-awareness': 'Emotional',
    'self-regulation': 'Self-Reg.',
    'body-listening': 'Listening',
    trusting: 'Trusting',
};

export const GRID_LEVELS = [1, 2, 3, 4, 5] as const;
export const MAX_SCORE = 5;

/** Clockwise angle in radians for axis i out of n, starting at top (−π/2). */
export function axisAngle(i: number, n: number): number {
    return (i / n) * 2 * Math.PI - Math.PI / 2;
}

/** Convert polar coordinates to Cartesian. */
export function polarToCart(cx: number, cy: number, r: number, theta: number): Point {
    return { x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) };
}

/** Build a closed SVG polygon path string from an array of points. */
export function buildPath(points: Point[]): string {
    const parts = points.map(
        ({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    );
    return parts.join(' ') + ' Z';
}

/** SVG text-anchor value for a label at axis i of n axes. */
export function labelTextAnchor(i: number, n: number): string {
    const cos = Math.cos(axisAngle(i, n));
    if (cos > 0.1) return 'start';
    if (cos < -0.1) return 'end';
    return 'middle';
}

/** Vertical dy offset for label at axis i of n axes. */
export function labelDy(i: number, n: number): string {
    const sin = Math.sin(axisAngle(i, n));
    if (sin < -0.3) return '-0.4em';
    if (sin > 0.3) return '1em';
    return '0.35em';
}

/** Look up a subscale score value, defaulting to 0 if not present. */
export function getScoreValue(scores: MAIAScore[], subscale: MAIASubscale): number {
    return scores.find(s => s.subscale === subscale)?.score ?? 0;
}
