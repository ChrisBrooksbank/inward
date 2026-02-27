import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { playerStore, currentPhase, exerciseProgress, phaseProgress } from './player';
import { DB_NAME, resetDb, getAllSessions } from '$lib/db';

// Exercise IDs from seed data
const BEGINNER_ID = '00000000-0000-4000-8000-000000000001'; // Quick Body Scan (7 phases)
const UNKNOWN_ID = 'ffffffff-ffff-4fff-bfff-ffffffffffff';

async function deleteTestDb(): Promise<void> {
    return new Promise<void>(resolve => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
    });
}

beforeEach(async () => {
    // Reset DB before each test.
    // fake-indexeddb uses setTimeout(fn,0) internally, so we avoid fake timers here.
    resetDb();
    await deleteTestDb();
    playerStore.reset();
});

// =============================================================================
// Initial state
// =============================================================================

describe('initial state', () => {
    it('starts as idle', () => {
        expect(get(playerStore).state).toBe('idle');
    });

    it('starts with no exercise', () => {
        expect(get(playerStore).exercise).toBeNull();
    });

    it('starts with phase index 0', () => {
        expect(get(playerStore).currentPhaseIndex).toBe(0);
    });

    it('starts with no error', () => {
        expect(get(playerStore).error).toBeNull();
    });

    it('starts with empty descriptions', () => {
        expect(get(playerStore).descriptions).toHaveLength(0);
    });
});

// =============================================================================
// load()
// =============================================================================

describe('load()', () => {
    it('transitions to ready on success', async () => {
        await playerStore.load(BEGINNER_ID);
        expect(get(playerStore).state).toBe('ready');
    });

    it('sets exercise on success', async () => {
        await playerStore.load(BEGINNER_ID);
        expect(get(playerStore).exercise?.id).toBe(BEGINNER_ID);
    });

    it('sets phase time to first phase duration', async () => {
        await playerStore.load(BEGINNER_ID);
        const s = get(playerStore);
        expect(s.phaseTimeRemaining).toBe(s.exercise?.phases[0].durationSeconds);
    });

    it('sets sessionId on success', async () => {
        await playerStore.load(BEGINNER_ID);
        expect(get(playerStore).sessionId).toBeTruthy();
    });

    it('sets startedAt on success', async () => {
        await playerStore.load(BEGINNER_ID);
        expect(get(playerStore).startedAt).toBeInstanceOf(Date);
    });

    it('clears descriptions on load', async () => {
        await playerStore.load(BEGINNER_ID);
        expect(get(playerStore).descriptions).toHaveLength(0);
    });

    it('transitions to error for unknown exercise', async () => {
        await playerStore.load(UNKNOWN_ID);
        expect(get(playerStore).state).toBe('error');
    });

    it('sets error message for unknown exercise', async () => {
        await playerStore.load(UNKNOWN_ID);
        expect(get(playerStore).error).toContain(UNKNOWN_ID);
    });

    it('clears previous error on new load', async () => {
        await playerStore.load(UNKNOWN_ID);
        await playerStore.load(BEGINNER_ID);
        expect(get(playerStore).error).toBeNull();
    });
});

// =============================================================================
// State transitions
// =============================================================================

describe('state transitions', () => {
    beforeEach(async () => {
        await playerStore.load(BEGINNER_ID);
    });

    it('start() transitions ready → playing', () => {
        playerStore.start();
        expect(get(playerStore).state).toBe('playing');
    });

    it('pause() transitions playing → paused', () => {
        playerStore.start();
        playerStore.pause();
        expect(get(playerStore).state).toBe('paused');
    });

    it('resume() transitions paused → playing', () => {
        playerStore.start();
        playerStore.pause();
        playerStore.resume();
        expect(get(playerStore).state).toBe('playing');
    });

    it('exit() transitions to abandoned', async () => {
        playerStore.start();
        await playerStore.exit();
        expect(get(playerStore).state).toBe('abandoned');
    });

    it('exit() saves session to IndexedDB', async () => {
        playerStore.start();
        await playerStore.exit();
        const sessions = await getAllSessions();
        expect(sessions).toHaveLength(1);
        expect(sessions[0].state).toBe('abandoned');
    });

    it('reset() returns to idle', () => {
        playerStore.start();
        playerStore.reset();
        expect(get(playerStore).state).toBe('idle');
    });

    it('reset() clears exercise', () => {
        playerStore.reset();
        expect(get(playerStore).exercise).toBeNull();
    });
});

// =============================================================================
// Timer behavior (uses fake timers — no DB operations here)
// =============================================================================

describe('timer', () => {
    beforeEach(async () => {
        vi.useFakeTimers();
        // load() has no DB ops — it only reads from SEED_EXERCISES
        await playerStore.load(BEGINNER_ID);
        playerStore.start();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('decrements phaseTimeRemaining each second', () => {
        const before = get(playerStore).phaseTimeRemaining;
        vi.advanceTimersByTime(1000);
        expect(get(playerStore).phaseTimeRemaining).toBe(before - 1);
    });

    it('does not decrement when paused', () => {
        playerStore.pause();
        const before = get(playerStore).phaseTimeRemaining;
        vi.advanceTimersByTime(3000);
        expect(get(playerStore).phaseTimeRemaining).toBe(before);
    });

    it('advances to next phase when timer expires', () => {
        const time = get(playerStore).phaseTimeRemaining;
        vi.advanceTimersByTime(time * 1000);
        expect(get(playerStore).currentPhaseIndex).toBe(1);
    });

    it('sets new phase duration after phase advance', () => {
        const s = get(playerStore);
        const nextDuration = s.exercise!.phases[1].durationSeconds;
        vi.advanceTimersByTime(s.phaseTimeRemaining * 1000);
        expect(get(playerStore).phaseTimeRemaining).toBe(nextDuration);
    });

    it('does not advance when paused and resumed', () => {
        vi.advanceTimersByTime(2000);
        playerStore.pause();
        const remaining = get(playerStore).phaseTimeRemaining;
        vi.advanceTimersByTime(5000); // should not change while paused
        playerStore.resume();
        expect(get(playerStore).phaseTimeRemaining).toBe(remaining);
    });

    it('phaseProgress increases as time passes', () => {
        vi.advanceTimersByTime(1000);
        expect(get(phaseProgress)).toBeGreaterThan(0);
    });
});

// =============================================================================
// skipPhase()
// =============================================================================

describe('skipPhase()', () => {
    beforeEach(async () => {
        await playerStore.load(BEGINNER_ID);
        playerStore.start();
    });

    it('advances to next phase', () => {
        playerStore.skipPhase();
        expect(get(playerStore).currentPhaseIndex).toBe(1);
    });

    it('sets correct duration for new phase', () => {
        playerStore.skipPhase();
        const s = get(playerStore);
        expect(s.phaseTimeRemaining).toBe(s.exercise!.phases[1].durationSeconds);
    });

    it('skipping all phases transitions to completed', () => {
        const totalPhases = get(playerStore).exercise!.phases.length;
        for (let i = 0; i < totalPhases; i++) {
            playerStore.skipPhase();
        }
        expect(get(playerStore).state).toBe('completed');
    });
});

// =============================================================================
// recordDescription() and recordEmotion()
// =============================================================================

describe('recordDescription()', () => {
    beforeEach(async () => {
        await playerStore.load(BEGINNER_ID);
    });

    it('adds description to list', () => {
        playerStore.recordDescription('p1', 'warm tingling', 'hands');
        expect(get(playerStore).descriptions).toHaveLength(1);
    });

    it('stores correct text', () => {
        playerStore.recordDescription('p1', 'warm tingling', 'hands');
        expect(get(playerStore).descriptions[0].text).toBe('warm tingling');
    });

    it('stores body region', () => {
        playerStore.recordDescription('p1', 'warm tingling', 'hands');
        expect(get(playerStore).descriptions[0].bodyRegion).toBe('hands');
    });

    it('accumulates multiple descriptions', () => {
        playerStore.recordDescription('p1', 'warm', 'hands');
        playerStore.recordDescription('p2', 'tingling', 'heart');
        expect(get(playerStore).descriptions).toHaveLength(2);
    });
});

describe('recordEmotion()', () => {
    beforeEach(async () => {
        await playerStore.load(BEGINNER_ID);
    });

    it('adds emotion connection', () => {
        playerStore.recordEmotion('p1', 'anxious', 'heart');
        expect(get(playerStore).emotionConnections).toHaveLength(1);
    });

    it('stores correct emotion', () => {
        playerStore.recordEmotion('p1', 'anxious', 'heart');
        expect(get(playerStore).emotionConnections[0].emotion).toBe('anxious');
    });
});

// =============================================================================
// Exercise completion (state only — DB persistence tested via exit())
// =============================================================================

describe('completion', () => {
    it('transitions to completed after all phases skipped', async () => {
        await playerStore.load(BEGINNER_ID);
        playerStore.start();
        const totalPhases = get(playerStore).exercise!.phases.length;
        for (let i = 0; i < totalPhases; i++) {
            playerStore.skipPhase();
        }
        expect(get(playerStore).state).toBe('completed');
    });

    it('state remains completed after completion', async () => {
        await playerStore.load(BEGINNER_ID);
        playerStore.start();
        const totalPhases = get(playerStore).exercise!.phases.length;
        for (let i = 0; i < totalPhases; i++) {
            playerStore.skipPhase();
        }
        // State is completed, currentPhaseIndex stays at last valid index
        expect(get(playerStore).state).toBe('completed');
    });
});

// =============================================================================
// Derived stores
// =============================================================================

describe('currentPhase', () => {
    it('returns null when idle', () => {
        expect(get(currentPhase)).toBeNull();
    });

    it('returns first phase after load', async () => {
        await playerStore.load(BEGINNER_ID);
        expect(get(currentPhase)?.type).toBe('instruction');
    });

    it('updates when phase advances', async () => {
        await playerStore.load(BEGINNER_ID);
        playerStore.start();
        const firstId = get(currentPhase)?.id;
        playerStore.skipPhase();
        expect(get(currentPhase)?.id).not.toBe(firstId);
    });
});

describe('exerciseProgress', () => {
    it('returns zero total when idle', () => {
        expect(get(exerciseProgress).total).toBe(0);
    });

    it('returns correct total after load', async () => {
        await playerStore.load(BEGINNER_ID);
        const s = get(playerStore);
        expect(get(exerciseProgress).total).toBe(s.exercise?.phases.length);
    });

    it('current starts at 1 after load', async () => {
        await playerStore.load(BEGINNER_ID);
        expect(get(exerciseProgress).current).toBe(1);
    });

    it('increments current after phase advance', async () => {
        await playerStore.load(BEGINNER_ID);
        playerStore.start();
        playerStore.skipPhase();
        expect(get(exerciseProgress).current).toBe(2);
    });
});

describe('phaseProgress', () => {
    it('returns 0 when idle', () => {
        expect(get(phaseProgress)).toBe(0);
    });

    it('returns 0 at start of phase (full time remaining)', async () => {
        await playerStore.load(BEGINNER_ID);
        playerStore.start();
        // phaseTimeRemaining == durationSeconds → progress = 1 - 1 = 0
        expect(get(phaseProgress)).toBe(0);
    });
});
