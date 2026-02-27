/**
 * Exercise player state machine store.
 * States: idle → loading → ready → playing → paused → completed/abandoned/error
 */

import { writable, derived, get } from 'svelte/store';
import type { BodyRegion, Exercise, ExerciseSession, SessionState } from '$lib/types/domain';
import { SEED_EXERCISES } from '$lib/core/exercises';
import { putSession } from '$lib/db';

// =============================================================================
// Types
// =============================================================================

type PlayerState =
    | 'idle'
    | 'loading'
    | 'ready'
    | 'playing'
    | 'paused'
    | 'completed'
    | 'abandoned'
    | 'error';

type PhaseDescEntry = ExerciseSession['descriptions'][number];
type EmotionConnEntry = ExerciseSession['emotionConnections'][number];

interface PlayerStoreState {
    state: PlayerState;
    exercise: Exercise | null;
    currentPhaseIndex: number;
    phaseTimeRemaining: number;
    sessionId: string | null;
    startedAt: Date | null;
    descriptions: PhaseDescEntry[];
    emotionConnections: EmotionConnEntry[];
    error: string | null;
}

// =============================================================================
// State helpers (pure functions, no closures)
// =============================================================================

function makeInitialState(): PlayerStoreState {
    return {
        state: 'idle',
        exercise: null,
        currentPhaseIndex: 0,
        phaseTimeRemaining: 0,
        sessionId: null,
        startedAt: null,
        descriptions: [],
        emotionConnections: [],
        error: null,
    };
}

function findExercise(exerciseId: string): Exercise | undefined {
    return SEED_EXERCISES.find(e => e.id === exerciseId);
}

function makeReadyState(s: PlayerStoreState, exercise: Exercise): PlayerStoreState {
    return {
        ...s,
        state: 'ready',
        exercise,
        currentPhaseIndex: 0,
        phaseTimeRemaining: exercise.phases[0].durationSeconds,
        sessionId: crypto.randomUUID(),
        startedAt: new Date(),
        descriptions: [],
        emotionConnections: [],
        error: null,
    };
}

function makeAdvancedState(s: PlayerStoreState): PlayerStoreState {
    if (!s.exercise) return s;
    const nextIndex = s.currentPhaseIndex + 1;
    if (nextIndex >= s.exercise.phases.length) {
        return { ...s, state: 'completed' };
    }
    return {
        ...s,
        currentPhaseIndex: nextIndex,
        phaseTimeRemaining: s.exercise.phases[nextIndex].durationSeconds,
    };
}

function buildSession(s: PlayerStoreState, finalState: SessionState): ExerciseSession {
    const exercise = s.exercise as Exercise;
    return {
        id: s.sessionId ?? crypto.randomUUID(),
        exerciseId: exercise.id,
        state: finalState,
        startedAt: s.startedAt ?? new Date(),
        completedAt: new Date(),
        phasesCompleted: s.currentPhaseIndex,
        totalPhases: exercise.phases.length,
        descriptions: s.descriptions,
        emotionConnections: s.emotionConnections,
    };
}

async function persistSession(s: PlayerStoreState, state: SessionState): Promise<void> {
    if (!s.exercise || !s.sessionId) return;
    await putSession(buildSession(s, state));
}

// =============================================================================
// Store factory
// =============================================================================

function createPlayerStore() {
    const { subscribe, set, update } = writable<PlayerStoreState>(makeInitialState());
    let timer: ReturnType<typeof setInterval> | null = null;

    const stopTimer = (): void => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    const doAdvance = (): void => {
        update(s => makeAdvancedState(s));
        const s = get(playerStore);
        if (s.state === 'completed') {
            stopTimer();
            void persistSession(s, 'completed');
        }
    };

    const onTick = (): void => {
        let shouldAdvance = false;
        update(s => {
            if (s.state !== 'playing') return s;
            if (s.phaseTimeRemaining <= 1) {
                shouldAdvance = true;
                return s;
            }
            return { ...s, phaseTimeRemaining: s.phaseTimeRemaining - 1 };
        });
        if (shouldAdvance) doAdvance();
    };

    const startTimer = (): void => {
        stopTimer();
        timer = setInterval(onTick, 1000);
    };

    return {
        subscribe,

        async load(exerciseId: string): Promise<void> {
            update(s => ({ ...s, state: 'loading', error: null }));
            try {
                const exercise = findExercise(exerciseId);
                if (!exercise) throw new Error(`Exercise not found: ${exerciseId}`);
                update(s => makeReadyState(s, exercise));
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                update(s => ({ ...s, state: 'error', error: msg }));
            }
        },

        start(): void {
            update(s => ({ ...s, state: 'playing' }));
            startTimer();
        },

        pause(): void {
            stopTimer();
            update(s => ({ ...s, state: 'paused' }));
        },

        resume(): void {
            update(s => ({ ...s, state: 'playing' }));
            startTimer();
        },

        skipPhase(): void {
            doAdvance();
        },

        recordDescription(phaseId: string, text: string, bodyRegion: BodyRegion): void {
            const entry: PhaseDescEntry = { phaseId, text, bodyRegion, timestamp: new Date() };
            update(s => ({ ...s, descriptions: [...s.descriptions, entry] }));
        },

        recordEmotion(phaseId: string, emotion: string, bodyRegion: BodyRegion): void {
            const entry: EmotionConnEntry = { phaseId, emotion, bodyRegion, timestamp: new Date() };
            update(s => ({ ...s, emotionConnections: [...s.emotionConnections, entry] }));
        },

        async exit(): Promise<void> {
            stopTimer();
            const s = get(playerStore);
            await persistSession(s, 'abandoned');
            update(st => ({ ...st, state: 'abandoned' }));
        },

        reset(): void {
            stopTimer();
            set(makeInitialState());
        },
    };
}

export const playerStore = createPlayerStore();

// =============================================================================
// Derived stores
// =============================================================================

export const currentPhase = derived(
    playerStore,
    $p => $p.exercise?.phases[$p.currentPhaseIndex] ?? null
);

export const exerciseProgress = derived(playerStore, $p => {
    if (!$p.exercise) return { current: 0, total: 0, percentage: 0 };
    const total = $p.exercise.phases.length;
    const current = $p.currentPhaseIndex + 1;
    return { current, total, percentage: (current / total) * 100 };
});

export const phaseProgress = derived(playerStore, $p => {
    const phase = $p.exercise?.phases[$p.currentPhaseIndex];
    if (!phase) return 0;
    return 1 - $p.phaseTimeRemaining / phase.durationSeconds;
});
