import { describe, it, expect } from 'vitest';
import {
    getPhaseIcon,
    getPhaseLabel,
    requiresInput,
    isMinimalUI,
    getEmotionSuggestions,
    getVocabularySuggestions,
} from './phaseUtils';
import type { PhaseType } from '$lib/types/domain';

const ALL_PHASE_TYPES: PhaseType[] = [
    'instruction',
    'movement',
    'rest',
    'notice',
    'describe',
    'reflect',
];

// =============================================================================
// getPhaseIcon
// =============================================================================

describe('getPhaseIcon', () => {
    it('returns a non-empty string for every phase type', () => {
        for (const type of ALL_PHASE_TYPES) {
            expect(getPhaseIcon(type)).toBeTruthy();
        }
    });

    it('returns different icons for different types', () => {
        const icons = ALL_PHASE_TYPES.map(getPhaseIcon);
        const unique = new Set(icons);
        expect(unique.size).toBe(ALL_PHASE_TYPES.length);
    });

    it('returns book icon for instruction', () => {
        expect(getPhaseIcon('instruction')).toBe('📖');
    });

    it('returns pencil icon for describe', () => {
        expect(getPhaseIcon('describe')).toBe('✏️');
    });
});

// =============================================================================
// getPhaseLabel
// =============================================================================

describe('getPhaseLabel', () => {
    it('returns a non-empty string for every phase type', () => {
        for (const type of ALL_PHASE_TYPES) {
            expect(getPhaseLabel(type)).toBeTruthy();
        }
    });

    it('returns capitalised label for instruction', () => {
        expect(getPhaseLabel('instruction')).toBe('Instruction');
    });

    it('returns different labels for different types', () => {
        const labels = ALL_PHASE_TYPES.map(getPhaseLabel);
        const unique = new Set(labels);
        expect(unique.size).toBe(ALL_PHASE_TYPES.length);
    });
});

// =============================================================================
// requiresInput
// =============================================================================

describe('requiresInput', () => {
    it('returns true for describe phase', () => {
        expect(requiresInput('describe')).toBe(true);
    });

    it('returns true for reflect phase', () => {
        expect(requiresInput('reflect')).toBe(true);
    });

    it('returns false for instruction phase', () => {
        expect(requiresInput('instruction')).toBe(false);
    });

    it('returns false for movement phase', () => {
        expect(requiresInput('movement')).toBe(false);
    });

    it('returns false for rest phase', () => {
        expect(requiresInput('rest')).toBe(false);
    });

    it('returns false for notice phase', () => {
        expect(requiresInput('notice')).toBe(false);
    });
});

// =============================================================================
// isMinimalUI
// =============================================================================

describe('isMinimalUI', () => {
    it('returns true for rest phase', () => {
        expect(isMinimalUI('rest')).toBe(true);
    });

    it('returns true for notice phase', () => {
        expect(isMinimalUI('notice')).toBe(true);
    });

    it('returns false for describe phase', () => {
        expect(isMinimalUI('describe')).toBe(false);
    });

    it('returns false for instruction phase', () => {
        expect(isMinimalUI('instruction')).toBe(false);
    });
});

// =============================================================================
// getEmotionSuggestions
// =============================================================================

describe('getEmotionSuggestions', () => {
    it('returns a non-empty array for known body region', () => {
        const suggestions = getEmotionSuggestions('heart');
        expect(suggestions.length).toBeGreaterThan(0);
    });

    it('returns default emotions for unknown region', () => {
        const suggestions = getEmotionSuggestions('forehead');
        expect(suggestions.length).toBeGreaterThan(0);
    });

    it('returns default emotions when no region provided', () => {
        const suggestions = getEmotionSuggestions();
        expect(suggestions.length).toBeGreaterThan(0);
    });

    it('returns strings for heart region', () => {
        const suggestions = getEmotionSuggestions('heart');
        expect(suggestions.every(s => typeof s === 'string')).toBe(true);
    });
});

// =============================================================================
// getVocabularySuggestions
// =============================================================================

describe('getVocabularySuggestions', () => {
    it('returns a non-empty array for known body region', () => {
        const words = getVocabularySuggestions('heart');
        expect(words.length).toBeGreaterThan(0);
    });

    it('returns default vocabulary when no region provided', () => {
        const words = getVocabularySuggestions();
        expect(words.length).toBeGreaterThan(0);
    });

    it('returns default vocabulary for region without specific words', () => {
        const words = getVocabularySuggestions('feet');
        expect(words.length).toBeGreaterThan(0);
    });

    it('returns strings only', () => {
        const words = getVocabularySuggestions('stomach');
        expect(words.every(w => typeof w === 'string')).toBe(true);
    });

    it('includes cardiac words for heart region', () => {
        const words = getVocabularySuggestions('heart');
        expect(words).toContain('pounding');
    });

    it('includes gastric words for stomach region', () => {
        const words = getVocabularySuggestions('stomach');
        expect(words).toContain('butterflies');
    });

    it('returns different suggestions for different regions', () => {
        const heartWords = getVocabularySuggestions('heart');
        const stomachWords = getVocabularySuggestions('stomach');
        expect(heartWords).not.toEqual(stomachWords);
    });
});
