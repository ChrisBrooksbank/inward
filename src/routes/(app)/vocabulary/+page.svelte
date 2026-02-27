<script lang="ts">
    import { onMount } from 'svelte';
    import { PageShell } from '$lib/components';
    import { vocabularyStore, sharedVocabularyStore } from '$lib/stores';
    import {
        groupByBodyRegion,
        formatLabel,
        formatDate,
        filterDescriptions,
    } from '$lib/core/vocabularyList';
    import { groupSharedByBodyRegion, filterSharedByRegion } from '$lib/core/sharedVocabulary';
    import { BodyRegion, SignalType, VocabularyCategory } from '$lib/types/domain';
    import type {
        BodyRegion as BR,
        SignalType as ST,
        VocabularyCategory as VC,
    } from '$lib/types/domain';

    onMount(() => {
        void vocabularyStore.init();
        void sharedVocabularyStore.init();
    });

    // ---- view mode ----
    let viewMode = $state<'my-words' | 'discover'>('my-words');

    // ---- my-words filters ----
    let searchQuery = $state('');
    let selectedRegion = $state<BR | null>(null);
    let selectedSignal = $state<ST | null>(null);
    let selectedCategory = $state<VC | null>(null);

    // ---- discover filter ----
    let discoverRegion = $state<BR | null>(null);

    const regions = BodyRegion.options;
    const signals = SignalType.options;
    const categories = VocabularyCategory.options;

    // ---- my-words derived ----
    const filtered = $derived(
        filterDescriptions($vocabularyStore, {
            search: searchQuery,
            region: selectedRegion,
            signalType: selectedSignal,
            category: selectedCategory,
        })
    );
    const groups = $derived(groupByBodyRegion(filtered));

    // ---- discover derived ----
    const discoverFiltered = $derived(filterSharedByRegion($sharedVocabularyStore, discoverRegion));
    const discoverGroups = $derived(groupSharedByBodyRegion(discoverFiltered));

    // ---- handlers ----
    function onRegionChange(e: Event): void {
        const val = (e.target as HTMLSelectElement).value;
        selectedRegion = val ? (val as BR) : null;
    }

    function onSignalChange(e: Event): void {
        const val = (e.target as HTMLSelectElement).value;
        selectedSignal = val ? (val as ST) : null;
    }

    function toggleCategory(cat: VC): void {
        selectedCategory = selectedCategory === cat ? null : cat;
    }

    function clearFilters(): void {
        searchQuery = '';
        selectedRegion = null;
        selectedSignal = null;
        selectedCategory = null;
    }

    function onDiscoverRegionChange(e: Event): void {
        const val = (e.target as HTMLSelectElement).value;
        discoverRegion = val ? (val as BR) : null;
    }

    const hasFilters = $derived(
        searchQuery.trim() !== '' ||
            selectedRegion !== null ||
            selectedSignal !== null ||
            selectedCategory !== null
    );
</script>

<svelte:head>
    <title>Words – Inward</title>
</svelte:head>

<PageShell title="Words">
    <!-- Tab switcher -->
    <div class="tab-row" role="tablist" aria-label="Vocabulary views">
        <button
            class="tab-btn"
            class:active={viewMode === 'my-words'}
            role="tab"
            aria-selected={viewMode === 'my-words'}
            onclick={() => (viewMode = 'my-words')}
        >
            My Words
        </button>
        <button
            class="tab-btn"
            class:active={viewMode === 'discover'}
            role="tab"
            aria-selected={viewMode === 'discover'}
            onclick={() => (viewMode = 'discover')}
        >
            Discover
        </button>
    </div>

    {#if viewMode === 'my-words'}
        <!-- Personal vocabulary filters -->
        <section class="filters" aria-label="Vocabulary filters">
            <div class="filter-group">
                <label class="filter-label" for="vocab-search">Search</label>
                <input
                    id="vocab-search"
                    class="search-input"
                    type="search"
                    placeholder="Search words or emotions…"
                    bind:value={searchQuery}
                    aria-label="Search vocabulary"
                />
            </div>

            <div class="filter-group">
                <span class="filter-label" id="cat-label">Category</span>
                <div class="chips" role="group" aria-labelledby="cat-label">
                    <button
                        class="chip"
                        class:active={selectedCategory === null}
                        aria-pressed={selectedCategory === null}
                        onclick={() => (selectedCategory = null)}
                    >
                        All
                    </button>
                    {#each categories as cat (cat)}
                        <button
                            class="chip"
                            class:active={selectedCategory === cat}
                            aria-pressed={selectedCategory === cat}
                            onclick={() => toggleCategory(cat)}
                        >
                            {formatLabel(cat)}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="filter-row">
                <div class="filter-group filter-group--select">
                    <label class="filter-label" for="region-select">Region</label>
                    <select
                        id="region-select"
                        class="select"
                        value={selectedRegion ?? ''}
                        onchange={onRegionChange}
                    >
                        <option value="">All regions</option>
                        {#each regions as region (region)}
                            <option value={region}>{formatLabel(region)}</option>
                        {/each}
                    </select>
                </div>

                <div class="filter-group filter-group--select">
                    <label class="filter-label" for="signal-select">Signal type</label>
                    <select
                        id="signal-select"
                        class="select"
                        value={selectedSignal ?? ''}
                        onchange={onSignalChange}
                    >
                        <option value="">All signals</option>
                        {#each signals as signal (signal)}
                            <option value={signal}>{formatLabel(signal)}</option>
                        {/each}
                    </select>
                </div>
            </div>

            {#if hasFilters}
                <button class="clear-btn" onclick={clearFilters} aria-label="Clear all filters">
                    Clear filters
                </button>
            {/if}
        </section>

        <p class="results-count">
            {filtered.length}
            {filtered.length === 1 ? 'word' : 'words'}
        </p>

        {#if $vocabularyStore.length === 0}
            <div class="empty-state" role="status">
                <p class="empty-title">No words yet</p>
                <p class="empty-hint">
                    Describe sensations during exercises to build your personal vocabulary.
                </p>
            </div>
        {:else if groups.length === 0}
            <p class="no-results">No words match your filters. Try removing some filters.</p>
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
    {:else}
        <!-- Discover: shared vocabulary by body region, sorted by confirmation count -->
        <section class="filters" aria-label="Discover filters">
            <div class="filter-group filter-group--select">
                <label class="filter-label" for="discover-region-select">Body region</label>
                <select
                    id="discover-region-select"
                    class="select"
                    value={discoverRegion ?? ''}
                    onchange={onDiscoverRegionChange}
                >
                    <option value="">All regions</option>
                    {#each regions as region (region)}
                        <option value={region}>{formatLabel(region)}</option>
                    {/each}
                </select>
            </div>
        </section>

        <p class="results-count">
            {discoverFiltered.length}
            {discoverFiltered.length === 1 ? 'shared term' : 'shared terms'}
        </p>

        {#if discoverGroups.length === 0}
            <div class="empty-state" role="status">
                <p class="empty-title">Nothing to discover yet</p>
                <p class="empty-hint">Shared vocabulary from the community will appear here.</p>
            </div>
        {:else}
            <ul class="region-groups" aria-label="Shared vocabulary grouped by body region">
                {#each discoverGroups as group (group.region)}
                    <li class="region-group">
                        <h2 class="region-heading">{formatLabel(group.region)}</h2>
                        <ul
                            class="description-list"
                            aria-label="Shared {formatLabel(group.region)} descriptions"
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
                                        <span
                                            class="confirmation-count"
                                            aria-label="{item.confirmationCount} confirmations"
                                        >
                                            ✓ {item.confirmationCount}
                                        </span>
                                    </div>
                                </li>
                            {/each}
                        </ul>
                    </li>
                {/each}
            </ul>
        {/if}
    {/if}
</PageShell>

<style>
    .tab-row {
        display: flex;
        gap: 0.25rem;
        margin-bottom: 1rem;
        background: #f3f4f6;
        border-radius: 0.75rem;
        padding: 0.25rem;
    }

    .tab-btn {
        flex: 1;
        height: 44px;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        background: transparent;
        color: #6b7280;
        transition:
            background-color 0.12s,
            color 0.12s;
    }

    .tab-btn:hover:not(.active) {
        background: #e5e7eb;
        color: #374151;
    }

    .tab-btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .tab-btn.active {
        background: #ffffff;
        color: #111827;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .filters {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 0.75rem;
        border: 1px solid #e5e7eb;
    }

    .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
    }

    .filter-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .search-input {
        height: 44px;
        padding: 0 0.75rem;
        border: 1.5px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        color: #374151;
        background: #ffffff;
        width: 100%;
    }

    .search-input:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.375rem 0.875rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border: 1.5px solid #d1d5db;
        background: #ffffff;
        color: #374151;
        transition:
            background-color 0.12s,
            border-color 0.12s,
            color 0.12s;
    }

    .chip:hover:not(.active) {
        background: #f3f4f6;
        border-color: #9ca3af;
    }

    .chip:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .chip.active {
        background: #4f46e5;
        border-color: #4f46e5;
        color: #ffffff;
    }

    .filter-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .filter-group--select {
        flex: 1;
        min-width: 140px;
    }

    .select {
        height: 44px;
        padding: 0 0.75rem;
        border: 1.5px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        color: #374151;
        background: #ffffff;
        cursor: pointer;
        width: 100%;
    }

    .select:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .clear-btn {
        align-self: flex-start;
        height: 44px;
        padding: 0 1rem;
        border: 1.5px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        background: #ffffff;
        color: #374151;
        cursor: pointer;
    }

    .clear-btn:hover {
        background: #f3f4f6;
    }

    .clear-btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .results-count {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.75rem;
    }

    .no-results {
        text-align: center;
        color: #9ca3af;
        font-size: 0.875rem;
        padding: 2rem 0;
    }

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

    .confirmation-count {
        font-size: 0.6875rem;
        font-weight: 600;
        color: #059669;
        margin-left: auto;
    }
</style>
