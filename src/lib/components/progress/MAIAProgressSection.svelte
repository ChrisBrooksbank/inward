<script lang="ts">
    import type { MAIAAssessment } from '$lib/types/domain';
    import RadarChart from '../RadarChart.svelte';
    import { selectProgressScores } from './maia-progress';

    interface Props {
        assessments: MAIAAssessment[];
    }

    const { assessments }: Props = $props();

    const progress = $derived(selectProgressScores(assessments));

    function formatDate(d: Date): string {
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
</script>

<section class="maia-section" aria-labelledby="maia-heading">
    <h2 class="maia-heading" id="maia-heading">Awareness Assessment</h2>

    {#if progress === null}
        <p class="maia-empty">
            Complete the MAIA-2 assessment to see your interoceptive awareness baseline here.
        </p>
    {:else}
        {#if progress.baselineScores}
            <div class="maia-legend" aria-label="Chart legend">
                <span class="legend-item legend-item--current">
                    <span class="legend-dot" aria-hidden="true"></span>
                    Current ({formatDate(progress.currentDate)})
                </span>
                <span class="legend-item legend-item--baseline">
                    <span class="legend-dot legend-dot--baseline" aria-hidden="true"></span>
                    Baseline ({formatDate(progress.baselineDate!)})
                </span>
            </div>
        {:else}
            <p class="maia-date">Assessed {formatDate(progress.currentDate)}</p>
        {/if}

        <RadarChart
            scores={progress.currentScores}
            compareScores={progress.baselineScores ?? undefined}
        />
    {/if}
</section>

<style>
    .maia-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .maia-heading {
        font-size: 1rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .maia-empty {
        font-size: 0.875rem;
        color: #6b7280;
        line-height: 1.5;
        margin: 0;
        padding: 1rem;
        text-align: center;
        background: #f9fafb;
        border-radius: 0.5rem;
    }

    .maia-date {
        font-size: 0.8125rem;
        color: #6b7280;
        margin: 0;
    }

    .maia-legend {
        display: flex;
        gap: 1.25rem;
        flex-wrap: wrap;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.8125rem;
        color: #374151;
    }

    .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #4f46e5;
        flex-shrink: 0;
    }

    .legend-dot--baseline {
        background-color: #f59e0b;
    }
</style>
