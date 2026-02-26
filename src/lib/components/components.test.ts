import { describe, it, expect } from 'vitest';
import { BUTTON_VARIANTS, BUTTON_TYPES, CARD_PADDINGS } from './component-props';

// =============================================================================
// Button prop constants
// =============================================================================

describe('BUTTON_VARIANTS', () => {
    it('includes primary variant', () => {
        expect(BUTTON_VARIANTS).toContain('primary');
    });

    it('includes secondary variant', () => {
        expect(BUTTON_VARIANTS).toContain('secondary');
    });

    it('includes ghost variant', () => {
        expect(BUTTON_VARIANTS).toContain('ghost');
    });

    it('has exactly 3 variants', () => {
        expect(BUTTON_VARIANTS).toHaveLength(3);
    });
});

describe('BUTTON_TYPES', () => {
    it('includes button type', () => {
        expect(BUTTON_TYPES).toContain('button');
    });

    it('includes submit type', () => {
        expect(BUTTON_TYPES).toContain('submit');
    });

    it('includes reset type', () => {
        expect(BUTTON_TYPES).toContain('reset');
    });

    it('has exactly 3 types', () => {
        expect(BUTTON_TYPES).toHaveLength(3);
    });
});

// =============================================================================
// Card prop constants
// =============================================================================

describe('CARD_PADDINGS', () => {
    it('includes sm padding', () => {
        expect(CARD_PADDINGS).toContain('sm');
    });

    it('includes md padding', () => {
        expect(CARD_PADDINGS).toContain('md');
    });

    it('includes lg padding', () => {
        expect(CARD_PADDINGS).toContain('lg');
    });

    it('has exactly 3 padding sizes', () => {
        expect(CARD_PADDINGS).toHaveLength(3);
    });
});
