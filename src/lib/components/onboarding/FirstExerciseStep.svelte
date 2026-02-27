<script lang="ts">
    import Button from '../Button.svelte';
    import Card from '../Card.svelte';
    import { onboardingStep } from '$lib/stores/onboarding';
    import { goto } from '$app/navigation';

    async function handleStartExercise(): Promise<void> {
        // Exercise player not yet built — advance to complete screen
        await onboardingStep.advance();
    }

    async function handleSkipExercise(): Promise<void> {
        await onboardingStep.advance();
    }

    async function handleBack(): Promise<void> {
        await onboardingStep.back();
    }

    async function handleSkipAll(): Promise<void> {
        await onboardingStep.skip();
        await goto('/dashboard');
    }
</script>

<div class="step">
    <div class="step-nav">
        <button class="back-btn" onclick={handleBack} aria-label="Go back to Baseline Assessment">
            ← Back
        </button>
        <button class="skip-all-btn" onclick={handleSkipAll}>Skip →</button>
    </div>

    <h1 class="step-title">Try Your First Exercise</h1>

    <p class="step-description">
        Let's practice noticing your heartbeat. This exercise takes about 2 minutes.
    </p>

    <Card>
        <div class="exercise-card">
            <span class="exercise-icon" aria-hidden="true">❤️</span>
            <h2 class="exercise-name">Heart After Movement</h2>
            <p class="exercise-description">
                You'll do some brief movement, then notice your heartbeat. Movement makes the signal
                easier to detect.
            </p>
            <div class="exercise-meta" aria-label="Exercise details">
                <span class="meta-item">⏱️ 2 minutes</span>
                <span class="meta-item">🎯 Beginner</span>
                <span class="meta-item">❤️ Heart, Chest</span>
            </div>
        </div>
    </Card>

    <div class="step-actions">
        <Button onclick={handleStartExercise}>Start Exercise</Button>
        <button class="skip-exercise-btn" onclick={handleSkipExercise}>
            I'll try this later →
        </button>
    </div>
</div>

<style>
    .step {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
    }

    .step-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .back-btn {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem 0;
        min-height: 44px;
        display: flex;
        align-items: center;
    }

    .back-btn:hover {
        color: #374151;
    }

    .back-btn:focus-visible {
        outline: 2px solid var(--color-focus, #2563eb);
        outline-offset: 2px;
        border-radius: 0.25rem;
    }

    .skip-all-btn {
        font-size: 0.875rem;
        color: #6b7280;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        min-height: 44px;
        display: flex;
        align-items: center;
    }

    .skip-all-btn:hover {
        color: #374151;
    }

    .skip-all-btn:focus-visible {
        outline: 2px solid var(--color-focus, #2563eb);
        outline-offset: 2px;
        border-radius: 0.25rem;
    }

    .step-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .step-description {
        font-size: 1rem;
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
    }

    .exercise-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        text-align: center;
    }

    .exercise-icon {
        font-size: 2.5rem;
        line-height: 1;
    }

    .exercise-name {
        font-size: 1.125rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .exercise-description {
        font-size: 0.9rem;
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
        max-width: 26rem;
    }

    .exercise-meta {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
        padding-top: 0.25rem;
    }

    .meta-item {
        font-size: 0.875rem;
        color: #374151;
        font-weight: 500;
    }

    .step-actions {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding-top: 0.5rem;
    }

    .step-actions :global(.btn) {
        width: 100%;
    }

    .skip-exercise-btn {
        font-size: 0.875rem;
        color: #6b7280;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        min-height: 44px;
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .skip-exercise-btn:hover {
        color: #374151;
    }

    .skip-exercise-btn:focus-visible {
        outline: 2px solid var(--color-focus, #2563eb);
        outline-offset: 2px;
        border-radius: 0.25rem;
    }
</style>
