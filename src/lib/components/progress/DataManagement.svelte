<script lang="ts">
    import { Button } from '$lib/components';
    import { buildExportData, triggerDownload, deleteAllData } from './data-management';

    interface Props {
        sessionCount: number;
        vocabularyCount: number;
        assessmentCount: number;
        onDeleted?: () => void;
    }

    const { sessionCount, vocabularyCount, assessmentCount, onDeleted }: Props = $props();

    let showConfirm = $state(false);
    let exporting = $state(false);
    let deleting = $state(false);
    let exportError = $state('');
    let deleteError = $state('');

    async function handleExport(): Promise<void> {
        exporting = true;
        exportError = '';
        try {
            const data = await buildExportData();
            triggerDownload(data);
        } catch {
            exportError = 'Export failed. Please try again.';
        } finally {
            exporting = false;
        }
    }

    async function handleDelete(): Promise<void> {
        deleting = true;
        deleteError = '';
        try {
            await deleteAllData();
            showConfirm = false;
            onDeleted?.();
        } catch {
            deleteError = 'Delete failed. Please try again.';
        } finally {
            deleting = false;
        }
    }
</script>

<section class="data-management" aria-label="Data management">
    <h2 class="section-heading">Your Data</h2>
    <p class="intro">
        All your data is stored locally on this device. You can export or delete it at any time.
    </p>

    <div class="stats">
        <div class="stat-row">
            <span class="stat-label">Sessions completed</span><span class="stat-value"
                >{sessionCount}</span
            >
        </div>
        <div class="stat-row">
            <span class="stat-label">Vocabulary entries</span><span class="stat-value"
                >{vocabularyCount}</span
            >
        </div>
        <div class="stat-row">
            <span class="stat-label">MAIA assessments</span><span class="stat-value"
                >{assessmentCount}</span
            >
        </div>
    </div>

    <div class="action-card">
        <p class="action-desc">
            Download all your data in JSON format. Includes: exercises, vocabulary, assessments.
        </p>
        {#if exportError}
            <p class="error-text" role="alert">{exportError}</p>
        {/if}
        <Button variant="secondary" onclick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export All Data'}
        </Button>
    </div>

    <div class="action-card action-card--danger">
        <p class="action-desc">
            Permanently delete all your data from this device. This cannot be undone.
        </p>
        <Button
            variant="secondary"
            onclick={() => {
                showConfirm = true;
            }}
        >
            Delete All Data
        </Button>
    </div>
</section>

{#if showConfirm}
    <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div class="dialog">
            <p class="dialog-icon" aria-hidden="true">⚠️</p>
            <h3 id="confirm-title" class="dialog-title">Delete All Your Data?</h3>
            <ul class="delete-list">
                <li>{sessionCount} exercise sessions</li>
                <li>{vocabularyCount} vocabulary entries</li>
                <li>{assessmentCount} MAIA assessments</li>
                <li>All settings and preferences</li>
            </ul>
            <p class="dialog-warning">This action cannot be undone.</p>
            {#if deleteError}
                <p class="error-text" role="alert">{deleteError}</p>
            {/if}
            <div class="dialog-actions">
                <Button
                    variant="primary"
                    onclick={() => {
                        showConfirm = false;
                    }}
                    disabled={deleting}
                >
                    Keep Data
                </Button>
                <button
                    class="delete-btn"
                    onclick={handleDelete}
                    disabled={deleting}
                    aria-label="Delete everything permanently"
                >
                    {deleting ? 'Deleting…' : 'Delete Everything Permanently'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .section-heading {
        font-size: 1rem;
        font-weight: 700;
        color: #111827;
        margin: 0 0 0.25rem;
    }

    .intro {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0 0 1rem;
    }

    .stats {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .stat-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
    }

    .stat-label {
        color: #374151;
    }

    .stat-value {
        font-weight: 600;
        color: #111827;
    }

    .action-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1rem 1.25rem;
        margin-bottom: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .action-card--danger {
        border-color: #fca5a5;
    }

    .action-desc {
        font-size: 0.875rem;
        color: #374151;
        margin: 0;
    }

    .error-text {
        font-size: 0.875rem;
        color: #dc2626;
        margin: 0;
    }

    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 1rem;
    }

    .dialog {
        background: #ffffff;
        border-radius: 1rem;
        padding: 1.5rem;
        max-width: 400px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .dialog-icon {
        font-size: 2rem;
        text-align: center;
        margin: 0;
    }

    .dialog-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
        text-align: center;
    }

    .delete-list {
        font-size: 0.875rem;
        color: #374151;
        margin: 0;
        padding-left: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .dialog-warning {
        font-size: 0.875rem;
        font-weight: 600;
        color: #dc2626;
        margin: 0;
        text-align: center;
    }

    .dialog-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .delete-btn {
        min-height: 44px;
        background: transparent;
        border: none;
        color: #dc2626;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.5rem;
    }

    .delete-btn:hover:not(:disabled) {
        text-decoration: underline;
    }

    .delete-btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .delete-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
        .overlay {
            transition: none;
        }
    }
</style>
