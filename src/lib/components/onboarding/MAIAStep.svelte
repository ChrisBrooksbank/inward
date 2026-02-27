<script lang="ts">
    import Button from '../Button.svelte';
    import { onboardingStep } from '$lib/stores/onboarding';
    import { MAIA_QUESTIONS, scoreMaiaAssessment } from '$lib/core/maia';
    import { putAssessment } from '$lib/db';
    import type { MAIASubscale, MAIAAssessment } from '$lib/types/domain';

    export const SUBSCALE_LABELS: Record<MAIASubscale, string> = {
        noticing: 'Noticing',
        'not-distracting': 'Not Distracting',
        'not-worrying': 'Not Worrying',
        'attention-regulation': 'Attention Regulation',
        'emotional-awareness': 'Emotional Awareness',
        'self-regulation': 'Self-Regulation',
        'body-listening': 'Body Listening',
        trusting: 'Trusting',
    };

    export const SUBSCALE_ORDER: MAIASubscale[] = [
        'noticing',
        'not-distracting',
        'not-worrying',
        'attention-regulation',
        'emotional-awareness',
        'self-regulation',
        'body-listening',
        'trusting',
    ];

    export const LIKERT_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often', 'Always'];

    const questionGroups = SUBSCALE_ORDER.map(subscale => ({
        subscale,
        label: SUBSCALE_LABELS[subscale],
        questions: MAIA_QUESTIONS.filter(q => q.subscale === subscale),
    }));

    const responses = $state<number[]>(Array(37).fill(-1));
    let saving = $state(false);

    const answeredCount = $derived(responses.filter(r => r >= 0).length);
    const isComplete = $derived(answeredCount === 37);

    function setResponse(questionIndex: number, value: number): void {
        responses[questionIndex] = value;
    }

    async function handleSkip(): Promise<void> {
        await onboardingStep.advance();
    }

    async function handleBack(): Promise<void> {
        await onboardingStep.back();
    }

    async function handleSave(): Promise<void> {
        saving = true;
        const now = new Date();
        const scores = scoreMaiaAssessment([...responses], now);
        const assessment: MAIAAssessment = {
            id: crypto.randomUUID(),
            responses: [...responses],
            scores,
            completedAt: now,
        };
        await putAssessment(assessment);
        await onboardingStep.advance();
        saving = false;
    }
</script>

<div class="step">
    <button class="back-btn" onclick={handleBack} aria-label="Go back to Privacy and Data">
        ← Back
    </button>

    <div class="step-header">
        <h1 class="step-title">Optional Baseline Assessment</h1>
        <p class="step-description">
            These 37 questions help measure your current interoceptive awareness. There are no right
            or wrong answers. You can skip this and take it later.
        </p>
        <p class="progress-note" aria-live="polite">
            {answeredCount} of 37 answered
        </p>
    </div>

    <form class="questionnaire" novalidate>
        {#each questionGroups as group}
            <section class="subscale-group" aria-labelledby="subscale-{group.subscale}">
                <h2 class="subscale-title" id="subscale-{group.subscale}">{group.label}</h2>

                {#each group.questions as question}
                    <fieldset class="question-fieldset">
                        <legend class="question-text">
                            {question.id}. {question.text}
                        </legend>

                        <div class="likert-scale" role="group" aria-label="Response scale">
                            <span class="scale-label scale-label--start" aria-hidden="true">
                                Never
                            </span>
                            <div class="scale-buttons">
                                {#each LIKERT_LABELS as label, value}
                                    <label class="scale-option">
                                        <input
                                            type="radio"
                                            name="q-{question.id}"
                                            {value}
                                            checked={responses[question.id - 1] === value}
                                            onchange={(): void =>
                                                setResponse(question.id - 1, value)}
                                            aria-label="{label} ({value})"
                                            class="sr-only"
                                        />
                                        <span
                                            class="scale-circle"
                                            class:scale-circle--selected={responses[
                                                question.id - 1
                                            ] === value}
                                            aria-hidden="true"
                                        >
                                            {value}
                                        </span>
                                    </label>
                                {/each}
                            </div>
                            <span class="scale-label scale-label--end" aria-hidden="true">
                                Always
                            </span>
                        </div>
                    </fieldset>
                {/each}
            </section>
        {/each}
    </form>

    <div class="step-actions">
        {#if isComplete}
            <Button onclick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Results'}
            </Button>
        {/if}
        <button class="skip-step-btn" onclick={handleSkip}> Skip this assessment </button>
    </div>
</div>

<style>
    .step {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
        overflow-y: auto;
    }

    .back-btn {
        align-self: flex-start;
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
        flex-shrink: 0;
    }

    .back-btn:hover {
        color: #374151;
    }

    .back-btn:focus-visible {
        outline: 2px solid var(--color-focus, #2563eb);
        outline-offset: 2px;
        border-radius: 0.25rem;
    }

    .step-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .step-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .step-description {
        font-size: 0.95rem;
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
    }

    .progress-note {
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin: 0;
    }

    .questionnaire {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .subscale-group {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .subscale-title {
        font-size: 1rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e5e7eb;
    }

    .question-fieldset {
        border: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .question-text {
        font-size: 0.9rem;
        color: #374151;
        line-height: 1.5;
        padding: 0;
    }

    .likert-scale {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .scale-label {
        font-size: 0.75rem;
        color: #9ca3af;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .scale-buttons {
        display: flex;
        gap: 0.375rem;
        flex: 1;
        justify-content: center;
    }

    .scale-option {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
    }

    .scale-circle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid #d1d5db;
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
        background-color: #ffffff;
        transition:
            background-color 0.15s,
            border-color 0.15s,
            color 0.15s;
        cursor: pointer;
    }

    @media (prefers-reduced-motion: reduce) {
        .scale-circle {
            transition: none;
        }
    }

    .scale-circle--selected {
        background-color: #2563eb;
        border-color: #2563eb;
        color: #ffffff;
    }

    .scale-option:focus-within .scale-circle {
        outline: 2px solid var(--color-focus, #2563eb);
        outline-offset: 2px;
    }

    .step-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding-top: 0.5rem;
        padding-bottom: 1rem;
        flex-shrink: 0;
    }

    .step-actions :global(.btn) {
        width: 100%;
    }

    .skip-step-btn {
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

    .skip-step-btn:hover {
        color: #374151;
    }

    .skip-step-btn:focus-visible {
        outline: 2px solid var(--color-focus, #2563eb);
        outline-offset: 2px;
        border-radius: 0.25rem;
    }
</style>
