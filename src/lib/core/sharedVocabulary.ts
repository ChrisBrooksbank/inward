/**
 * Helpers for the shared vocabulary discovery view.
 * Groups and sorts shared descriptions by body region and confirmation count.
 */

import { BodyRegion } from '$lib/types/domain';
import type { SharedDescription, BodyRegion as BR } from '$lib/types/domain';

export interface SharedVocabularyGroup {
    region: BR;
    /** Sorted by confirmationCount descending (most confirmed first). */
    items: SharedDescription[];
}

function sortByConfirmations(items: SharedDescription[]): SharedDescription[] {
    return [...items].sort((a, b) => b.confirmationCount - a.confirmationCount);
}

/**
 * Groups shared descriptions by body region, preserving canonical order.
 * Each group's items are sorted by confirmationCount descending.
 */
export function groupSharedByBodyRegion(
    descriptions: SharedDescription[]
): SharedVocabularyGroup[] {
    const map = new Map<BR, SharedDescription[]>();

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
        .map(region => ({ region, items: sortByConfirmations(map.get(region)!) }));
}

/**
 * Filters shared descriptions by body region.
 * Returns all descriptions when region is null.
 */
export function filterSharedByRegion(
    descriptions: SharedDescription[],
    region: BR | null
): SharedDescription[] {
    if (region === null) return descriptions;
    return descriptions.filter(d => d.bodyRegion === region);
}
