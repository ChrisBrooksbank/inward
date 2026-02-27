/**
 * Builds dashboard view-model from raw session and description data.
 */

import type { ExerciseSession, SensationDescription } from '$lib/types/domain';
import { calculateQuickStats } from '$lib/components/progress/quick-stats';
import type { QuickStatsData } from '$lib/components/progress/quick-stats';
import { SEED_EXERCISES } from '$lib/core/exercises';

export interface RecentSession {
    id: string;
    exerciseName: string;
    completedAt: Date;
    descriptionsCount: number;
}

export interface DashboardData {
    stats: QuickStatsData;
    recentSessions: RecentSession[];
    nextExerciseId: string;
}

function getExerciseName(exerciseId: string): string {
    const exercise = SEED_EXERCISES.find(e => e.id === exerciseId);
    return exercise?.name ?? 'Exercise';
}

export function buildDashboardData(
    sessions: ExerciseSession[],
    descriptions: SensationDescription[]
): DashboardData {
    const stats = calculateQuickStats(sessions, descriptions);

    const completed = sessions
        .filter(s => s.state === 'completed' && s.completedAt)
        .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())
        .slice(0, 3);

    const recentSessions: RecentSession[] = completed.map(s => ({
        id: s.id,
        exerciseName: getExerciseName(s.exerciseId),
        completedAt: s.completedAt!,
        descriptionsCount: s.descriptions.length,
    }));

    const nextExerciseId = SEED_EXERCISES[0]?.id ?? '';

    return { stats, recentSessions, nextExerciseId };
}
