import type { Exercise, ExerciseCategory, DifficultyLevel, BodyRegion } from '$lib/types/domain';

export interface ExerciseFilters {
    category: ExerciseCategory | null;
    difficulty: DifficultyLevel | null;
    bodyRegion: BodyRegion | null;
}

export function filterExercises(exercises: Exercise[], filters: ExerciseFilters): Exercise[] {
    return exercises.filter(exercise => matchesFilters(exercise, filters));
}

function matchesFilters(exercise: Exercise, filters: ExerciseFilters): boolean {
    if (filters.category !== null && exercise.category !== filters.category) return false;
    if (filters.difficulty !== null && exercise.difficulty !== filters.difficulty) return false;
    if (filters.bodyRegion !== null && !exercise.bodyRegions.includes(filters.bodyRegion)) {
        return false;
    }
    return true;
}
