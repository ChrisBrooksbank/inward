import { describe, it, expect } from 'vitest';
import type { BodyRegion, ExerciseSession, SensationDescription } from '$lib/types/domain';
import {
    getRegionColor,
    getRegionTextColor,
    buildRegionCoverage,
    countPracticedRegions,
    TOTAL_REGIONS,
    REGION_SLOTS,
} from './body-coverage';

// =============================================================================
// Test helpers
// =============================================================================

function makeSession(regions: BodyRegion[] = [], completed = true): ExerciseSession {
    return {
        id: crypto.randomUUID(),
        exerciseId: crypto.randomUUID(),
        state: completed ? 'completed' : 'idle',
        startedAt: new Date('2026-01-01T10:00:00'),
        completedAt: completed ? new Date('2026-01-01T10:30:00') : undefined,
        phasesCompleted: 1,
        totalPhases: 1,
        descriptions: regions.map(r => ({
            phaseId: 'phase-1',
            bodyRegion: r,
            text: 'test sensation',
            timestamp: new Date(),
        })),
        emotionConnections: [],
    };
}

function makeDesc(bodyRegion: BodyRegion, sessionId?: string): SensationDescription {
    return {
        id: crypto.randomUUID(),
        text: 'a feeling',
        category: 'physical',
        bodyRegion,
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
        sharingLevel: 'private',
    };
}

// =============================================================================
// REGION_SLOTS
// =============================================================================

describe('REGION_SLOTS', () => {
    it('contains exactly 16 entries (one per BodyRegion)', () => {
        expect(REGION_SLOTS.length).toBe(TOTAL_REGIONS);
    });

    it('each slot has at least one rect', () => {
        for (const slot of REGION_SLOTS) {
            expect(slot.rects.length).toBeGreaterThan(0);
        }
    });

    it('all region values are unique', () => {
        const regions = REGION_SLOTS.map(s => s.region);
        expect(new Set(regions).size).toBe(TOTAL_REGIONS);
    });
});

// =============================================================================
// getRegionColor
// =============================================================================

describe('getRegionColor', () => {
    it('returns gray for count 0', () => {
        expect(getRegionColor(0, true)).toBe('#e5e7eb');
        expect(getRegionColor(0, false)).toBe('#e5e7eb');
    });

    it('returns light blue for count 1–2 when highlightStrength is true', () => {
        expect(getRegionColor(1, true)).toBe('#bfdbfe');
        expect(getRegionColor(2, true)).toBe('#bfdbfe');
    });

    it('returns medium blue for count 3–5 when highlightStrength is true', () => {
        expect(getRegionColor(3, true)).toBe('#60a5fa');
        expect(getRegionColor(5, true)).toBe('#60a5fa');
    });

    it('returns dark blue for count 6+ when highlightStrength is true', () => {
        expect(getRegionColor(6, true)).toBe('#1d4ed8');
        expect(getRegionColor(100, true)).toBe('#1d4ed8');
    });

    it('returns same light blue for any practiced count when highlightStrength is false', () => {
        expect(getRegionColor(1, false)).toBe('#bfdbfe');
        expect(getRegionColor(10, false)).toBe('#bfdbfe');
    });
});

// =============================================================================
// getRegionTextColor
// =============================================================================

describe('getRegionTextColor', () => {
    it('returns muted gray for unpracticed regions', () => {
        expect(getRegionTextColor(0, true)).toBe('#9ca3af');
    });

    it('returns dark blue text for light/medium backgrounds', () => {
        expect(getRegionTextColor(1, true)).toBe('#1e40af');
        expect(getRegionTextColor(5, true)).toBe('#1e40af');
    });

    it('returns white text on dark blue background (6+ sessions, highlightStrength)', () => {
        expect(getRegionTextColor(6, true)).toBe('#ffffff');
    });

    it('returns dark blue text when highlightStrength is false', () => {
        expect(getRegionTextColor(10, false)).toBe('#1e40af');
    });
});

// =============================================================================
// buildRegionCoverage
// =============================================================================

describe('buildRegionCoverage', () => {
    it('returns empty map for no sessions or descriptions', () => {
        const result = buildRegionCoverage([], []);
        expect(result.size).toBe(0);
    });

    it('counts completed session regions', () => {
        const sessions = [makeSession(['heart', 'lungs'])];
        const result = buildRegionCoverage(sessions, []);
        expect(result.get('heart')).toBe(1);
        expect(result.get('lungs')).toBe(1);
    });

    it('ignores non-completed sessions', () => {
        const sessions = [makeSession(['heart'], false)];
        const result = buildRegionCoverage(sessions, []);
        expect(result.get('heart')).toBeUndefined();
    });

    it('counts each completed session once per unique region (deduplicates within session)', () => {
        // Session has 3 descriptions for 'heart', should still count as 1
        const session: ExerciseSession = {
            id: crypto.randomUUID(),
            exerciseId: crypto.randomUUID(),
            state: 'completed',
            startedAt: new Date(),
            completedAt: new Date(),
            phasesCompleted: 3,
            totalPhases: 3,
            descriptions: [
                { phaseId: 'p1', bodyRegion: 'heart', text: 'beat', timestamp: new Date() },
                { phaseId: 'p2', bodyRegion: 'heart', text: 'pulse', timestamp: new Date() },
                { phaseId: 'p3', bodyRegion: 'heart', text: 'thud', timestamp: new Date() },
            ],
            emotionConnections: [],
        };
        const result = buildRegionCoverage([session], []);
        expect(result.get('heart')).toBe(1);
    });

    it('accumulates count across multiple sessions for the same region', () => {
        const sessions = [makeSession(['heart']), makeSession(['heart']), makeSession(['heart'])];
        const result = buildRegionCoverage(sessions, []);
        expect(result.get('heart')).toBe(3);
    });

    it('counts standalone descriptions (no sessionId)', () => {
        const descs = [makeDesc('stomach'), makeDesc('stomach')];
        const result = buildRegionCoverage([], descs);
        expect(result.get('stomach')).toBe(2);
    });

    it('ignores descriptions that are linked to a session', () => {
        const sessionId = crypto.randomUUID();
        const descs = [makeDesc('stomach', sessionId)];
        const result = buildRegionCoverage([], descs);
        expect(result.get('stomach')).toBeUndefined();
    });

    it('combines session and standalone description counts', () => {
        const sessions = [makeSession(['heart'])];
        const descs = [makeDesc('heart'), makeDesc('stomach')];
        const result = buildRegionCoverage(sessions, descs);
        // session adds 1 for heart; standalone desc adds 1 for heart and 1 for stomach
        expect(result.get('heart')).toBe(2);
        expect(result.get('stomach')).toBe(1);
    });
});

// =============================================================================
// countPracticedRegions
// =============================================================================

describe('countPracticedRegions', () => {
    it('returns 0 for empty coverage', () => {
        expect(countPracticedRegions(new Map())).toBe(0);
    });

    it('counts regions with count > 0', () => {
        const coverage = new Map<BodyRegion, number>([
            ['heart', 3],
            ['stomach', 0],
            ['lungs', 1],
        ]);
        expect(countPracticedRegions(coverage)).toBe(2);
    });

    it('returns 0 when all counts are 0', () => {
        const coverage = new Map<BodyRegion, number>([
            ['heart', 0],
            ['stomach', 0],
        ]);
        expect(countPracticedRegions(coverage)).toBe(0);
    });
});
