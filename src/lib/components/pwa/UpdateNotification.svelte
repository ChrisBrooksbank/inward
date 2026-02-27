<script lang="ts">
    import { useRegisterSW } from 'virtual:pwa-register/svelte';

    const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
        onRegistered(registration) {
            if (registration) {
                setInterval(
                    () => {
                        registration.update();
                    },
                    60 * 60 * 1000
                );
            }
        },
    });

    function handleUpdate(): void {
        updateServiceWorker(true);
    }

    function handleDismissOffline(): void {
        $offlineReady = false;
    }
</script>

{#if $needRefresh}
    <div class="update-banner" role="alert">
        <p class="update-text">A new version is available</p>
        <button class="update-btn" onclick={handleUpdate}>Update</button>
    </div>
{/if}

{#if $offlineReady}
    <div class="offline-banner" role="status">
        <p class="offline-text">App ready for offline use</p>
        <button class="offline-dismiss" onclick={handleDismissOffline} aria-label="Dismiss"
            >OK</button
        >
    </div>
{/if}

<style>
    .update-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background-color: #fef3c7;
        border-bottom: 1px solid #fcd34d;
    }

    .update-text {
        font-size: 0.875rem;
        color: #92400e;
        margin: 0;
    }

    .update-btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #ffffff;
        background-color: #d97706;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        flex-shrink: 0;
    }

    .offline-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background-color: #ecfdf5;
        border-bottom: 1px solid #6ee7b7;
    }

    .offline-text {
        font-size: 0.875rem;
        color: #065f46;
        margin: 0;
    }

    .offline-dismiss {
        padding: 0.375rem 0.75rem;
        font-size: 0.8125rem;
        color: #059669;
        background-color: transparent;
        border: 1px solid #6ee7b7;
        border-radius: 0.375rem;
        cursor: pointer;
        flex-shrink: 0;
    }
</style>
