<script lang="ts">
    import { onboardingStep, TOTAL_STEPS } from '$lib/stores/onboarding';
</script>

<svelte:head>
    <title>Welcome – Inward</title>
</svelte:head>

<div class="onboarding-page">
    {#if $onboardingStep < TOTAL_STEPS}
        <h1>Welcome to Inward</h1>
        <p>Your interoception training journey starts here.</p>
    {:else}
        <h1>Setup Complete</h1>
        <p>You're ready to start your practice.</p>
    {/if}
</div>

<style>
    .onboarding-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        text-align: center;
        gap: 1rem;
    }

    h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #111827;
    }

    p {
        font-size: 1rem;
        color: #6b7280;
        max-width: 28rem;
    }
</style>
