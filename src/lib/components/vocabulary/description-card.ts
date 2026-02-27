/**
 * Pure logic helpers for DescriptionCard component.
 */

import type { SensationDescription, SharingLevel } from '$lib/types/domain';
import { formatDate, formatLabel } from '$lib/core/vocabularyList';

// =============================================================================
// Sharing level helpers
// =============================================================================

const SHARING_ORDER: SharingLevel[] = ['private', 'anonymous', 'attributed'];

/**
 * Returns the next sharing level in the cycle: private → anonymous → attributed → private.
 */
export function nextSharingLevel(current: SharingLevel): SharingLevel {
    const idx = SHARING_ORDER.indexOf(current);
    return SHARING_ORDER[(idx + 1) % SHARING_ORDER.length];
}

/**
 * Returns a human-readable label for a sharing level.
 */
export function sharingLevelLabel(level: SharingLevel): string {
    switch (level) {
        case 'private':
            return 'Private';
        case 'anonymous':
            return 'Anonymous';
        case 'attributed':
            return 'Attributed';
    }
}

/**
 * Returns a short description of what each sharing level means.
 */
export function sharingLevelDescription(level: SharingLevel): string {
    switch (level) {
        case 'private':
            return 'Only visible to you';
        case 'anonymous':
            return 'Shared without your name';
        case 'attributed':
            return 'Shared with attribution';
    }
}

/**
 * Returns true when the description was captured during an exercise session.
 */
export function hasExerciseContext(desc: SensationDescription): boolean {
    return desc.exerciseId !== undefined || desc.sessionId !== undefined;
}

/**
 * Returns true when updatedAt differs from createdAt (i.e., the entry was edited).
 */
export function wasEdited(desc: SensationDescription): boolean {
    return desc.updatedAt.getTime() !== desc.createdAt.getTime();
}

export interface DescriptionCardData {
    text: string;
    region: string;
    category: string;
    signalType: string | undefined;
    emotionConnection: string | undefined;
    createdLabel: string;
    updatedLabel: string | undefined;
    fromExercise: boolean;
    sharingLevel: SharingLevel;
    sharingLabel: string;
    sharingDescription: string;
}

/**
 * Transforms a SensationDescription into display-ready card data.
 */
export function toCardData(desc: SensationDescription): DescriptionCardData {
    return {
        text: desc.text,
        region: formatLabel(desc.bodyRegion),
        category: formatLabel(desc.category),
        signalType: desc.signalType ? formatLabel(desc.signalType) : undefined,
        emotionConnection: desc.emotionConnection,
        createdLabel: formatDate(desc.createdAt),
        updatedLabel: wasEdited(desc) ? formatDate(desc.updatedAt) : undefined,
        fromExercise: hasExerciseContext(desc),
        sharingLevel: desc.sharingLevel,
        sharingLabel: sharingLevelLabel(desc.sharingLevel),
        sharingDescription: sharingLevelDescription(desc.sharingLevel),
    };
}
