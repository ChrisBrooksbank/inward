<script lang="ts">
    const { children } = $props();
</script>

<div class="onboarding-shell">
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

    .onboarding-content {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
</style>
