import { describe, it, expect } from 'vitest';
import { generateInsights, MAX_INSIGHTS } from './insights';
import type { UserProgressData } from './insights';
import type {
    ExerciseSession,
    SensationDescription,
    MAIAAssessment,
    MAIAScore,
} from '$lib/types/domain';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

let _idCounter = 0;
function uid(): string {
    _idCounter++;
    return `00000000-0000-0000-0000-${String(_idCounter).padStart(12, '0')}`;
}

type SessionOverride = {
    state?: ExerciseSession['state'];
    startedAt?: Date;
    completedAt?: Date;
    regions?: string[];
};

function makeSession(overrides: SessionOverride = {}): ExerciseSession {
    const state = overrides.state ?? 'completed';
    const startedAt = overrides.startedAt ?? new Date('2026-01-10T10:00:00Z');
    const completedAt = overrides.completedAt ?? new Date('2026-01-10T10:15:00Z');
    const regions = overrides.regions ?? ['heart'];
    return {
        id: uid(),
        exerciseId: uid(),
        state,
        startedAt,
        completedAt: state === 'completed' ? completedAt : undefined,
        phasesCompleted: 3,
        totalPhases: 3,
        descriptions: regions.map((r, i) => ({
            phaseId: `phase-${i}`,
            bodyRegion: r as ExerciseSession['descriptions'][0]['bodyRegion'],
            text: `I feel tension in my ${r}`,
            timestamp: completedAt ?? startedAt,
        })),
        emotionConnections: [],
    };
}

function makeDescription(): SensationDescription {
    return {
        id: uid(),
        text: 'a sensation',
        category: 'physical',
        bodyRegion: 'heart',
        createdAt: new Date('2026-01-10T10:00:00Z'),
        updatedAt: new Date('2026-01-10T10:00:00Z'),
        sharingLevel: 'private',
    };
}

function makeScore(subscale: MAIAScore['subscale'], score: number): MAIAScore {
    return { subscale, score, measuredAt: new Date('2026-01-10T10:00:00Z') };
}

const ALL_SUBSCALES: MAIAScore['subscale'][] = [
    'noticing',
    'not-distracting',
    'not-worrying',
    'attention-regulation',
    'emotional-awareness',
    'self-regulation',
    'body-listening',
    'trusting',
];

function makeAssessment(avgScoreValue: number, completedAt: Date): MAIAAssessment {
    return {
        id: uid(),
        responses: Array(37).fill(Math.round(avgScoreValue)) as number[],
        scores: ALL_SUBSCALES.map(s => makeScore(s, avgScoreValue)),
        completedAt,
    };
}

function emptyData(): UserProgressData {
    return { sessions: [], assessments: [], descriptions: [], currentStreak: 0 };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateInsights – empty data', () => {
    it('returns no insights for a brand-new user', () => {
        expect(generateInsights(emptyData())).toHaveLength(0);
    });
});

describe('Rule 1: first-session', () => {
    it('fires exactly when 1 completed session exists', () => {
        const data = { ...emptyData(), sessions: [makeSession()] };
        const insights = generateInsights(data);
        expect(insights.some(i => i.id === 'first-session')).toBe(true);
    });

    it('does not fire when 0 completed sessions', () => {
        const data = {
            ...emptyData(),
            sessions: [makeSession({ state: 'abandoned' })],
        };
        expect(generateInsights(data).some(i => i.id === 'first-session')).toBe(false);
    });

    it('does not fire when 2+ completed sessions', () => {
        const data = {
            ...emptyData(),
            sessions: [makeSession(), makeSession()],
        };
        expect(generateInsights(data).some(i => i.id === 'first-session')).toBe(false);
    });
});

describe('Rule 2: new-region', () => {
    it('fires when latest session explores a previously unseen region', () => {
        const s1 = makeSession({
            startedAt: new Date('2026-01-01'),
            completedAt: new Date('2026-01-01'),
            regions: ['heart'],
        });
        const s2 = makeSession({
            startedAt: new Date('2026-01-02'),
            completedAt: new Date('2026-01-02'),
            regions: ['stomach'],
        });
        const data = { ...emptyData(), sessions: [s1, s2] };
        expect(generateInsights(data).some(i => i.id === 'new-region')).toBe(true);
    });

    it('does not fire when latest session has no new regions', () => {
        const s1 = makeSession({
            startedAt: new Date('2026-01-01'),
            completedAt: new Date('2026-01-01'),
            regions: ['heart'],
        });
        const s2 = makeSession({
            startedAt: new Date('2026-01-02'),
            completedAt: new Date('2026-01-02'),
            regions: ['heart'],
        });
        const data = { ...emptyData(), sessions: [s1, s2] };
        expect(generateInsights(data).some(i => i.id === 'new-region')).toBe(false);
    });

    it('does not fire when only one completed session', () => {
        const data = { ...emptyData(), sessions: [makeSession({ regions: ['heart'] })] };
        expect(generateInsights(data).some(i => i.id === 'new-region')).toBe(false);
    });
});

describe('Rule 3: vocab-growth', () => {
    it('fires at milestone counts (5, 10, 25, 50)', () => {
        for (const count of [5, 10, 25, 50]) {
            const descriptions = Array.from({ length: count }, makeDescription);
            const data = { ...emptyData(), descriptions };
            expect(generateInsights(data).some(i => i.id === 'vocab-growth')).toBe(true);
        }
    });

    it('does not fire at non-milestone counts', () => {
        for (const count of [1, 4, 6, 11, 30]) {
            const descriptions = Array.from({ length: count }, makeDescription);
            const data = { ...emptyData(), descriptions };
            expect(generateInsights(data).some(i => i.id === 'vocab-growth')).toBe(false);
        }
    });
});

describe('Rule 4: underexplored-regions', () => {
    it('fires when fewer than 4 regions covered after 5+ sessions', () => {
        const sessions = Array.from({ length: 5 }, () => makeSession({ regions: ['heart'] }));
        const data = { ...emptyData(), sessions };
        expect(generateInsights(data).some(i => i.id === 'underexplored-regions')).toBe(true);
    });

    it('does not fire when 4+ regions covered', () => {
        const regions = ['heart', 'stomach', 'lungs', 'throat', 'hands'] as const;
        const sessions = regions.map(r => makeSession({ regions: [r] }));
        const data = { ...emptyData(), sessions };
        expect(generateInsights(data).some(i => i.id === 'underexplored-regions')).toBe(false);
    });

    it('does not fire with fewer than 5 completed sessions', () => {
        const sessions = Array.from({ length: 4 }, () => makeSession({ regions: ['heart'] }));
        const data = { ...emptyData(), sessions };
        expect(generateInsights(data).some(i => i.id === 'underexplored-regions')).toBe(false);
    });
});

describe('Rule 5: streak-active', () => {
    it('fires when current streak is 3+', () => {
        const data = { ...emptyData(), currentStreak: 5 };
        expect(generateInsights(data).some(i => i.id === 'streak-active')).toBe(true);
    });

    it('does not fire when streak is below 3', () => {
        expect(
            generateInsights({ ...emptyData(), currentStreak: 2 }).some(
                i => i.id === 'streak-active'
            )
        ).toBe(false);
        expect(
            generateInsights({ ...emptyData(), currentStreak: 0 }).some(
                i => i.id === 'streak-active'
            )
        ).toBe(false);
    });

    it('includes streak count in title', () => {
        const data = { ...emptyData(), currentStreak: 7 };
        const insight = generateInsights(data).find(i => i.id === 'streak-active');
        expect(insight?.title).toContain('7');
    });
});

describe('Rule 6: streak-broken', () => {
    it('fires when sessions exist, streak=0, and last session was 2+ days ago', () => {
        const oldDate = new Date(Date.now() - 3 * 86_400_000);
        const sessions = [makeSession({ completedAt: oldDate })];
        const data = { ...emptyData(), sessions, currentStreak: 0 };
        expect(generateInsights(data).some(i => i.id === 'streak-broken')).toBe(true);
    });

    it('does not fire when active streak exists', () => {
        const oldDate = new Date(Date.now() - 3 * 86_400_000);
        const sessions = [makeSession({ completedAt: oldDate })];
        const data = { ...emptyData(), sessions, currentStreak: 3 };
        expect(generateInsights(data).some(i => i.id === 'streak-broken')).toBe(false);
    });

    it('does not fire when last session was recent (< 2 days)', () => {
        const recentDate = new Date(Date.now() - 1 * 86_400_000);
        const sessions = [makeSession({ completedAt: recentDate })];
        const data = { ...emptyData(), sessions, currentStreak: 0 };
        expect(generateInsights(data).some(i => i.id === 'streak-broken')).toBe(false);
    });
});

describe('Rule 7: assessment-due', () => {
    it('fires after 10 completed sessions with no assessment', () => {
        const sessions = Array.from({ length: 10 }, makeSession);
        const data = { ...emptyData(), sessions };
        expect(generateInsights(data).some(i => i.id === 'assessment-due')).toBe(true);
    });

    it('does not fire with fewer than 10 sessions and no assessment', () => {
        const sessions = Array.from({ length: 9 }, makeSession);
        const data = { ...emptyData(), sessions };
        expect(generateInsights(data).some(i => i.id === 'assessment-due')).toBe(false);
    });

    it('fires when last assessment was 42+ days ago', () => {
        const oldDate = new Date(Date.now() - 43 * 86_400_000);
        const assessments = [makeAssessment(3, oldDate)];
        const data = { ...emptyData(), assessments };
        expect(generateInsights(data).some(i => i.id === 'assessment-due')).toBe(true);
    });

    it('does not fire when last assessment was recent', () => {
        const recentDate = new Date(Date.now() - 10 * 86_400_000);
        const assessments = [makeAssessment(3, recentDate)];
        const data = { ...emptyData(), assessments };
        expect(generateInsights(data).some(i => i.id === 'assessment-due')).toBe(false);
    });
});

describe('Rule 8: assessment-improvement', () => {
    it('fires when latest score is more than 0.2 above baseline', () => {
        const baseline = makeAssessment(2.0, new Date('2026-01-01'));
        const latest = makeAssessment(2.5, new Date('2026-02-01'));
        const data = { ...emptyData(), assessments: [baseline, latest] };
        expect(generateInsights(data).some(i => i.id === 'assessment-improvement')).toBe(true);
    });

    it('does not fire when improvement is 0.2 or less', () => {
        const baseline = makeAssessment(2.0, new Date('2026-01-01'));
        const latest = makeAssessment(2.1, new Date('2026-02-01'));
        const data = { ...emptyData(), assessments: [baseline, latest] };
        expect(generateInsights(data).some(i => i.id === 'assessment-improvement')).toBe(false);
    });

    it('does not fire with fewer than 2 assessments', () => {
        const data = { ...emptyData(), assessments: [makeAssessment(3, new Date())] };
        expect(generateInsights(data).some(i => i.id === 'assessment-improvement')).toBe(false);
    });
});

describe('MAX_INSIGHTS cap', () => {
    it('returns at most MAX_INSIGHTS insights even when many rules fire', () => {
        // first-session + streak-active + vocab-growth(5) + underexplored(5 sessions, 1 region)
        const sessions = Array.from({ length: 5 }, () => makeSession({ regions: ['heart'] }));
        const descriptions = Array.from({ length: 5 }, makeDescription);
        const data = { ...emptyData(), sessions, descriptions, currentStreak: 5 };
        // first-session won't fire (5 sessions), but others should
        const results = generateInsights(data);
        expect(results.length).toBeLessThanOrEqual(MAX_INSIGHTS);
    });

    it('returns exactly 3 insights when 4+ rules match', () => {
        // streak-active + assessment-due (10 sessions) + underexplored (5 sessions, 1 region)
        // + vocab-growth (10) fire simultaneously
        const sessions = Array.from({ length: 10 }, () => makeSession({ regions: ['heart'] }));
        const descriptions = Array.from({ length: 10 }, makeDescription);
        const data = { ...emptyData(), sessions, descriptions, currentStreak: 7 };
        expect(generateInsights(data).length).toBe(MAX_INSIGHTS);
    });
});
