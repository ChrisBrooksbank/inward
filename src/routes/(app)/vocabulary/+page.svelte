<script lang="ts">
    import { onMount } from 'svelte';
    import { PageShell } from '$lib/components';
    import { vocabularyStore } from '$lib/stores';
    import { groupByBodyRegion, formatLabel, formatDate } from '$lib/core/vocabularyList';

    onMount(() => {
        void vocabularyStore.init();
    });

    const groups = $derived(groupByBodyRegion($vocabularyStore));
</script>

<svelte:head>
    <title>Words – Inward</title>
</svelte:head>

<PageShell title="Words">
    {#if groups.length === 0}
        <div class="empty-state" role="status">
            <p class="empty-title">No words yet</p>
            <p class="empty-hint">
                Describe sensations during exercises to build your personal vocabulary.
            </p>
        </div>
    {:else}
        <ul class="region-groups" aria-label="Vocabulary grouped by body region">
            {#each groups as group (group.region)}
                <li class="region-group">
                    <h2 class="region-heading">{formatLabel(group.region)}</h2>
                    <ul
                        class="description-list"
                        aria-label="{formatLabel(group.region)} descriptions"
                    >
                        {#each group.items as item (item.id)}
                            <li class="description-item">
                                <span class="description-text">{item.text}</span>
                                <div class="description-meta">
                                    <span class="badge badge-category"
                                        >{formatLabel(item.category)}</span
                                    >
                                    {#if item.signalType}
                                        <span class="badge badge-signal"
                                            >{formatLabel(item.signalType)}</span
                                        >
                                    {/if}
                                    {#if item.emotionConnection}
                                        <span class="badge badge-emotion"
                                            >{item.emotionConnection}</span
                                        >
                                    {/if}
                                    <span class="description-date"
                                        >{formatDate(item.createdAt)}</span
                                    >
                                </div>
                            </li>
                        {/each}
                    </ul>
                </li>
            {/each}
        </ul>
    {/if}
</PageShell>

<style>
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1rem;
        text-align: center;
        gap: 0.5rem;
    }

    .empty-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #374151;
    }

    .empty-hint {
        font-size: 0.875rem;
        color: #9ca3af;
        max-width: 22rem;
    }

    .region-groups {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .region-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .region-heading {
        font-size: 0.75rem;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding-bottom: 0.375rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .description-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .description-item {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding: 0.75rem 1rem;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
    }

    .description-text {
        font-size: 1rem;
        font-weight: 600;
        color: #111827;
    }

    .description-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.375rem;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
    }

    .badge-category {
        background: #ede9fe;
        color: #5b21b6;
    }

    .badge-signal {
        background: #e0f2fe;
        color: #0369a1;
    }

    .badge-emotion {
        background: #fce7f3;
        color: #9d174d;
    }

    .description-date {
        font-size: 0.6875rem;
        color: #9ca3af;
        margin-left: auto;
    }
</style>
