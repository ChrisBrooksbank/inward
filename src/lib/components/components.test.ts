import { describe, it, expect } from 'vitest';
import { BUTTON_VARIANTS, BUTTON_TYPES, CARD_PADDINGS, NAV_TABS } from './component-props';

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

// =============================================================================
// BottomNav tab constants
// =============================================================================

describe('NAV_TABS', () => {
    it('has exactly 4 tabs', () => {
        expect(NAV_TABS).toHaveLength(4);
    });

    it('includes Dashboard tab pointing to /dashboard', () => {
        const tab = NAV_TABS.find(t => t.label === 'Dashboard');
        expect(tab).toBeDefined();
        expect(tab?.path).toBe('/dashboard');
    });

    it('includes Practice tab pointing to /exercises', () => {
        const tab = NAV_TABS.find(t => t.label === 'Practice');
        expect(tab).toBeDefined();
        expect(tab?.path).toBe('/exercises');
    });

    it('includes Words tab pointing to /vocabulary', () => {
        const tab = NAV_TABS.find(t => t.label === 'Words');
        expect(tab).toBeDefined();
        expect(tab?.path).toBe('/vocabulary');
    });

    it('includes Progress tab pointing to /progress', () => {
        const tab = NAV_TABS.find(t => t.label === 'Progress');
        expect(tab).toBeDefined();
        expect(tab?.path).toBe('/progress');
    });

    it('all tabs have unique paths', () => {
        const paths = NAV_TABS.map(t => t.path);
        const unique = new Set(paths);
        expect(unique.size).toBe(NAV_TABS.length);
    });
});
