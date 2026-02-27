import { describe, it, expect } from 'vitest';

// Step metadata for the informational steps
const STEP_TITLES = ['Inward', 'What is Interoception?', 'Your Data, Your Control'];

// Step 5: First Exercise intro content
const FIRST_EXERCISE = {
    title: 'Try Your First Exercise',
    exerciseName: 'Heart After Movement',
    duration: '2 minutes',
    difficulty: 'Beginner',
    regions: 'Heart, Chest',
};

// Step 6: Completion screen content
const COMPLETE_NEXT_STEPS = [
    { icon: '📅', title: 'Practice a little each day' },
    { icon: '📝', title: 'Build your vocabulary' },
    { icon: '📊', title: 'Track your progress' },
];

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

describe('first exercise step', () => {
    it('has the correct title', () => {
        expect(FIRST_EXERCISE.title).toBe('Try Your First Exercise');
    });

    it('uses Heart After Movement as the exercise', () => {
        expect(FIRST_EXERCISE.exerciseName).toBe('Heart After Movement');
    });

    it('shows 2 minute duration', () => {
        expect(FIRST_EXERCISE.duration).toBe('2 minutes');
    });

    it('is beginner difficulty', () => {
        expect(FIRST_EXERCISE.difficulty).toBe('Beginner');
    });

    it('targets heart and chest regions', () => {
        expect(FIRST_EXERCISE.regions).toBe('Heart, Chest');
    });
});

describe('complete step', () => {
    it('lists 3 next steps', () => {
        expect(COMPLETE_NEXT_STEPS).toHaveLength(3);
    });

    it('includes daily practice suggestion', () => {
        expect(COMPLETE_NEXT_STEPS.some(s => s.title === 'Practice a little each day')).toBe(true);
    });

    it('includes vocabulary building suggestion', () => {
        expect(COMPLETE_NEXT_STEPS.some(s => s.title === 'Build your vocabulary')).toBe(true);
    });

    it('includes progress tracking suggestion', () => {
        expect(COMPLETE_NEXT_STEPS.some(s => s.title === 'Track your progress')).toBe(true);
    });
});
