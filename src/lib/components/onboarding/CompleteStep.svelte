<script lang="ts">
    import Button from '../Button.svelte';
    import Card from '../Card.svelte';
    import { onboardingStep } from '$lib/stores/onboarding';
    import { goto } from '$app/navigation';

    const nextSteps = [
        {
            icon: '📅',
            title: 'Practice a little each day',
            description: 'Short, regular practice is most effective.',
        },
        {
            icon: '📝',
            title: 'Build your vocabulary',
            description: 'Create words for sensations you notice.',
        },
        {
            icon: '📊',
            title: 'Track your progress',
            description: 'Retake the assessment after a few weeks.',
        },
    ];

    async function handleGoToDashboard(): Promise<void> {
        await onboardingStep.advance();
        await goto('/dashboard');
    }
</script>

<div class="step">
    <div class="step-hero" aria-hidden="true">
        <span class="step-icon">🎉</span>
    </div>

    <h1 class="step-title">You're All Set!</h1>

    <p class="step-description">
        You've taken your first step toward better body awareness. Here's what comes next:
    </p>

    <Card>
        <ul class="next-steps-list" aria-label="Suggested next steps">
            {#each nextSteps as item}
                <li class="next-step">
                    <span class="next-step-icon" aria-hidden="true">{item.icon}</span>
                    <div class="next-step-content">
                        <p class="next-step-title">{item.title}</p>
                        <p class="next-step-description">{item.description}</p>
                    </div>
                </li>
            {/each}
        </ul>
    </Card>

    <div class="step-actions">
        <Button onclick={handleGoToDashboard}>Go to Dashboard</Button>
    </div>
</div>

<style>
    .step {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
        align-items: center;
        text-align: center;
    }

    .step-hero {
        margin-top: 0.5rem;
    }

    .step-icon {
        font-size: 3rem;
        line-height: 1;
    }

    .step-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .step-description {
        font-size: 1rem;
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
        max-width: 28rem;
    }

    .next-steps-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        text-align: left;
    }

    .next-step {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .next-step-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
        margin-top: 0.1rem;
    }

    .next-step-content {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .next-step-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .next-step-description {
        font-size: 0.875rem;
        color: #6b7280;
        line-height: 1.5;
        margin: 0;
    }

    .step-actions {
        margin-top: auto;
        width: 100%;
        padding-top: 0.5rem;
    }

    .step-actions :global(.btn) {
        width: 100%;
    }
</style>
