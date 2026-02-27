<script lang="ts">
    import Button from '../Button.svelte';
    import { onboardingStep } from '$lib/stores/onboarding';
    import { goto } from '$app/navigation';

    async function handleGetStarted(): Promise<void> {
        await onboardingStep.advance();
    }

    async function handleSkipIntro(): Promise<void> {
        await onboardingStep.skip();
        await goto('/dashboard');
    }
</script>

<div class="welcome-step">
    <div class="welcome-hero" aria-hidden="true">
        <span class="welcome-icon">🌿</span>
    </div>

    <h1 class="welcome-title">Inward</h1>

    <p class="welcome-tagline">Learn to listen to your body.</p>

    <p class="welcome-description">
        Inward helps you notice and describe the sensations happening inside your body—things like
        your heartbeat, breathing, and stomach feelings.
    </p>

    <div class="welcome-actions">
        <Button onclick={handleGetStarted}>Get Started</Button>

        <button class="skip-intro-btn" onclick={handleSkipIntro}>
            Already have experience? Skip Introduction →
        </button>
    </div>
</div>

<style>
    .welcome-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        text-align: center;
        gap: 1rem;
        padding: 1rem 0;
    }

    .welcome-hero {
        margin-bottom: 0.5rem;
    }

    .welcome-icon {
        font-size: 3.5rem;
        line-height: 1;
    }

    .welcome-title {
        font-size: 2rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .welcome-tagline {
        font-size: 1.125rem;
        font-weight: 600;
        color: #374151;
        margin: 0;
    }

    .welcome-description {
        font-size: 1rem;
        color: #6b7280;
        max-width: 28rem;
        line-height: 1.6;
        margin: 0;
    }

    .welcome-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        width: 100%;
        max-width: 28rem;
        margin-top: 0.5rem;
    }

    .welcome-actions :global(.btn) {
        width: 100%;
    }

    .skip-intro-btn {
        font-size: 0.9rem;
        color: #6b7280;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .skip-intro-btn:hover {
        color: #374151;
    }

    .skip-intro-btn:focus-visible {
        outline: 2px solid var(--color-focus, #2563eb);
        outline-offset: 2px;
        border-radius: 0.25rem;
    }
</style>
