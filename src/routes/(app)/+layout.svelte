<script lang="ts">
    import { page } from '$app/stores';
    import { BottomNav } from '$lib/components';

    const { children } = $props();
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
