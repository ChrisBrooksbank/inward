<script lang="ts">
    import type { SyncStatus } from '$lib/types/sync';
    import { getSyncDisplayState, formatLastSync } from './sync-status';

    interface Props {
        status: SyncStatus;
        onSync?: () => void;
    }

    const { status, onSync }: Props = $props();

    const LABELS: Record<string, string> = {
        offline: 'Offline',
        syncing: 'Syncing…',
        synced: 'Synced',
        'never-synced': 'Not synced',
    };

    const displayState = $derived(getSyncDisplayState(status));
    const label = $derived(LABELS[displayState] ?? 'Unknown');
    const lastSyncLabel = $derived(status.lastSyncAt ? formatLastSync(status.lastSyncAt) : null);
    const canSync = $derived(!status.isSyncing && status.isOnline);
</script>

<div class="sync-indicator" aria-live="polite" aria-label="Sync status: {label}">
    <span class="dot dot--{displayState}" aria-hidden="true"></span>
    <span class="status-text">{label}</span>
    {#if displayState === 'synced' && lastSyncLabel}
        <span class="last-sync" aria-label="Last synced {lastSyncLabel}">{lastSyncLabel}</span>
    {/if}
    {#if onSync}
        <button
            class="sync-btn"
            onclick={onSync}
            disabled={!canSync}
            aria-label="Sync now"
            title="Sync now"
        >
            <svg
                class="sync-icon"
                class:spinning={status.isSyncing}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
        </button>
    {/if}
</div>

<style>
    .sync-indicator {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        color: #6b7280;
    }

    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .dot--synced {
        background-color: #10b981;
    }

    .dot--syncing {
        background-color: #f59e0b;
    }

    .dot--offline {
        background-color: #9ca3af;
    }

    .dot--never-synced {
        background-color: #d1d5db;
    }

    .status-text {
        font-weight: 500;
        color: #374151;
    }

    .last-sync {
        color: #9ca3af;
    }

    .sync-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        min-height: 44px;
        padding: 0.25rem;
        background: none;
        border: none;
        border-radius: 0.375rem;
        color: #6b7280;
        cursor: pointer;
        transition:
            color 0.15s,
            background-color 0.15s;
    }

    .sync-btn:hover:not(:disabled) {
        color: #374151;
        background-color: #f3f4f6;
    }

    .sync-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .sync-icon {
        width: 16px;
        height: 16px;
    }

    .spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .spinning {
            animation: none;
        }
    }
</style>
