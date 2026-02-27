<script lang="ts">
    import Button from '../Button.svelte';
    import Card from '../Card.svelte';
    import { onboardingStep } from '$lib/stores/onboarding';

    const features = [
        {
            icon: '📱',
            title: 'Local First',
            description: 'Your data stays on your device. No account required.',
        },
        {
            icon: '🔒',
            title: 'Private by Default',
            description:
                'Vocabulary you create is private unless you choose to share it anonymously.',
        },
        {
            icon: '🗑️',
            title: 'Easy Deletion',
            description: "Delete all your data any time from Settings. One tap and it's gone.",
        },
        {
            icon: '📤',
            title: 'Export Anytime',
            description: 'Download your data in a standard format.',
        },
    ];

    async function handleContinue(): Promise<void> {
        await onboardingStep.advance();
    }

    async function handleBack(): Promise<void> {
        await onboardingStep.back();
    }
</script>

<div class="step">
    <button class="back-btn" onclick={handleBack} aria-label="Go back to What is Interoception">
        ← Back
    </button>

    <h1 class="step-title">Your Data, Your Control</h1>

    <div class="features-list" role="list">
        {#each features as feature}
            <Card>
                <div class="feature" role="listitem">
                    <span class="feature-icon" aria-hidden="true">{feature.icon}</span>
                    <div class="feature-content">
                        <p class="feature-title">{feature.title}</p>
                        <p class="feature-description">{feature.description}</p>
                    </div>
                </div>
            </Card>
        {/each}
    </div>

    <div class="step-actions">
        <Button onclick={handleContinue}>Continue</Button>
    </div>
</div>

<style>
    .step {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
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

    .features-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .feature {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .feature-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
        margin-top: 0.1rem;
    }

    .feature-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .feature-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .feature-description {
        font-size: 0.875rem;
        color: #6b7280;
        line-height: 1.5;
        margin: 0;
    }

    .step-actions {
        margin-top: auto;
        padding-top: 0.5rem;
    }

    .step-actions :global(.btn) {
        width: 100%;
    }
</style>
