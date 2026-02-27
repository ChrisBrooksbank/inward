/**
 * Pure logic for contextual vocabulary suggestions panel.
 * Shown after exercise completion to surface relevant shared vocabulary.
 */

import type { BodyRegion, SharedDescription, SensationDescription } from '$lib/types/domain';

export const MAX_SUGGESTIONS = 5;

/**
 * Returns shared vocabulary terms relevant to the given body regions,
 * excluding terms the user already owns (by case-insensitive text match).
 * Sorted by confirmation count descending, capped at MAX_SUGGESTIONS.
 */
export function getContextualSuggestions(
    bodyRegions: BodyRegion[],
    allShared: SharedDescription[],
    personal: SensationDescription[]
): SharedDescription[] {
    const ownedTexts = new Set(personal.map(d => d.text.toLowerCase()));
    return allShared
        .filter(d => bodyRegions.includes(d.bodyRegion))
        .filter(d => !ownedTexts.has(d.text.toLowerCase()))
        .sort((a, b) => b.confirmationCount - a.confirmationCount)
        .slice(0, MAX_SUGGESTIONS);
}

/**
 * Creates a personal SensationDescription from a shared vocabulary term,
 * linking it to the exercise session in which it was adopted.
 */
export function descriptionFromShared(
    shared: SharedDescription,
    exerciseId: string,
    sessionId: string
): SensationDescription {
    const now = new Date();
    return {
        id: crypto.randomUUID(),
        text: shared.text,
        category: shared.category,
        bodyRegion: shared.bodyRegion,
        signalType: shared.signalType,
        emotionConnection: shared.emotionConnection,
        exerciseId,
        sessionId,
        createdAt: now,
        updatedAt: now,
        sharingLevel: 'private',
    };
}
