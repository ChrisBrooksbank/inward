/**
 * Helpers for displaying personal vocabulary grouped by body region.
 */

import { BodyRegion } from '$lib/types/domain';
import type {
    SensationDescription,
    BodyRegion as BR,
    SignalType,
    VocabularyCategory,
} from '$lib/types/domain';

export interface VocabularyFilters {
    search: string;
    region: BR | null;
    signalType: SignalType | null;
    category: VocabularyCategory | null;
}

function matchesSearch(desc: SensationDescription, q: string): boolean {
    if (!q) return true;
    const inText = desc.text.toLowerCase().includes(q);
    const inEmotion = desc.emotionConnection?.toLowerCase().includes(q) ?? false;
    return inText || inEmotion;
}

function matchesVocabularyFilters(desc: SensationDescription, filters: VocabularyFilters): boolean {
    if (filters.region !== null && desc.bodyRegion !== filters.region) return false;
    if (filters.signalType !== null && desc.signalType !== filters.signalType) return false;
    if (filters.category !== null && desc.category !== filters.category) return false;
    return matchesSearch(desc, filters.search.trim().toLowerCase());
}

/**
 * Filters descriptions by search query, body region, signal type, and category.
 */
export function filterDescriptions(
    descriptions: SensationDescription[],
    filters: VocabularyFilters
): SensationDescription[] {
    return descriptions.filter(desc => matchesVocabularyFilters(desc, filters));
}

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
