<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { BottomNav } from '$lib/components';
    import { getOnboardingRedirect } from '$lib/utils/routeGuard';

    const { children } = $props();

    onMount(async () => {
        const redirect = await getOnboardingRedirect();
        if (redirect) {
            await goto(redirect);
        }
    });
</script>

<div class="app-shell">
    <main class="app-content">
        {@render children()}
    </main>

    <BottomNav currentPath={$page.url.pathname} />
</div>

<style>
    .app-shell {
        display: flex;
        flex-direction: column;
        height: 100dvh;
    }

    .app-content {
        flex: 1;
        overflow-y: auto;
    }
</style>
