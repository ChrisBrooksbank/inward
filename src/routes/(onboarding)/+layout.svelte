<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { onboardingStep, TOTAL_STEPS } from '$lib/stores/onboarding';

    const { children } = $props();

    onMount(async () => {
        await onboardingStep.init();
    });

    async function handleSkip(): Promise<void> {
        await onboardingStep.skip();
        await goto('/dashboard');
    }
</script>

<div class="onboarding-shell">
    <header class="onboarding-header">
        {#if $onboardingStep < TOTAL_STEPS}
            <span class="step-indicator" aria-label="Step {$onboardingStep + 1} of {TOTAL_STEPS}">
                Step {$onboardingStep + 1} of {TOTAL_STEPS}
            </span>
            <button class="skip-btn" onclick={handleSkip} aria-label="Skip onboarding">
                Skip
            </button>
        {/if}
    </header>
    <main class="onboarding-content">
        {@render children()}
    </main>
</div>

<style>
    .onboarding-shell {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        padding: 1rem;
    }

    .onboarding-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 44px;
        margin-bottom: 1rem;
    }

    .step-indicator {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
    }

    .skip-btn {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
    }

    .skip-btn:hover {
        color: #374151;
        background-color: #f3f4f6;
    }

    .skip-btn:focus-visible {
        outline: 2px solid var(--color-focus, #2563eb);
        outline-offset: 2px;
    }

    .onboarding-content {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
</style>
