/**
 * Helpers for displaying personal vocabulary grouped by body region.
 */

import { BodyRegion } from '$lib/types/domain';
import type { SensationDescription, BodyRegion as BR } from '$lib/types/domain';

export interface VocabularyGroup {
    region: BR;
    items: SensationDescription[];
}

/**
 * Groups descriptions by body region, preserving the canonical region order.
 * Only regions with at least one description are included.
 */
export function groupByBodyRegion(descriptions: SensationDescription[]): VocabularyGroup[] {
    const map = new Map<BR, SensationDescription[]>();

    for (const desc of descriptions) {
        const group = map.get(desc.bodyRegion);
        if (group) {
            group.push(desc);
        } else {
            map.set(desc.bodyRegion, [desc]);
        }
    }

    return BodyRegion.options
        .filter(region => map.has(region))
        .map(region => ({ region, items: map.get(region)! }));
}

/**
 * Formats a body region or enum value for display (e.g. "body-scan" → "Body Scan").
 */
export function formatLabel(s: string): string {
    return s
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

/**
 * Formats a Date for display (e.g. "Jan 15, 2026").
 */
export function formatDate(d: Date): string {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
