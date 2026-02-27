<script lang="ts">
    import { onMount, untrack } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { playerStore, currentPhase, exerciseProgress, phaseProgress } from '$lib/stores/player';
    import { vocabularyStore, sharedVocabularyStore } from '$lib/stores';
    import { CircularTimer, VocabSuggestionsPanel } from '$lib/components';
    import { getContextualSuggestions } from '$lib/components/vocabulary/vocab-suggestions-panel';
    import type { SensationDescription } from '$lib/types/domain';
    import {
        getPhaseIcon,
        getPhaseLabel,
        requiresInput,
        isMinimalUI,
        getEmotionSuggestions,
        getVocabularySuggestions,
    } from '$lib/core/phaseUtils';

    const id = $derived($page.params.id ?? '');

    // Pending input state for describe/reflect phases
    let pendingDescription = $state('');
    let pendingEmotion = $state<string | null>(null);
    let showExitConfirm = $state(false);

    // Post-exercise emotion tagging (shown on completion screen before "Well done!")
    let showFinalScreen = $state(false);
    let showVocabSuggestions = $state(false);
    let postExerciseEmotion = $state<string | null>(null);

    // Track previous phase index to save pending data on phase change
    let savedPhaseIndex = -1;

    $effect(() => {
        const idx = $playerStore.currentPhaseIndex;
        const exercise = $playerStore.exercise;
        if (idx !== savedPhaseIndex && exercise && savedPhaseIndex >= 0) {
            const prevPhase = exercise.phases[savedPhaseIndex];
            const region = prevPhase.bodyRegion ?? exercise.bodyRegions[0];
            untrack(() => {
                if (prevPhase.type === 'describe' && pendingDescription.trim()) {
                    playerStore.recordDescription(prevPhase.id, pendingDescription.trim(), region);
                }
                if (prevPhase.type === 'reflect' && pendingEmotion) {
                    playerStore.recordEmotion(prevPhase.id, pendingEmotion, region);
                }
                pendingDescription = '';
                pendingEmotion = null;
            });
        }
        savedPhaseIndex = idx;
    });

    onMount(() => {
        void playerStore.load(id);
        void vocabularyStore.init();
        void sharedVocabularyStore.init();
        return () => playerStore.reset();
    });

    function handleStart(): void {
        playerStore.start();
    }

    function handlePause(): void {
        playerStore.pause();
    }

    function handleResume(): void {
        playerStore.resume();
    }

    function handleContinue(): void {
        playerStore.skipPhase();
    }

    function handleSkip(): void {
        playerStore.skipPhase();
    }

    async function handleExit(): Promise<void> {
        showExitConfirm = false;
        await playerStore.exit();
        await goto('/exercises');
    }

    function handleEmotionChip(emotion: string): void {
        pendingEmotion = pendingEmotion === emotion ? null : emotion;
    }

    function handleNoConnection(): void {
        pendingEmotion = null;
        playerStore.skipPhase();
    }

    async function handleRetry(): Promise<void> {
        await playerStore.load(id);
    }

    async function handleFinish(): Promise<void> {
        await goto('/exercises');
    }

    function handleVocabChip(word: string): void {
        if (!pendingDescription.trim()) {
            pendingDescription = word;
        } else {
            pendingDescription = `${pendingDescription.trimEnd()} ${word}`;
        }
    }

    function handlePostEmotionChip(emotion: string): void {
        postExerciseEmotion = postExerciseEmotion === emotion ? null : emotion;
    }

    async function handleSavePostEmotion(): Promise<void> {
        if (postExerciseEmotion) {
            await playerStore.addPostExerciseEmotion(postExerciseEmotion);
        }
        showVocabSuggestions = true;
    }

    async function handleVocabAdd(desc: SensationDescription): Promise<void> {
        await vocabularyStore.add(desc);
    }

    function handleVocabDone(): void {
        showVocabSuggestions = false;
        showFinalScreen = true;
    }

    const ps = $derived($playerStore);
    const phase = $derived($currentPhase);
    const progress = $derived($exerciseProgress);
    const phaseProg = $derived($phaseProgress);
    const emotionSuggestions = $derived(getEmotionSuggestions(phase?.bodyRegion));
    const describeRegion = $derived(phase?.bodyRegion ?? ps.exercise?.bodyRegions[0]);
    const vocabSuggestions = $derived(getVocabularySuggestions(describeRegion));
    const completionEmotions = $derived(getEmotionSuggestions(ps.exercise?.bodyRegions[0]));
    const vocabPanelSuggestions = $derived(
        getContextualSuggestions(
            ps.exercise?.bodyRegions ?? [],
            $sharedVocabularyStore,
            $vocabularyStore
        )
    );
    const progressBarWidth = $derived(
        progress.total > 0 ? ((progress.current - 1 + phaseProg) / progress.total) * 100 : 0
    );
</script>

<svelte:head>
    <title>{ps.exercise?.name ?? 'Exercise'} – Inward</title>
</svelte:head>

<div class="player" aria-live="polite">
    <!-- ── LOADING ─────────────────────────────────── -->
    {#if ps.state === 'loading' || ps.state === 'idle'}
        <div class="center-screen">
            <p class="muted">Loading exercise…</p>
        </div>

        <!-- ── ERROR ──────────────────────────────────── -->
    {:else if ps.state === 'error'}
        <div class="center-screen">
            <span class="phase-icon" aria-hidden="true">⚠️</span>
            <h1 class="screen-title">Something went wrong</h1>
            <p class="muted">{ps.error ?? "We couldn't load this exercise."}</p>
            <div class="btn-stack">
                <button class="btn btn-primary" onclick={handleRetry}>Try Again</button>
                <a href="/exercises" class="btn btn-ghost">Return to Exercises</a>
            </div>
        </div>

        <!-- ── COMPLETED ──────────────────────────────── -->
    {:else if ps.state === 'completed'}
        {#if !showVocabSuggestions && !showFinalScreen}
            <div class="center-screen">
                <span class="phase-icon" aria-hidden="true">💭</span>
                <h1 class="screen-title">How did that feel?</h1>
                <p class="muted">Tag any emotion present during this exercise.</p>
                <div class="emotion-chips" role="group" aria-label="Overall emotion suggestions">
                    {#each completionEmotions as emotion (emotion)}
                        <button
                            class="chip"
                            class:active={postExerciseEmotion === emotion}
                            aria-pressed={postExerciseEmotion === emotion}
                            onclick={() => handlePostEmotionChip(emotion)}>{emotion}</button
                        >
                    {/each}
                </div>
                <div class="btn-stack">
                    <button class="btn btn-primary" onclick={handleSavePostEmotion}>
                        {postExerciseEmotion ? 'Save' : 'Skip'}
                    </button>
                </div>
            </div>
        {:else if showVocabSuggestions}
            <VocabSuggestionsPanel
                suggestions={vocabPanelSuggestions}
                exerciseId={ps.exercise?.id ?? ''}
                sessionId={ps.sessionId ?? ''}
                onAdd={handleVocabAdd}
                onDone={handleVocabDone}
            />
        {:else}
            <div class="center-screen">
                <span class="phase-icon" aria-hidden="true">✅</span>
                <h1 class="screen-title">Well done!</h1>
                <p class="muted">You completed <strong>{ps.exercise?.name}</strong>.</p>
                <div class="btn-stack">
                    <button class="btn btn-primary" onclick={handleFinish}>Done</button>
                </div>
            </div>
        {/if}

        <!-- ── ABANDONED ─────────────────────────────── -->
    {:else if ps.state === 'abandoned'}
        <div class="center-screen">
            <span class="phase-icon" aria-hidden="true">💾</span>
            <h1 class="screen-title">Progress saved</h1>
            <p class="muted">Your session has been saved.</p>
            <div class="btn-stack">
                <a href="/exercises" class="btn btn-primary">Return to Exercises</a>
            </div>
        </div>

        <!-- ── READY ─────────────────────────────────── -->
    {:else if ps.state === 'ready'}
        <div class="center-screen">
            <span class="phase-icon" aria-hidden="true">🎯</span>
            <h1 class="screen-title">{ps.exercise?.name}</h1>
            <p class="exercise-desc">{ps.exercise?.description}</p>
            <p class="muted">
                {progress.total} phases · {Math.round(
                    (ps.exercise?.totalDurationSeconds ?? 0) / 60
                )} min
            </p>
            <button class="btn btn-primary" onclick={handleStart}>Start Exercise</button>
        </div>

        <!-- ── PLAYING / PAUSED ───────────────────────── -->
    {:else if (ps.state === 'playing' || ps.state === 'paused') && phase}
        <div class="exercise-layout">
            <!-- Header -->
            <header class="ex-header">
                <button
                    class="icon-btn"
                    aria-label="Exit exercise"
                    onclick={() => (showExitConfirm = true)}>✕</button
                >
                <span class="ex-title">{ps.exercise?.name}</span>
                <button
                    class="icon-btn"
                    aria-label={ps.state === 'paused' ? 'Resume exercise' : 'Pause exercise'}
                    onclick={ps.state === 'paused' ? handleResume : handlePause}
                    >{ps.state === 'paused' ? '▶' : '⏸'}</button
                >
            </header>

            <!-- Phase content -->
            <main class="phase-area" class:minimal={isMinimalUI(phase.type)}>
                <span class="phase-icon" aria-hidden="true">{getPhaseIcon(phase.type)}</span>
                <p class="phase-label">{getPhaseLabel(phase.type)}</p>
                <p class="phase-instruction">{phase.instruction}</p>

                <!-- Describe phase: text input + vocabulary suggestions -->
                {#if phase.type === 'describe'}
                    <textarea
                        class="description-input"
                        placeholder="Describe what you notice…"
                        maxlength="200"
                        bind:value={pendingDescription}
                        aria-label="Describe your sensation"
                    ></textarea>
                    {#if pendingDescription.length > 150}
                        <p class="char-count">{200 - pendingDescription.length} characters left</p>
                    {/if}
                    <div class="emotion-chips" role="group" aria-label="Vocabulary suggestions">
                        {#each vocabSuggestions as word (word)}
                            <button
                                class="chip"
                                onclick={() => handleVocabChip(word)}
                                aria-label="Add {word} to description">{word}</button
                            >
                        {/each}
                    </div>

                    <!-- Reflect phase: emotion chips + custom input -->
                {:else if phase.type === 'reflect'}
                    <div class="emotion-chips" role="group" aria-label="Emotion suggestions">
                        {#each emotionSuggestions as emotion (emotion)}
                            <button
                                class="chip"
                                class:active={pendingEmotion === emotion}
                                aria-pressed={pendingEmotion === emotion}
                                onclick={() => handleEmotionChip(emotion)}>{emotion}</button
                            >
                        {/each}
                    </div>
                    <input
                        class="emotion-input"
                        type="text"
                        placeholder="Or describe in your own words…"
                        maxlength="50"
                        bind:value={pendingEmotion as string}
                        aria-label="Describe emotion in your own words"
                    />
                {/if}
            </main>

            <!-- Timer -->
            <div class="timer-area">
                <CircularTimer
                    remainingSeconds={ps.phaseTimeRemaining}
                    totalSeconds={phase.durationSeconds}
                    isPaused={ps.state === 'paused'}
                    minimal={isMinimalUI(phase.type)}
                />
            </div>

            <!-- Progress bar -->
            <div class="progress-bar-wrap" aria-label="Exercise progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {progressBarWidth}%"></div>
                </div>
                <p class="progress-label">Phase {progress.current} of {progress.total}</p>
            </div>

            <!-- Phase controls -->
            <div class="phase-controls">
                {#if phase.type === 'reflect'}
                    <button class="btn btn-ghost" onclick={handleNoConnection}>No connection</button
                    >
                    <button class="btn btn-primary" onclick={handleContinue}>Continue</button>
                {:else if requiresInput(phase.type)}
                    <button class="btn btn-primary" onclick={handleContinue}>Continue</button>
                {:else if !isMinimalUI(phase.type)}
                    <button class="btn btn-ghost btn-skip" onclick={handleSkip}>Skip</button>
                {/if}
            </div>
        </div>

        <!-- Paused overlay -->
        {#if ps.state === 'paused'}
            <div
                class="paused-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Exercise paused"
            >
                <span class="pause-icon" aria-hidden="true">⏸</span>
                <h2 class="screen-title">Paused</h2>
                <p class="muted">Take your time. Resume when you're ready.</p>
                <div class="btn-stack">
                    <button class="btn btn-primary" onclick={handleResume}>Resume</button>
                    <button class="btn btn-ghost" onclick={() => (showExitConfirm = true)}
                        >End Exercise Early</button
                    >
                </div>
            </div>
        {/if}
    {/if}

    <!-- Exit confirmation dialog -->
    {#if showExitConfirm}
        <div
            class="paused-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="End exercise confirmation"
        >
            <h2 class="screen-title">End Exercise?</h2>
            <p class="muted">You've completed {progress.current - 1} of {progress.total} phases.</p>
            <p class="muted">Your progress will be saved.</p>
            <div class="btn-stack">
                <button class="btn btn-primary" onclick={() => (showExitConfirm = false)}
                    >Continue Exercise</button
                >
                <button class="btn btn-ghost" onclick={handleExit}>End and Save</button>
            </div>
        </div>
    {/if}
</div>

<style>
    .player {
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
        background: #ffffff;
    }

    /* ── Shared layout ──────────────────── */
    .center-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        flex: 1;
        padding: 2rem 1.5rem;
        text-align: center;
    }

    .screen-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .exercise-desc {
        font-size: 0.9375rem;
        color: #374151;
        line-height: 1.6;
        max-width: 340px;
        margin: 0;
    }

    .muted {
        font-size: 0.9375rem;
        color: #6b7280;
        margin: 0;
        line-height: 1.5;
    }

    .phase-icon {
        font-size: 2.5rem;
        line-height: 1;
    }

    /* ── Exercise layout ────────────────── */
    .exercise-layout {
        display: flex;
        flex-direction: column;
        min-height: 100dvh;
    }

    /* ── Header ─────────────────────────── */
    .ex-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .ex-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #111827;
        flex: 1;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 0.5rem;
    }

    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        min-height: 44px;
        border: none;
        background: transparent;
        font-size: 1.125rem;
        cursor: pointer;
        border-radius: 0.5rem;
        color: #374151;
    }

    .icon-btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .icon-btn:hover {
        background: #f3f4f6;
    }

    /* ── Phase area ─────────────────────── */
    .phase-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.875rem;
        flex: 1;
        padding: 1.5rem 1.5rem 1rem;
        text-align: center;
    }

    .phase-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin: 0;
    }

    .phase-instruction {
        font-size: 1.125rem;
        color: #111827;
        line-height: 1.6;
        max-width: 320px;
        margin: 0;
    }

    .minimal .phase-instruction {
        color: #374151;
        font-size: 1rem;
    }

    /* ── Describe input ─────────────────── */
    .description-input {
        width: 100%;
        max-width: 400px;
        min-height: 80px;
        padding: 0.75rem;
        border: 1.5px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 1rem;
        color: #111827;
        resize: vertical;
        font-family: inherit;
        line-height: 1.5;
    }

    .description-input:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
        border-color: #4f46e5;
    }

    .char-count {
        font-size: 0.75rem;
        color: #9ca3af;
        margin: 0;
        align-self: flex-end;
        max-width: 400px;
        width: 100%;
        text-align: right;
    }

    /* ── Reflect chips ──────────────────── */
    .emotion-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
        max-width: 360px;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.375rem 0.875rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border: 1.5px solid #d1d5db;
        background: #ffffff;
        color: #374151;
        transition:
            background-color 0.12s,
            border-color 0.12s,
            color 0.12s;
    }

    .chip:hover:not(.active) {
        background: #f3f4f6;
        border-color: #9ca3af;
    }

    .chip:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .chip.active {
        background: #4f46e5;
        border-color: #4f46e5;
        color: #ffffff;
    }

    .emotion-input {
        width: 100%;
        max-width: 400px;
        height: 44px;
        padding: 0 0.75rem;
        border: 1.5px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 1rem;
        color: #111827;
        font-family: inherit;
    }

    .emotion-input:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
        border-color: #4f46e5;
    }

    /* ── Timer ──────────────────────────── */
    .timer-area {
        display: flex;
        justify-content: center;
        padding: 0.75rem 1rem;
    }

    /* ── Progress bar ───────────────────── */
    .progress-bar-wrap {
        padding: 0 1rem 0.25rem;
    }

    .progress-bar {
        height: 6px;
        background: #e5e7eb;
        border-radius: 9999px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: #4f46e5;
        border-radius: 9999px;
        transition: width 0.5s ease;
    }

    @media (prefers-reduced-motion: reduce) {
        .progress-fill {
            transition: none;
        }
    }

    .progress-label {
        font-size: 0.75rem;
        color: #9ca3af;
        text-align: right;
        margin: 0.25rem 0 0;
    }

    /* ── Phase controls ─────────────────── */
    .phase-controls {
        display: flex;
        gap: 0.75rem;
        padding: 0.75rem 1rem 1.25rem;
        justify-content: flex-end;
    }

    /* ── Buttons ────────────────────────── */
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        min-width: 44px;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        border: 2px solid transparent;
        text-decoration: none;
        font-family: inherit;
        transition:
            background-color 0.12s,
            color 0.12s,
            border-color 0.12s;
    }

    .btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .btn-primary {
        background: #4f46e5;
        color: #ffffff;
        border-color: #4f46e5;
        width: 100%;
    }

    .btn-primary:hover {
        background: #4338ca;
        border-color: #4338ca;
    }

    .btn-ghost {
        background: transparent;
        color: #374151;
        border-color: transparent;
    }

    .btn-ghost:hover {
        background: #f3f4f6;
    }

    .btn-skip {
        font-size: 0.875rem;
        color: #9ca3af;
    }

    .btn-stack {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        max-width: 320px;
    }

    /* ── Paused / confirm overlay ───────── */
    .paused-overlay {
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.97);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem 1.5rem;
        text-align: center;
        z-index: 10;
    }

    .pause-icon {
        font-size: 3rem;
        line-height: 1;
    }
</style>
