<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { BottomNav, SyncStatusIndicator } from '$lib/components';
    import { getOnboardingRedirect } from '$lib/utils/routeGuard';
    import { initSeedVocabulary } from '$lib/core/vocabulary';
    import { syncStatus } from '$lib/stores';
    import { runDeltaSync } from '$lib/core/deltaSync';
    import { RelayApiClient } from '$lib/core/apiClient';

    const { children } = $props();

    async function handleSync(): Promise<void> {
        if ($syncStatus.isSyncing || !$syncStatus.isOnline) return;
        syncStatus.patch({ isSyncing: true });
        try {
            const client = new RelayApiClient();
            await runDeltaSync(client);
            syncStatus.patch({ isSyncing: false, lastSyncAt: new Date() });
        } catch {
            syncStatus.patch({ isSyncing: false });
        }
    }

    onMount(async () => {
        const redirect = await getOnboardingRedirect();
        if (redirect) {
            await goto(redirect);
        }
        await initSeedVocabulary();
        await syncStatus.init();
    });
</script>

<div class="app-shell">
    <header class="app-header">
        <SyncStatusIndicator status={$syncStatus} onSync={handleSync} />
    </header>
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

    .app-header {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0.25rem 1rem;
        background-color: #ffffff;
        border-bottom: 1px solid #f3f4f6;
        min-height: 44px;
    }

    .app-content {
        flex: 1;
        overflow-y: auto;
    }
</style>
