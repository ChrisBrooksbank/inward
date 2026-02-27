/**
 * Insights engine for the Progress dashboard.
 * Generates up to MAX_INSIGHTS actionable insights from user practice data.
 *
 * 8 rules: first-session, new-region, vocab-growth, underexplored-regions,
 *          streak-active, streak-broken, assessment-due, assessment-improvement.
 */

import type {
    ExerciseSession,
    SensationDescription,
    MAIAAssessment,
    BodyRegion,
} from '$lib/types/domain';

export type InsightType = 'celebration' | 'suggestion' | 'pattern' | 'reminder' | 'milestone';
export type InsightPriority = 'high' | 'medium' | 'low';

export interface InsightAction {
    label: string;
    route: string;
}

export interface Insight {
    id: string;
    type: InsightType;
    priority: InsightPriority;
    title: string;
    body: string;
    action?: InsightAction;
}

export interface UserProgressData {
    sessions: ExerciseSession[];
    assessments: MAIAAssessment[];
    descriptions: SensationDescription[];
    currentStreak: number;
}

export const MAX_INSIGHTS = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCompleted(sessions: ExerciseSession[]): ExerciseSession[] {
    return sessions.filter(s => s.state === 'completed');
}

function sortByDate(sessions: ExerciseSession[]): ExerciseSession[] {
    return [...sessions].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
}

function getCoveredRegions(sessions: ExerciseSession[]): Set<BodyRegion> {
    const regions = new Set<BodyRegion>();
    for (const s of sessions) {
        for (const d of s.descriptions) {
            regions.add(d.bodyRegion);
        }
    }
    return regions;
}

function avgScore(assessment: MAIAAssessment): number {
    if (assessment.scores.length === 0) return 0;
    return assessment.scores.reduce((sum, s) => sum + s.score, 0) / assessment.scores.length;
}

function daysSince(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Rule 1: First session completed → celebration
// ---------------------------------------------------------------------------

function checkFirstSession(data: UserProgressData): Insight | null {
    if (getCompleted(data.sessions).length !== 1) return null;
    return {
        id: 'first-session',
        type: 'celebration',
        priority: 'high',
        title: 'First Practice Complete!',
        body: "You've taken your first step toward better body awareness. Keep it up!",
        action: { label: 'Practice Again', route: '/exercises' },
    };
}

// ---------------------------------------------------------------------------
// Rule 2: New body region explored in most recent session → celebration
// ---------------------------------------------------------------------------

function checkNewRegion(data: UserProgressData): Insight | null {
    const completed = sortByDate(getCompleted(data.sessions));
    if (completed.length < 2) return null;
    const latest = completed[completed.length - 1];
    const prevRegions = getCoveredRegions(completed.slice(0, -1));
    const newRegion = latest.descriptions.map(d => d.bodyRegion).find(r => !prevRegions.has(r));
    if (!newRegion) return null;
    return {
        id: 'new-region',
        type: 'celebration',
        priority: 'medium',
        title: 'New Territory!',
        body: `You've explored ${newRegion} for the first time. Your body awareness is growing.`,
    };
}

// ---------------------------------------------------------------------------
// Rule 3: Vocabulary growth milestone → celebration
// ---------------------------------------------------------------------------

function checkVocabGrowth(data: UserProgressData): Insight | null {
    const count = data.descriptions.length;
    const milestones = [5, 10, 25, 50];
    if (!milestones.includes(count)) return null;
    return {
        id: 'vocab-growth',
        type: 'celebration',
        priority: 'medium',
        title: `${count} Words Discovered!`,
        body: `You've built a vocabulary of ${count} sensation descriptions. Each word deepens self-understanding.`,
        action: { label: 'View Your Words', route: '/vocabulary' },
    };
}

// ---------------------------------------------------------------------------
// Rule 4: Underexplored regions after 5+ sessions → suggestion
// ---------------------------------------------------------------------------

function checkUnderexplored(data: UserProgressData): Insight | null {
    const completed = getCompleted(data.sessions);
    if (completed.length < 5) return null;
    const covered = getCoveredRegions(completed);
    if (covered.size >= 4) return null;
    const regionWord = covered.size === 1 ? 'region' : 'regions';
    return {
        id: 'underexplored-regions',
        type: 'suggestion',
        priority: 'medium',
        title: 'Expand Your Practice',
        body: `You've focused on ${covered.size} body ${regionWord}. Try exploring new areas to build fuller awareness.`,
        action: { label: 'Browse Exercises', route: '/exercises' },
    };
}

// ---------------------------------------------------------------------------
// Rule 5: Active streak of 3+ days → pattern (encouragement)
// ---------------------------------------------------------------------------

function checkStreakActive(data: UserProgressData): Insight | null {
    if (data.currentStreak < 3) return null;
    return {
        id: 'streak-active',
        type: 'pattern',
        priority: 'medium',
        title: `${data.currentStreak}-Day Streak`,
        body: `You've practiced ${data.currentStreak} days in a row. Regular practice deepens interoceptive awareness.`,
    };
}

// ---------------------------------------------------------------------------
// Rule 6: Streak broken (sessions exist, streak=0, last was 2+ days ago) → reminder
// ---------------------------------------------------------------------------

function checkStreakBroken(data: UserProgressData): Insight | null {
    const completed = sortByDate(getCompleted(data.sessions));
    if (completed.length === 0 || data.currentStreak > 0) return null;
    const last = completed[completed.length - 1];
    if (!last.completedAt) return null;
    const days = daysSince(last.completedAt);
    if (days < 2) return null;
    return {
        id: 'streak-broken',
        type: 'reminder',
        priority: 'low',
        title: 'Time to Practice',
        body: `It's been ${days} days since your last session. A short practice can help you reconnect.`,
        action: { label: 'Start a Session', route: '/exercises' },
    };
}

// ---------------------------------------------------------------------------
// Rule 7: Assessment due → reminder
// ---------------------------------------------------------------------------

function checkAssessmentDue(data: UserProgressData): Insight | null {
    const completed = getCompleted(data.sessions);
    if (data.assessments.length === 0) {
        if (completed.length < 10) return null;
        return {
            id: 'assessment-due',
            type: 'reminder',
            priority: 'medium',
            title: 'Ready for an Assessment?',
            body: "You've completed enough exercises. A baseline assessment will help track your progress over time.",
            action: { label: 'Take Assessment', route: '/progress/assessment' },
        };
    }
    const sorted = [...data.assessments].sort(
        (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
    );
    if (daysSince(sorted[0].completedAt) < 42) return null;
    return {
        id: 'assessment-due',
        type: 'reminder',
        priority: 'medium',
        title: 'Time for a Check-In',
        body: 'Retaking the assessment will show how your interoceptive awareness has changed.',
        action: { label: 'Take Assessment', route: '/progress/assessment' },
    };
}

// ---------------------------------------------------------------------------
// Rule 8: Assessment score improved vs baseline → milestone
// ---------------------------------------------------------------------------

function checkAssessmentImprovement(data: UserProgressData): Insight | null {
    if (data.assessments.length < 2) return null;
    const sorted = [...data.assessments].sort(
        (a, b) => a.completedAt.getTime() - b.completedAt.getTime()
    );
    const improvement = avgScore(sorted[sorted.length - 1]) - avgScore(sorted[0]);
    if (improvement <= 0.2) return null;
    return {
        id: 'assessment-improvement',
        type: 'milestone',
        priority: 'high',
        title: 'Awareness Growing!',
        body: 'Your interoceptive awareness score has improved since your first assessment. Your practice is making a difference.',
        action: { label: 'View Progress', route: '/progress' },
    };
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

type InsightChecker = (data: UserProgressData) => Insight | null;

// Ordered by priority: high rules first so they fill the 3 slots first
const RULES: InsightChecker[] = [
    checkFirstSession,
    checkAssessmentImprovement,
    checkNewRegion,
    checkVocabGrowth,
    checkUnderexplored,
    checkStreakActive,
    checkAssessmentDue,
    checkStreakBroken,
];

/**
 * Generate up to MAX_INSIGHTS insights from the user's practice data.
 * Rules are evaluated in priority order; the first MAX_INSIGHTS matches are returned.
 */
export function generateInsights(data: UserProgressData): Insight[] {
    const results: Insight[] = [];
    for (const rule of RULES) {
        if (results.length >= MAX_INSIGHTS) break;
        const insight = rule(data);
        if (insight) results.push(insight);
    }
    return results;
}
