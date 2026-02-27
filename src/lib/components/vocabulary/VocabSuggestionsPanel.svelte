<script lang="ts">
    import type { SharedDescription, SensationDescription } from '$lib/types/domain';
    import { descriptionFromShared } from './vocab-suggestions-panel';
    import { formatLabel } from '$lib/core/vocabularyList';

    interface Props {
        suggestions: SharedDescription[];
        exerciseId: string;
        sessionId: string;
        onAdd: (desc: SensationDescription) => void;
        onDone: () => void;
    }

    const { suggestions, exerciseId, sessionId, onAdd, onDone }: Props = $props();

    let addedIds = $state(new Set<string>());

    function handleAdd(shared: SharedDescription): void {
        if (addedIds.has(shared.id)) return;
        const desc = descriptionFromShared(shared, exerciseId, sessionId);
        onAdd(desc);
        addedIds = new Set([...addedIds, shared.id]);
    }
</script>

<div class="panel">
    <span class="panel-icon" aria-hidden="true">💬</span>
    <h1 class="panel-title">Others describe this as…</h1>
    <p class="panel-subtitle">Tap any that resonate to save to your vocabulary.</p>

    {#if suggestions.length > 0}
        <ul class="suggestions-list" role="list" aria-label="Vocabulary suggestions">
            {#each suggestions as item (item.id)}
                {@const added = addedIds.has(item.id)}
                <li class="suggestion-item" class:suggestion-item--added={added}>
                    <div class="suggestion-content">
                        <span class="suggestion-text">{item.text}</span>
                        <div class="suggestion-meta">
                            <span class="badge badge-region">{formatLabel(item.bodyRegion)}</span>
                            <span class="badge badge-category">{formatLabel(item.category)}</span>
                            {#if item.confirmationCount > 0}
                                <span class="badge badge-count"
                                    >{item.confirmationCount} confirmed</span
                                >
                            {/if}
                        </div>
                    </div>
                    <button
                        class="add-btn"
                        class:add-btn--added={added}
                        onclick={() => handleAdd(item)}
                        aria-label={added
                            ? `${item.text} added to your vocabulary`
                            : `Add "${item.text}" to your vocabulary`}
                        aria-pressed={added}
                    >
                        {added ? '✓' : '+'}
                    </button>
                </li>
            {/each}
        </ul>
    {:else}
        <p class="panel-empty">No suggestions for the regions in this exercise yet.</p>
    {/if}

    <div class="panel-actions">
        <button class="btn btn-primary" onclick={onDone}>Continue</button>
        <a href="/vocabulary" class="btn btn-ghost">Explore all vocabulary</a>
    </div>
</div>

<style>
    .panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        flex: 1;
        padding: 2rem 1.5rem;
        text-align: center;
        min-height: 100%;
    }

    .panel-icon {
        font-size: 2.5rem;
        line-height: 1;
    }

    .panel-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .panel-subtitle {
        font-size: 0.9375rem;
        color: #6b7280;
        margin: 0;
        max-width: 300px;
    }

    .panel-empty {
        font-size: 0.9375rem;
        color: #9ca3af;
        margin: 0;
    }

    .suggestions-list {
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-align: left;
    }

    .suggestion-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: #ffffff;
        border: 1.5px solid #e5e7eb;
        border-radius: 0.75rem;
        transition: border-color 0.12s;
    }

    .suggestion-item--added {
        border-color: #4f46e5;
        background: #eef2ff;
    }

    .suggestion-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        min-width: 0;
    }

    .suggestion-text {
        font-size: 1rem;
        font-weight: 600;
        color: #111827;
    }

    .suggestion-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        line-height: 1.6;
    }

    .badge-region {
        background: #f0fdf4;
        color: #166534;
    }

    .badge-category {
        background: #ede9fe;
        color: #5b21b6;
    }

    .badge-count {
        background: #ecfdf5;
        color: #065f46;
    }

    .add-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 44px;
        min-height: 44px;
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        border: 2px solid #d1d5db;
        background: #ffffff;
        font-size: 1.25rem;
        font-weight: 700;
        color: #374151;
        cursor: pointer;
        flex-shrink: 0;
        transition:
            background-color 0.12s,
            border-color 0.12s,
            color 0.12s;
    }

    .add-btn:hover:not(.add-btn--added) {
        background: #f3f4f6;
        border-color: #9ca3af;
    }

    .add-btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .add-btn--added {
        background: #4f46e5;
        border-color: #4f46e5;
        color: #ffffff;
        cursor: default;
    }

    .panel-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        width: 100%;
        max-width: 320px;
        margin-top: 0.5rem;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        min-width: 44px;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        border: 2px solid transparent;
        text-decoration: none;
        font-family: inherit;
        transition:
            background-color 0.12s,
            color 0.12s,
            border-color 0.12s;
    }

    .btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .btn-primary {
        background: #4f46e5;
        color: #ffffff;
        border-color: #4f46e5;
        width: 100%;
    }

    .btn-primary:hover {
        background: #4338ca;
        border-color: #4338ca;
    }

    .btn-ghost {
        background: transparent;
        color: #374151;
        border-color: transparent;
        width: 100%;
        text-align: center;
    }

    .btn-ghost:hover {
        background: #f3f4f6;
    }
</style>
