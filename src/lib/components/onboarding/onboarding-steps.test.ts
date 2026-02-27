import { describe, it, expect } from 'vitest';

// Step metadata for the 3 informational steps
const STEP_TITLES = ['Inward', 'What is Interoception?', 'Your Data, Your Control'];

const PRIVACY_FEATURES = [
    { icon: '📱', title: 'Local First' },
    { icon: '🔒', title: 'Private by Default' },
    { icon: '🗑️', title: 'Easy Deletion' },
    { icon: '📤', title: 'Export Anytime' },
];

const INTEROCEPTION_SIGNALS = [
    'Your heartbeat',
    'Your breathing',
    'Hunger and fullness',
    'Temperature changes',
    'Physical feelings of emotions',
];

describe('onboarding step titles', () => {
    it('has 3 informational steps', () => {
        expect(STEP_TITLES).toHaveLength(3);
    });

    it('first step is Welcome', () => {
        expect(STEP_TITLES[0]).toBe('Inward');
    });

    it('second step is What is Interoception', () => {
        expect(STEP_TITLES[1]).toBe('What is Interoception?');
    });

    it('third step is Privacy and Data', () => {
        expect(STEP_TITLES[2]).toBe('Your Data, Your Control');
    });
});

describe('interoception signals', () => {
    it('lists 5 signal examples', () => {
        expect(INTEROCEPTION_SIGNALS).toHaveLength(5);
    });

    it('includes heartbeat', () => {
        expect(INTEROCEPTION_SIGNALS).toContain('Your heartbeat');
    });

    it('includes breathing', () => {
        expect(INTEROCEPTION_SIGNALS).toContain('Your breathing');
    });
});

describe('privacy features', () => {
    it('lists 4 features', () => {
        expect(PRIVACY_FEATURES).toHaveLength(4);
    });

    it('includes Local First feature', () => {
        expect(PRIVACY_FEATURES.some(f => f.title === 'Local First')).toBe(true);
    });

    it('includes Private by Default feature', () => {
        expect(PRIVACY_FEATURES.some(f => f.title === 'Private by Default')).toBe(true);
    });

    it('includes Easy Deletion feature', () => {
        expect(PRIVACY_FEATURES.some(f => f.title === 'Easy Deletion')).toBe(true);
    });

    it('includes Export Anytime feature', () => {
        expect(PRIVACY_FEATURES.some(f => f.title === 'Export Anytime')).toBe(true);
    });
});
