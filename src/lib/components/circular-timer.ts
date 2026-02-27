/**
 * Pure geometry and formatting helpers for the circular countdown timer.
 * Exported separately so they can be unit-tested without a browser.
 */

/** Circumference of a circle with radius r. */
export function circumference(r: number): number {
    return 2 * Math.PI * r;
}

/**
 * SVG stroke-dashoffset for a countdown arc.
 * Returns the offset that shows `remaining/total` fraction of the full circle.
 * - remaining === total → offset 0 (full arc visible)
 * - remaining === 0    → offset = circumference (no arc visible)
 */
export function arcOffset(r: number, remaining: number, total: number): number {
    if (total <= 0) return 0;
    const progress = Math.max(0, Math.min(1, remaining / total));
    return circumference(r) * (1 - progress);
}

/**
 * Format a number of seconds for timer display.
 * - Under 60s: "SS"
 * - 60s and above: "M:SS"
 * Negative values are clamped to 0.
 */
export function formatSeconds(seconds: number): string {
    const s = Math.max(0, Math.round(seconds));
    if (s >= 60) {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }
    return `${s}`;
}
