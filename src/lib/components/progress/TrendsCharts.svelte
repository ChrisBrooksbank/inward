<script lang="ts">
    import type { WeeklySessionData, VocabGrowthPoint } from './trends';

    interface Props {
        sessionsPerWeek: WeeklySessionData[];
        vocabGrowth: VocabGrowthPoint[];
    }

    const { sessionsPerWeek, vocabGrowth }: Props = $props();

    const maxSessions = $derived(Math.max(...sessionsPerWeek.map(p => p.count), 1));
    const maxVocab = $derived(Math.max(...vocabGrowth.map(p => p.total), 1));
    const noSessions = $derived(sessionsPerWeek.every(p => p.count === 0));
    const noVocab = $derived(vocabGrowth.every(p => p.total === 0));

    function barPct(value: number, max: number): number {
        return max > 0 ? Math.round((value / max) * 100) : 0;
    }
</script>

<div class="trends-section">
    <div class="chart-card" role="region" aria-label="Sessions per week chart">
        <h3 class="chart-title">Sessions per week</h3>
        {#if noSessions}
            <p class="empty-msg">No sessions yet. Start practicing to see your activity.</p>
        {:else}
            <div class="chart-container">
                <div class="bar-chart">
                    {#each sessionsPerWeek as point (point.weekStart)}
                        <div
                            class="bar-col"
                            aria-label="{point.weekLabel}: {point.count} session{point.count !== 1
                                ? 's'
                                : ''}"
                        >
                            <span class="bar-value" aria-hidden="true">
                                {point.count > 0 ? point.count : ''}
                            </span>
                            <div
                                class="bar"
                                style="height: {barPct(point.count, maxSessions)}%"
                                aria-hidden="true"
                            ></div>
                        </div>
                    {/each}
                </div>
                <div class="chart-labels" aria-hidden="true">
                    {#each sessionsPerWeek as point (point.weekStart)}
                        <span class="bar-label">{point.weekLabel}</span>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    <div class="chart-card" role="region" aria-label="Vocabulary growth chart">
        <h3 class="chart-title">Vocabulary growth</h3>
        {#if noVocab}
            <p class="empty-msg">No vocabulary yet. Describe sensations during exercises.</p>
        {:else}
            <div class="chart-container">
                <div class="bar-chart">
                    {#each vocabGrowth as point (point.weekStart)}
                        <div
                            class="bar-col"
                            aria-label="{point.weekLabel}: {point.total} word{point.total !== 1
                                ? 's'
                                : ''} total"
                        >
                            <span class="bar-value" aria-hidden="true">
                                {point.total > 0 ? point.total : ''}
                            </span>
                            <div
                                class="bar vocab-bar"
                                style="height: {barPct(point.total, maxVocab)}%"
                                aria-hidden="true"
                            ></div>
                        </div>
                    {/each}
                </div>
                <div class="chart-labels" aria-hidden="true">
                    {#each vocabGrowth as point (point.weekStart)}
                        <span class="bar-label">{point.weekLabel}</span>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .trends-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .chart-card {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        padding: 1rem;
    }

    .chart-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #111827;
        margin: 0 0 0.875rem;
    }

    .empty-msg {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
        padding: 1rem 0;
        text-align: center;
    }

    .chart-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .bar-chart {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 100px;
    }

    .bar-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
    }

    .bar-value {
        font-size: 0.625rem;
        font-weight: 600;
        color: #374151;
        line-height: 1;
        margin-bottom: 2px;
        min-height: 0.75rem;
        text-align: center;
    }

    .bar {
        width: 100%;
        background-color: #2563eb;
        border-radius: 3px 3px 0 0;
        min-height: 2px;
    }

    .vocab-bar {
        background-color: #059669;
    }

    .chart-labels {
        display: flex;
        gap: 3px;
        margin-top: 0.25rem;
    }

    .bar-label {
        flex: 1;
        font-size: 0.5625rem;
        color: #6b7280;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    @media (prefers-reduced-motion: no-preference) {
        .bar {
            transition: height 0.2s ease;
        }
    }
</style>
