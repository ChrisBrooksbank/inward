<script lang="ts">
    import Button from '../Button.svelte';
    import Card from '../Card.svelte';
    import { onboardingStep } from '$lib/stores/onboarding';

    const signals = [
        { icon: '❤️', label: 'Your heartbeat' },
        { icon: '🫁', label: 'Your breathing' },
        { icon: '🤢', label: 'Hunger and fullness' },
        { icon: '🌡️', label: 'Temperature changes' },
        { icon: '😰', label: 'Physical feelings of emotions' },
    ];

    async function handleContinue(): Promise<void> {
        await onboardingStep.advance();
    }

    async function handleBack(): Promise<void> {
        await onboardingStep.back();
    }
</script>

<div class="step">
    <button class="back-btn" onclick={handleBack} aria-label="Go back to Welcome"> ← Back </button>

    <h1 class="step-title">What is Interoception?</h1>

    <p class="step-body">
        You have more than five senses. Beyond sight, sound, smell, taste, and touch, you have a
        sense that detects signals from inside your body.
    </p>

    <p class="step-body step-body--accent">This is called interoception.</p>

    <Card>
        <div class="signals-card">
            <p class="signals-heading">Examples of interoceptive signals:</p>
            <ul class="signals-list" aria-label="Interoceptive signal examples">
                {#each signals as signal}
                    <li class="signal-item">
                        <span class="signal-icon" aria-hidden="true">{signal.icon}</span>
                        <span>{signal.label}</span>
                    </li>
                {/each}
            </ul>
        </div>
    </Card>

    <p class="step-body">
        Some people notice these signals easily. Others find them harder to detect. Both are
        normal—and with practice, anyone can improve.
    </p>

    <div class="step-actions">
        <Button onclick={handleContinue}>Continue</Button>
    </div>
</div>

<style>
    .step {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
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
    }

    .back-btn:hover {
        color: #374151;
    }

    .back-btn:focus-visible {
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

    .step-body {
        font-size: 1rem;
        color: #374151;
        line-height: 1.6;
        margin: 0;
    }

    .step-body--accent {
        font-weight: 600;
        color: #111827;
    }

    .signals-card {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .signals-heading {
        font-size: 0.9rem;
        font-weight: 600;
        color: #374151;
        margin: 0;
    }

    .signals-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .signal-item {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        font-size: 0.9rem;
        color: #374151;
    }

    .signal-icon {
        font-size: 1.1rem;
        width: 1.5rem;
        text-align: center;
        flex-shrink: 0;
    }

    .step-actions {
        margin-top: auto;
        padding-top: 0.5rem;
    }

    .step-actions :global(.btn) {
        width: 100%;
    }
</style>
