<script lang="ts">
    import type { MAIAScore } from '$lib/types/domain';
    import {
        SUBSCALE_ORDER,
        SUBSCALE_LABELS,
        GRID_LEVELS,
        MAX_SCORE,
        axisAngle,
        polarToCart,
        buildPath,
        labelTextAnchor,
        labelDy,
        getScoreValue,
    } from './radar-chart';

    interface Props {
        scores: MAIAScore[];
        compareScores?: MAIAScore[];
    }

    const { scores, compareScores }: Props = $props();

    // Chart geometry constants (all in SVG user-space units)
    const CX = 150;
    const CY = 150;
    const CHART_R = 95;
    const LABEL_R = 125;
    const N = SUBSCALE_ORDER.length;

    function gridPolygonPath(level: number): string {
        const r = (level / MAX_SCORE) * CHART_R;
        const pts = SUBSCALE_ORDER.map((_, i) => polarToCart(CX, CY, r, axisAngle(i, N)));
        return buildPath(pts);
    }

    const dataPath = $derived(
        buildPath(
            SUBSCALE_ORDER.map((subscale, i) => {
                const r = (getScoreValue(scores, subscale) / MAX_SCORE) * CHART_R;
                return polarToCart(CX, CY, r, axisAngle(i, N));
            })
        )
    );

    const comparePath = $derived(
        compareScores
            ? buildPath(
                  SUBSCALE_ORDER.map((subscale, i) => {
                      const r = (getScoreValue(compareScores, subscale) / MAX_SCORE) * CHART_R;
                      return polarToCart(CX, CY, r, axisAngle(i, N));
                  })
              )
            : null
    );
</script>

<!--
    viewBox adds padding around the 300×300 chart area to accommodate labels
    that extend beyond the chart radius.  The extra space:
      left/right: 50 px each    top/bottom: 35 px each
-->
<figure class="radar-chart">
    <svg
        viewBox="-50 -35 400 370"
        class="radar-svg"
        role="img"
        aria-label="Radar chart showing MAIA-2 interoceptive awareness scores"
    >
        <title>MAIA-2 Interoceptive Awareness — Radar Chart</title>

        <!-- Background grid polygons -->
        {#each GRID_LEVELS as level}
            <path
                d={gridPolygonPath(level)}
                fill="none"
                stroke="#e5e7eb"
                stroke-width="1"
                aria-hidden="true"
            />
        {/each}

        <!-- Axis lines from center to each tip -->
        {#each SUBSCALE_ORDER as _subscale, i}
            {@const tip = polarToCart(CX, CY, CHART_R, axisAngle(i, N))}
            <line
                x1={CX}
                y1={CY}
                x2={tip.x}
                y2={tip.y}
                stroke="#e5e7eb"
                stroke-width="1"
                aria-hidden="true"
            />
        {/each}

        <!-- Baseline (comparison) polygon — rendered behind current -->
        {#if comparePath}
            <path
                d={comparePath}
                fill="#f59e0b"
                fill-opacity="0.15"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-dasharray="5 3"
                aria-hidden="true"
            />
            {#each SUBSCALE_ORDER as subscale, i}
                {@const r = (getScoreValue(compareScores!, subscale) / MAX_SCORE) * CHART_R}
                {@const dot = polarToCart(CX, CY, r, axisAngle(i, N))}
                <circle cx={dot.x} cy={dot.y} r="3" fill="#f59e0b" aria-hidden="true" />
            {/each}
        {/if}

        <!-- Filled data polygon (current) -->
        <path
            d={dataPath}
            fill="#4f46e5"
            fill-opacity="0.25"
            stroke="#4f46e5"
            stroke-width="2"
            stroke-linejoin="round"
            aria-hidden="true"
        />

        <!-- Data point dots at each axis (current) -->
        {#each SUBSCALE_ORDER as subscale, i}
            {@const r = (getScoreValue(scores, subscale) / MAX_SCORE) * CHART_R}
            {@const dot = polarToCart(CX, CY, r, axisAngle(i, N))}
            <circle cx={dot.x} cy={dot.y} r="3" fill="#4f46e5" aria-hidden="true" />
        {/each}

        <!-- Axis labels -->
        {#each SUBSCALE_ORDER as subscale, i}
            {@const lp = polarToCart(CX, CY, LABEL_R, axisAngle(i, N))}
            <text
                x={lp.x}
                y={lp.y}
                font-size="10"
                font-family="inherit"
                text-anchor={labelTextAnchor(i, N)}
                dy={labelDy(i, N)}
                fill="#374151"
                aria-hidden="true"
            >
                {SUBSCALE_LABELS[subscale]}
            </text>
        {/each}

        <!-- Score level markers on the vertical axis (right-side reference) -->
        {#each GRID_LEVELS as level}
            {@const marker = polarToCart(CX, CY, (level / MAX_SCORE) * CHART_R, axisAngle(2, N))}
            <text
                x={marker.x + 3}
                y={marker.y}
                font-size="8"
                font-family="inherit"
                text-anchor="start"
                dy="0.35em"
                fill="#9ca3af"
                aria-hidden="true"
            >
                {level}
            </text>
        {/each}
    </svg>

    <!-- Screen-reader accessible score list -->
    <ul class="sr-only" aria-label="MAIA-2 subscale scores">
        {#each SUBSCALE_ORDER as subscale}
            <li>
                {SUBSCALE_LABELS[subscale]}: {getScoreValue(scores, subscale).toFixed(1)} out of 5{#if compareScores}
                    (baseline: {getScoreValue(compareScores, subscale).toFixed(1)}){/if}
            </li>
        {/each}
    </ul>
</figure>

<style>
    .radar-chart {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .radar-svg {
        width: 100%;
        max-width: 300px;
        display: block;
        overflow: visible;
    }

    @media (prefers-reduced-motion: reduce) {
        .radar-svg * {
            transition: none;
        }
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
</style>
