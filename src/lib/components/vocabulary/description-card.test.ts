import { describe, it, expect } from 'vitest';
import {
    hasExerciseContext,
    wasEdited,
    toCardData,
    nextSharingLevel,
    sharingLevelLabel,
    sharingLevelDescription,
} from './description-card';
import type { SensationDescription } from '$lib/types/domain';

// =============================================================================
// Helpers
// =============================================================================

function makeDesc(overrides: Partial<SensationDescription> = {}): SensationDescription {
    const now = new Date('2026-01-15T10:00:00Z');
    return {
        id: '00000000-0000-0000-0000-000000000001',
        text: 'tight warmth in chest',
        category: 'physical',
        bodyRegion: 'chest',
        createdAt: now,
        updatedAt: now,
        sharingLevel: 'private',
        ...overrides,
    };
}

// =============================================================================
// hasExerciseContext
// =============================================================================

describe('hasExerciseContext', () => {
    it('returns false when neither exerciseId nor sessionId is set', () => {
        expect(hasExerciseContext(makeDesc())).toBe(false);
    });

    it('returns true when exerciseId is set', () => {
        const desc = makeDesc({ exerciseId: '00000000-0000-0000-0000-000000000002' });
        expect(hasExerciseContext(desc)).toBe(true);
    });

    it('returns true when sessionId is set', () => {
        const desc = makeDesc({ sessionId: '00000000-0000-0000-0000-000000000003' });
        expect(hasExerciseContext(desc)).toBe(true);
    });

    it('returns true when both exerciseId and sessionId are set', () => {
        const desc = makeDesc({
            exerciseId: '00000000-0000-0000-0000-000000000002',
            sessionId: '00000000-0000-0000-0000-000000000003',
        });
        expect(hasExerciseContext(desc)).toBe(true);
    });
});

// =============================================================================
// wasEdited
// =============================================================================

describe('wasEdited', () => {
    it('returns false when createdAt and updatedAt are the same', () => {
        expect(wasEdited(makeDesc())).toBe(false);
    });

    it('returns true when updatedAt is later than createdAt', () => {
        const created = new Date('2026-01-15T10:00:00Z');
        const updated = new Date('2026-01-16T10:00:00Z');
        expect(wasEdited(makeDesc({ createdAt: created, updatedAt: updated }))).toBe(true);
    });
});

// =============================================================================
// toCardData
// =============================================================================

describe('toCardData', () => {
    it('formats region label with title case', () => {
        const data = toCardData(makeDesc({ bodyRegion: 'heart' }));
        expect(data.region).toBe('Heart');
    });

    it('formats hyphenated region label', () => {
        const data = toCardData(makeDesc({ bodyRegion: 'forehead' }));
        expect(data.region).toBe('Forehead');
    });

    it('formats category label', () => {
        const data = toCardData(makeDesc({ category: 'emotional' }));
        expect(data.category).toBe('Emotional');
    });

    it('includes signalType label when present', () => {
        const data = toCardData(makeDesc({ signalType: 'cardiac' }));
        expect(data.signalType).toBe('Cardiac');
    });

    it('returns undefined signalType when absent', () => {
        const data = toCardData(makeDesc());
        expect(data.signalType).toBeUndefined();
    });

    it('preserves emotionConnection when present', () => {
        const data = toCardData(makeDesc({ emotionConnection: 'anxious' }));
        expect(data.emotionConnection).toBe('anxious');
    });

    it('returns undefined emotionConnection when absent', () => {
        const data = toCardData(makeDesc());
        expect(data.emotionConnection).toBeUndefined();
    });

    it('sets fromExercise true when exerciseId is set', () => {
        const data = toCardData(makeDesc({ exerciseId: '00000000-0000-0000-0000-000000000002' }));
        expect(data.fromExercise).toBe(true);
    });

    it('sets fromExercise false when no exercise context', () => {
        const data = toCardData(makeDesc());
        expect(data.fromExercise).toBe(false);
    });

    it('sets updatedLabel to undefined when not edited', () => {
        const data = toCardData(makeDesc());
        expect(data.updatedLabel).toBeUndefined();
    });

    it('sets updatedLabel when edited', () => {
        const created = new Date('2026-01-15T10:00:00Z');
        const updated = new Date('2026-01-20T10:00:00Z');
        const data = toCardData(makeDesc({ createdAt: created, updatedAt: updated }));
        expect(data.updatedLabel).toBeDefined();
        expect(typeof data.updatedLabel).toBe('string');
    });

    it('formats createdLabel as a non-empty string', () => {
        const data = toCardData(makeDesc());
        expect(data.createdLabel.length).toBeGreaterThan(0);
    });

    it('preserves the original text', () => {
        const data = toCardData(makeDesc({ text: 'flutter in stomach' }));
        expect(data.text).toBe('flutter in stomach');
    });

    it('includes sharingLevel from description', () => {
        const data = toCardData(makeDesc({ sharingLevel: 'anonymous' }));
        expect(data.sharingLevel).toBe('anonymous');
    });

    it('includes sharingLabel string', () => {
        const data = toCardData(makeDesc({ sharingLevel: 'private' }));
        expect(data.sharingLabel).toBe('Private');
    });

    it('includes sharingDescription string', () => {
        const data = toCardData(makeDesc({ sharingLevel: 'private' }));
        expect(data.sharingDescription.length).toBeGreaterThan(0);
    });
});

// =============================================================================
// nextSharingLevel
// =============================================================================

describe('nextSharingLevel', () => {
    it('cycles private → anonymous', () => {
        expect(nextSharingLevel('private')).toBe('anonymous');
    });

    it('cycles anonymous → attributed', () => {
        expect(nextSharingLevel('anonymous')).toBe('attributed');
    });

    it('cycles attributed → private', () => {
        expect(nextSharingLevel('attributed')).toBe('private');
    });
});

// =============================================================================
// sharingLevelLabel
// =============================================================================

describe('sharingLevelLabel', () => {
    it('returns Private for private', () => {
        expect(sharingLevelLabel('private')).toBe('Private');
    });

    it('returns Anonymous for anonymous', () => {
        expect(sharingLevelLabel('anonymous')).toBe('Anonymous');
    });

    it('returns Attributed for attributed', () => {
        expect(sharingLevelLabel('attributed')).toBe('Attributed');
    });
});

// =============================================================================
// sharingLevelDescription
// =============================================================================

describe('sharingLevelDescription', () => {
    it('returns a non-empty string for each level', () => {
        expect(sharingLevelDescription('private').length).toBeGreaterThan(0);
        expect(sharingLevelDescription('anonymous').length).toBeGreaterThan(0);
        expect(sharingLevelDescription('attributed').length).toBeGreaterThan(0);
    });

    it('private description mentions visibility', () => {
        expect(sharingLevelDescription('private').toLowerCase()).toContain('you');
    });

    it('anonymous description mentions name', () => {
        expect(sharingLevelDescription('anonymous').toLowerCase()).toContain('name');
    });
});
