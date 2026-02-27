/**
 * Body coverage map logic for the Progress dashboard.
 * Computes per-region practice counts and SVG layout data for all 16 body regions.
 */

import type { BodyRegion, ExerciseSession, SensationDescription } from '$lib/types/domain';

export const TOTAL_REGIONS = 16;

interface RegionRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface RegionSlot {
    region: BodyRegion;
    label: string;
    /** Primary label position (center of first rect) */
    labelX: number;
    labelY: number;
    /** One rect for single-sided regions; two rects for bilateral (arms/hands/legs/feet) */
    rects: RegionRect[];
}

/**
 * SVG layout for all 16 body regions in a schematic front-view body.
 * Coordinate system: viewBox="0 0 200 380"
 */
export const REGION_SLOTS: readonly RegionSlot[] = [
    // ── Head ──────────────────────────────────────────────────────
    {
        region: 'forehead',
        label: 'Forehead',
        rects: [{ x: 70, y: 2, w: 60, h: 18 }],
        labelX: 100,
        labelY: 11,
    },
    {
        region: 'face',
        label: 'Face',
        rects: [{ x: 62, y: 20, w: 76, h: 26 }],
        labelX: 100,
        labelY: 33,
    },
    {
        region: 'jaw',
        label: 'Jaw',
        rects: [{ x: 70, y: 46, w: 60, h: 14 }],
        labelX: 100,
        labelY: 53,
    },
    // ── Neck ──────────────────────────────────────────────────────
    {
        region: 'neck',
        label: 'Neck',
        rects: [{ x: 70, y: 62, w: 28, h: 14 }],
        labelX: 84,
        labelY: 69,
    },
    {
        region: 'throat',
        label: 'Throat',
        rects: [{ x: 100, y: 62, w: 30, h: 14 }],
        labelX: 115,
        labelY: 69,
    },
    // ── Shoulders ─────────────────────────────────────────────────
    {
        region: 'shoulders',
        label: 'Shoulders',
        rects: [{ x: 18, y: 78, w: 164, h: 22 }],
        labelX: 100,
        labelY: 89,
    },
    // ── Upper body (bilateral arms flank center torso) ─────────────
    {
        region: 'arms',
        label: 'Arms',
        rects: [
            { x: 10, y: 100, w: 26, h: 100 },
            { x: 164, y: 100, w: 26, h: 100 },
        ],
        labelX: 23,
        labelY: 150,
    },
    {
        region: 'chest',
        label: 'Chest',
        rects: [{ x: 48, y: 100, w: 104, h: 36 }],
        labelX: 100,
        labelY: 118,
    },
    {
        region: 'lungs',
        label: 'Lungs',
        rects: [{ x: 48, y: 136, w: 50, h: 36 }],
        labelX: 73,
        labelY: 154,
    },
    {
        region: 'heart',
        label: 'Heart',
        rects: [{ x: 100, y: 136, w: 52, h: 36 }],
        labelX: 126,
        labelY: 154,
    },
    {
        region: 'stomach',
        label: 'Stomach',
        rects: [{ x: 48, y: 172, w: 104, h: 32 }],
        labelX: 100,
        labelY: 188,
    },
    // ── Hands (bilateral, aligned with bottom of arms) ─────────────
    {
        region: 'hands',
        label: 'Hands',
        rects: [
            { x: 10, y: 200, w: 26, h: 22 },
            { x: 164, y: 200, w: 26, h: 22 },
        ],
        labelX: 23,
        labelY: 211,
    },
    // ── Lower torso ───────────────────────────────────────────────
    {
        region: 'abdomen',
        label: 'Abdomen',
        rects: [{ x: 48, y: 204, w: 104, h: 32 }],
        labelX: 100,
        labelY: 220,
    },
    {
        region: 'back',
        label: 'Back',
        rects: [{ x: 48, y: 236, w: 104, h: 22 }],
        labelX: 100,
        labelY: 247,
    },
    // ── Lower body (bilateral legs and feet) ───────────────────────
    {
        region: 'legs',
        label: 'Legs',
        rects: [
            { x: 48, y: 262, w: 50, h: 88 },
            { x: 102, y: 262, w: 50, h: 88 },
        ],
        labelX: 73,
        labelY: 306,
    },
    {
        region: 'feet',
        label: 'Feet',
        rects: [
            { x: 48, y: 352, w: 50, h: 24 },
            { x: 102, y: 352, w: 50, h: 24 },
        ],
        labelX: 73,
        labelY: 364,
    },
];

/**
 * Returns a fill color for a body region based on its practice count.
 * When highlightStrength is false, all practiced regions use the same color.
 *
 * | Count | Color       |
 * |-------|-------------|
 * | 0     | Gray        |
 * | 1–2   | Light blue  |
 * | 3–5   | Medium blue |
 * | 6+    | Dark blue   |
 */
export function getRegionColor(count: number, highlightStrength: boolean): string {
    if (count === 0) return '#e5e7eb';
    if (!highlightStrength || count <= 2) return '#bfdbfe';
    if (count <= 5) return '#60a5fa';
    return '#1d4ed8';
}

/**
 * Returns a contrasting text color for labels drawn on a region rect.
 */
export function getRegionTextColor(count: number, highlightStrength: boolean): string {
    if (count === 0) return '#9ca3af';
    if (!highlightStrength || count <= 5) return '#1e40af';
    return '#ffffff';
}

/**
 * Build a map of body regions to practice counts.
 *
 * - Each completed session contributes 1 per unique body region it covers.
 * - Standalone SensationDescriptions (no sessionId) add 1 per region.
 */
export function buildRegionCoverage(
    sessions: ExerciseSession[],
    descriptions: SensationDescription[]
): Map<BodyRegion, number> {
    const map = new Map<BodyRegion, number>();

    for (const session of sessions) {
        if (session.state !== 'completed') continue;
        const regions = new Set<BodyRegion>();
        for (const d of session.descriptions) {
            regions.add(d.bodyRegion);
        }
        for (const region of regions) {
            map.set(region, (map.get(region) ?? 0) + 1);
        }
    }

    for (const desc of descriptions) {
        if (desc.sessionId != null) continue;
        const region = desc.bodyRegion;
        map.set(region, (map.get(region) ?? 0) + 1);
    }

    return map;
}

/**
 * Count how many distinct body regions have been practiced at least once.
 */
export function countPracticedRegions(coverage: Map<BodyRegion, number>): number {
    let count = 0;
    for (const c of coverage.values()) {
        if (c > 0) count++;
    }
    return count;
}
