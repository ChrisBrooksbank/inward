<script lang="ts">
    import { onboardingStep, TOTAL_STEPS } from '$lib/stores/onboarding';
    import WelcomeStep from '$lib/components/onboarding/WelcomeStep.svelte';
    import InteroceptionStep from '$lib/components/onboarding/InteroceptionStep.svelte';
    import PrivacyStep from '$lib/components/onboarding/PrivacyStep.svelte';
    import MAIAStep from '$lib/components/onboarding/MAIAStep.svelte';
    import FirstExerciseStep from '$lib/components/onboarding/FirstExerciseStep.svelte';
    import CompleteStep from '$lib/components/onboarding/CompleteStep.svelte';
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
    {:else if $onboardingStep === 3}
        <MAIAStep />
    {:else if $onboardingStep === 4}
        <FirstExerciseStep />
    {:else if $onboardingStep < TOTAL_STEPS}
        <CompleteStep />
    {:else}
        <CompleteStep />
    {/if}
</div>

<style>
    .onboarding-page {
        display: flex;
        flex-direction: column;
        flex: 1;
    }
</style>
