<script lang="ts">
    import type { BodyRegion } from '$lib/types/domain';
    import {
        REGION_SLOTS,
        TOTAL_REGIONS,
        getRegionColor,
        getRegionTextColor,
        countPracticedRegions,
    } from './body-coverage';

    interface Props {
        practicedRegions: Map<BodyRegion, number>;
        highlightStrength?: boolean;
    }

    const { practicedRegions, highlightStrength = true }: Props = $props();

    const practicedCount = $derived(countPracticedRegions(practicedRegions));
</script>

<div class="body-coverage" role="region" aria-label="Body coverage map">
    <h3 class="section-title">Body Coverage</h3>

    <figure class="body-figure">
        <!--
            viewBox="0 0 200 380": schematic front-view body with all 16 regions.
            Bilateral regions (arms, hands, legs, feet) show two rects with the same color.
        -->
        <svg
            viewBox="0 0 200 380"
            class="body-svg"
            role="img"
            aria-label="Schematic body map showing practiced regions"
        >
            <title>Body Coverage Map</title>

            {#each REGION_SLOTS as slot}
                {@const count = practicedRegions.get(slot.region) ?? 0}
                {@const fill = getRegionColor(count, highlightStrength)}
                {@const textFill = getRegionTextColor(count, highlightStrength)}

                {#each slot.rects as rect, i}
                    <rect
                        x={rect.x}
                        y={rect.y}
                        width={rect.w}
                        height={rect.h}
                        {fill}
                        rx="3"
                        aria-hidden="true"
                    />
                    {#if i === 0}
                        <text
                            x={slot.labelX}
                            y={slot.labelY}
                            font-size="7"
                            font-family="inherit"
                            text-anchor="middle"
                            dominant-baseline="middle"
                            fill={textFill}
                            aria-hidden="true">{slot.label}</text
                        >
                    {/if}
                {/each}
            {/each}
        </svg>

        <!-- Screen-reader accessible list of all region practice counts -->
        <ul class="sr-only" aria-label="Body region practice counts">
            {#each REGION_SLOTS as slot}
                {@const count = practicedRegions.get(slot.region) ?? 0}
                <li>
                    {slot.label}: {count === 0
                        ? 'not yet practiced'
                        : `${count} session${count !== 1 ? 's' : ''}`}
                </li>
            {/each}
        </ul>
    </figure>

    {#if highlightStrength}
        <div class="legend" aria-hidden="true">
            <span class="legend-item">
                <span class="swatch" style="background: #e5e7eb"></span>None
            </span>
            <span class="legend-item">
                <span class="swatch" style="background: #bfdbfe"></span>1–2
            </span>
            <span class="legend-item">
                <span class="swatch" style="background: #60a5fa"></span>3–5
            </span>
            <span class="legend-item">
                <span class="swatch" style="background: #1d4ed8"></span>6+
            </span>
        </div>
    {/if}

    <p class="coverage-summary">
        Practiced: <strong>{practicedCount}/{TOTAL_REGIONS}</strong> body regions
    </p>
</div>

<style>
    .body-coverage {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        padding: 1rem;
    }

    .section-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #111827;
        margin: 0 0 0.75rem;
    }

    .body-figure {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .body-svg {
        width: 100%;
        max-width: 200px;
        display: block;
    }

    .legend {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.625rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: #6b7280;
    }

    .swatch {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 2px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
    }

    .coverage-summary {
        font-size: 0.875rem;
        color: #374151;
        margin: 0.625rem 0 0;
        text-align: center;
    }

    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    @media (prefers-reduced-motion: reduce) {
        .body-svg * {
            transition: none;
        }
    }
</style>
