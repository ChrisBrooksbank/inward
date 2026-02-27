<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { BottomNav, SyncStatusIndicator, SyncConsentDialog } from '$lib/components';
    import { getOnboardingRedirect } from '$lib/utils/routeGuard';
    import { initSeedVocabulary } from '$lib/core/vocabulary';
    import { syncStatus } from '$lib/stores';
    import { runDeltaSync, startBackgroundSync } from '$lib/core/deltaSync';
    import { startOnlineListener } from '$lib/core/offlineQueue';
    import { RelayApiClient } from '$lib/core/apiClient';
    import { getSettings, putSettings } from '$lib/db';
    import { hasSyncConsent, acceptSyncConsent } from '$lib/components/sync/sync-consent';

    const { children } = $props();

    let showConsentDialog = $state(false);
    let cleanupSync: (() => void) | undefined;
    let cleanupOnline: (() => void) | undefined;

    function getClient(): RelayApiClient {
        return new RelayApiClient();
    }

    async function doSync(): Promise<void> {
        syncStatus.patch({ isSyncing: true });
        try {
            await runDeltaSync(getClient());
            syncStatus.patch({ isSyncing: false, lastSyncAt: new Date() });
        } catch {
            syncStatus.patch({ isSyncing: false });
        } finally {
            await syncStatus.refreshPending();
        }
    }

    async function handleSync(): Promise<void> {
        if ($syncStatus.isSyncing || !$syncStatus.isOnline) return;
        const settings = await getSettings();
        if (!settings || !hasSyncConsent(settings.settings)) {
            showConsentDialog = true;
            return;
        }
        await doSync();
    }

    function startSyncServices(): void {
        cleanupSync = startBackgroundSync(getClient);
        cleanupOnline = startOnlineListener(getClient);
    }

    async function onConsentAccept(): Promise<void> {
        showConsentDialog = false;
        const settings = await getSettings();
        if (settings) {
            const updated = { ...settings, settings: acceptSyncConsent(settings.settings) };
            await putSettings(updated);
        }
        startSyncServices();
        await doSync();
    }

    function onConsentDecline(): void {
        showConsentDialog = false;
    }

    onMount(async () => {
        const redirect = await getOnboardingRedirect();
        if (redirect) {
            await goto(redirect);
        }
        await initSeedVocabulary();
        await syncStatus.init();

        const settings = await getSettings();
        if (settings && hasSyncConsent(settings.settings)) {
            startSyncServices();
        }
    });

    onDestroy(() => {
        cleanupSync?.();
        cleanupOnline?.();
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

<SyncConsentDialog
    open={showConsentDialog}
    onAccept={onConsentAccept}
    onDecline={onConsentDecline}
/>

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
        max-width: 640px;
        margin: 0 auto;
        width: 100%;
    }

    .app-content {
        flex: 1;
        overflow-y: auto;
    }
</style>
