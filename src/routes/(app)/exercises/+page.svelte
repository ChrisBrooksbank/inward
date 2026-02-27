<script lang="ts">
    import { PageShell, Card } from '$lib/components';
    import { SEED_EXERCISES } from '$lib/core/exercises';
    import { filterExercises } from '$lib/core/exerciseFilters';
    import { ExerciseCategory, DifficultyLevel, BodyRegion } from '$lib/types/domain';
    import type {
        ExerciseCategory as EC,
        DifficultyLevel as DL,
        BodyRegion as BR,
    } from '$lib/types/domain';

    let selectedCategory = $state<EC | null>(null);
    let selectedDifficulty = $state<DL | null>(null);
    let selectedRegion = $state<BR | null>(null);

    const categories = ExerciseCategory.options;
    const difficulties = DifficultyLevel.options;
    const regions = BodyRegion.options;

    const filtered = $derived(
        filterExercises(SEED_EXERCISES, {
            category: selectedCategory,
            difficulty: selectedDifficulty,
            bodyRegion: selectedRegion,
        })
    );

    function formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
    }

    function formatLabel(s: string): string {
        return s
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    }

    function toggleCategory(cat: EC): void {
        selectedCategory = selectedCategory === cat ? null : cat;
    }

    function toggleDifficulty(diff: DL): void {
        selectedDifficulty = selectedDifficulty === diff ? null : diff;
    }

    function onRegionChange(e: Event): void {
        const val = (e.target as HTMLSelectElement).value;
        selectedRegion = val ? (val as BR) : null;
    }
</script>

<svelte:head>
    <title>Practice – Inward</title>
</svelte:head>

<PageShell title="Practice">
    <section class="filters" aria-label="Exercise filters">
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

        <div class="filter-group">
            <span class="filter-label" id="diff-label">Difficulty</span>
            <div class="chips" role="group" aria-labelledby="diff-label">
                <button
                    class="chip"
                    class:active={selectedDifficulty === null}
                    aria-pressed={selectedDifficulty === null}
                    onclick={() => (selectedDifficulty = null)}
                >
                    All
                </button>
                {#each difficulties as diff (diff)}
                    <button
                        class="chip chip-{diff}"
                        class:active={selectedDifficulty === diff}
                        aria-pressed={selectedDifficulty === diff}
                        onclick={() => toggleDifficulty(diff)}
                    >
                        {formatLabel(diff)}
                    </button>
                {/each}
            </div>
        </div>

        <div class="filter-group">
            <label class="filter-label" for="region-select">Body Region</label>
            <select
                id="region-select"
                class="region-select"
                value={selectedRegion ?? ''}
                onchange={onRegionChange}
            >
                <option value="">All regions</option>
                {#each regions as region (region)}
                    <option value={region}>{formatLabel(region)}</option>
                {/each}
            </select>
        </div>
    </section>

    <p class="results-count">
        {filtered.length}
        {filtered.length === 1 ? 'exercise' : 'exercises'}
    </p>

    {#if filtered.length === 0}
        <p class="empty-state">No exercises match your filters. Try removing some filters.</p>
    {:else}
        <ul class="exercise-list" aria-label="Exercises">
            {#each filtered as exercise (exercise.id)}
                <li>
                    <a href="/exercise/{exercise.id}" class="exercise-link">
                        <Card>
                            <div class="exercise-card">
                                <div class="exercise-header">
                                    <h2 class="exercise-name">{exercise.name}</h2>
                                    {#if exercise.requiredCompletions > 0}
                                        <span
                                            class="locked-badge"
                                            aria-label="Locked — requires prior completions"
                                            >Locked</span
                                        >
                                    {/if}
                                </div>
                                <p class="exercise-desc">{exercise.description}</p>
                                <div class="exercise-meta">
                                    <span class="badge badge-cat"
                                        >{formatLabel(exercise.category)}</span
                                    >
                                    <span class="badge badge-{exercise.difficulty}"
                                        >{formatLabel(exercise.difficulty)}</span
                                    >
                                    <span class="badge badge-dur"
                                        >{formatDuration(exercise.totalDurationSeconds)}</span
                                    >
                                </div>
                                <div class="region-tags" aria-label="Body regions">
                                    {#each exercise.bodyRegions as region (region)}
                                        <span class="region-tag">{formatLabel(region)}</span>
                                    {/each}
                                </div>
                            </div>
                        </Card>
                    </a>
                </li>
            {/each}
        </ul>
    {/if}
</PageShell>

<style>
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

    .chip-beginner.active {
        background: #16a34a;
        border-color: #16a34a;
    }

    .chip-intermediate.active {
        background: #d97706;
        border-color: #d97706;
    }

    .chip-advanced.active {
        background: #dc2626;
        border-color: #dc2626;
    }

    .region-select {
        height: 44px;
        padding: 0 0.75rem;
        border: 1.5px solid #d1d5db;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        color: #374151;
        background: #ffffff;
        cursor: pointer;
        width: 100%;
        max-width: 240px;
    }

    .region-select:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .results-count {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.75rem;
    }

    .exercise-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .exercise-link {
        display: block;
        text-decoration: none;
        color: inherit;
        border-radius: 0.75rem;
    }

    .exercise-link:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .exercise-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .exercise-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.5rem;
    }

    .exercise-name {
        font-size: 1rem;
        font-weight: 700;
        color: #111827;
        line-height: 1.3;
        margin: 0;
    }

    .locked-badge {
        flex-shrink: 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: #9ca3af;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 9999px;
        padding: 0.125rem 0.5rem;
    }

    .exercise-desc {
        font-size: 0.875rem;
        color: #6b7280;
        line-height: 1.5;
        margin: 0;
    }

    .exercise-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
    }

    .badge-cat {
        background: #ede9fe;
        color: #5b21b6;
    }

    .badge-beginner {
        background: #dcfce7;
        color: #15803d;
    }

    .badge-intermediate {
        background: #fef3c7;
        color: #92400e;
    }

    .badge-advanced {
        background: #fee2e2;
        color: #991b1b;
    }

    .badge-dur {
        background: #f1f5f9;
        color: #475569;
    }

    .region-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .region-tag {
        font-size: 0.6875rem;
        color: #9ca3af;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 9999px;
        padding: 0.0625rem 0.375rem;
    }

    .empty-state {
        text-align: center;
        color: #9ca3af;
        font-size: 0.875rem;
        padding: 2rem 0;
    }
</style>
