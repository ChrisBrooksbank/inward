/**
 * Pure logic helpers for DescriptionCard component.
 */

import type { SensationDescription } from '$lib/types/domain';
import { formatDate, formatLabel } from '$lib/core/vocabularyList';

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
    };
}
