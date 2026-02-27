<script lang="ts">
    import { onboardingStep, TOTAL_STEPS } from '$lib/stores/onboarding';
    import WelcomeStep from '$lib/components/onboarding/WelcomeStep.svelte';
    import InteroceptionStep from '$lib/components/onboarding/InteroceptionStep.svelte';
    import PrivacyStep from '$lib/components/onboarding/PrivacyStep.svelte';
</script>

<svelte:head>
    <title>Welcome – Inward</title>
</svelte:head>

<div class="onboarding-page">
    {#if $onboardingStep === 0}
        <WelcomeStep />
    {:else if $onboardingStep === 1}
        <InteroceptionStep />
    {:else if $onboardingStep === 2}
        <PrivacyStep />
    {:else if $onboardingStep < TOTAL_STEPS}
        <div class="step-placeholder">
            <p>Step {$onboardingStep + 1} – coming soon</p>
        </div>
    {:else}
        <div class="step-complete">
            <h1>Setup Complete</h1>
            <p>You're ready to start your practice.</p>
        </div>
    {/if}
</div>

<style>
    .onboarding-page {
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .step-placeholder,
    .step-complete {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        text-align: center;
        gap: 1rem;
    }

    .step-complete h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #111827;
    }

    .step-placeholder p,
    .step-complete p {
        font-size: 1rem;
        color: #6b7280;
        max-width: 28rem;
    }
</style>
