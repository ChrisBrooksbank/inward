<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { isDismissed, isStandalone, persistDismiss, shouldShowBanner } from './install-prompt';

    interface InstallPromptEvent extends Event {
        prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
    }
    let deferredPrompt = $state<InstallPromptEvent | null>(null);
    let dismissed = $state(false);
    let isInstalled = $state(false);

    onMount(() => {
        if (!browser) return;

        if (isStandalone()) {
            isInstalled = true;
            return;
        }

        dismissed = isDismissed();

        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            deferredPrompt = e;
        });

        window.addEventListener('appinstalled', () => {
            isInstalled = true;
            deferredPrompt = null;
        });
    });

    async function handleInstall(): Promise<void> {
        if (!deferredPrompt) return;
        const { outcome } = await deferredPrompt.prompt();
        if (outcome === 'accepted') {
            isInstalled = true;
        }
        deferredPrompt = null;
    }

    function handleDismiss(): void {
        dismissed = true;
        persistDismiss();
    }

    const visible = $derived(
        shouldShowBanner({ isInstalled, dismissed, hasPrompt: deferredPrompt !== null })
    );
</script>

{#if visible}
    <div class="install-banner" role="alert">
        <p class="install-text">Install Inward for a better experience</p>
        <div class="install-actions">
            <button class="install-btn" onclick={handleInstall}>Install</button>
            <button class="dismiss-btn" onclick={handleDismiss} aria-label="Dismiss install prompt"
                >Not now</button
            >
        </div>
    </div>
{/if}

<style>
    .install-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background-color: #eef2ff;
        border-bottom: 1px solid #c7d2fe;
    }

    .install-text {
        font-size: 0.875rem;
        color: #3730a3;
        margin: 0;
    }

    .install-actions {
        display: flex;
        gap: 0.5rem;
        flex-shrink: 0;
    }

    .install-btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #ffffff;
        background-color: #4f46e5;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
    }

    .dismiss-btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
        color: #6366f1;
        background-color: transparent;
        border: 1px solid #c7d2fe;
        border-radius: 0.375rem;
        cursor: pointer;
    }
</style>
