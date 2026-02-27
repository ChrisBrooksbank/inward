/**
 * Utility functions for exercise phase display.
 */

import type { PhaseType, BodyRegion } from '$lib/types/domain';

// =============================================================================
// Phase icons and labels
// =============================================================================

const PHASE_ICONS: Record<PhaseType, string> = {
    instruction: '📖',
    movement: '🏃',
    rest: '🧘',
    notice: '👁️',
    describe: '✏️',
    reflect: '💭',
};

const PHASE_LABELS: Record<PhaseType, string> = {
    instruction: 'Instruction',
    movement: 'Movement',
    rest: 'Rest',
    notice: 'Notice',
    describe: 'Describe',
    reflect: 'Reflect',
};

export function getPhaseIcon(type: PhaseType): string {
    return PHASE_ICONS[type];
}

export function getPhaseLabel(type: PhaseType): string {
    return PHASE_LABELS[type];
}

// =============================================================================
// Phase behavior flags
// =============================================================================

/** Phases that require user input before auto-advancing. */
export function requiresInput(type: PhaseType): boolean {
    return type === 'describe' || type === 'reflect';
}

/** Phases that use minimal UI to avoid distraction. */
export function isMinimalUI(type: PhaseType): boolean {
    return type === 'rest' || type === 'notice';
}

// =============================================================================
// Emotion suggestions per body region
// =============================================================================

const REGION_EMOTIONS: Partial<Record<BodyRegion, string[]>> = {
    heart: ['anxious', 'excited', 'calm', 'fearful', 'joyful', 'nervous'],
    chest: ['heavy', 'open', 'warm', 'tight', 'constricted'],
    stomach: ['nervous', 'content', 'nauseous', 'anticipating'],
    lungs: ['calm', 'anxious', 'peaceful', 'tense', 'relieved'],
    throat: ['tense', 'choked', 'open', 'tight'],
    shoulders: ['tense', 'relaxed', 'burdened', 'stressed'],
    face: ['flushed', 'calm', 'embarrassed', 'warm'],
    hands: ['nervous', 'energised', 'tense', 'calm'],
};

const DEFAULT_EMOTIONS = ['calm', 'anxious', 'content', 'tense', 'peaceful', 'unsettled'];

export function getEmotionSuggestions(bodyRegion?: BodyRegion): string[] {
    if (!bodyRegion) return DEFAULT_EMOTIONS;
    return REGION_EMOTIONS[bodyRegion] ?? DEFAULT_EMOTIONS;
}

// =============================================================================
// Vocabulary suggestions per body region (seed words for describe phases)
// =============================================================================

const REGION_VOCABULARY: Partial<Record<BodyRegion, string[]>> = {
    heart: ['pounding', 'racing', 'fluttering', 'steady', 'skipping', 'thumping'],
    stomach: ['churning', 'tight', 'hollow', 'queasy', 'warm', 'butterflies', 'knot'],
    lungs: ['tight', 'expanding', 'constricted', 'shallow', 'full'],
    throat: ['tight', 'lump', 'dry', 'thick', 'constricted'],
    chest: ['tight', 'heavy', 'open', 'warm', 'pressure'],
    hands: ['tingling', 'cold', 'warm', 'sweaty', 'trembling'],
    feet: ['tingling', 'cold', 'warm', 'heavy', 'light'],
    face: ['hot', 'flushed', 'tight', 'tingling'],
    shoulders: ['tight', 'heavy', 'raised', 'relaxed', 'knotted'],
    jaw: ['clenched', 'tight', 'loose', 'aching'],
    neck: ['stiff', 'tight', 'loose', 'warm'],
    back: ['tense', 'aching', 'warm', 'curved'],
    abdomen: ['tight', 'soft', 'churning', 'warm', 'hollow'],
    forehead: ['tight', 'pressing', 'warm', 'cool'],
    arms: ['heavy', 'tingling', 'warm', 'cool'],
    legs: ['heavy', 'tingling', 'warm', 'tired'],
};

const DEFAULT_VOCABULARY = ['tight', 'warm', 'heavy', 'light', 'tingling', 'soft'];

export function getVocabularySuggestions(bodyRegion?: BodyRegion): string[] {
    if (!bodyRegion) return DEFAULT_VOCABULARY;
    return REGION_VOCABULARY[bodyRegion] ?? DEFAULT_VOCABULARY;
}
