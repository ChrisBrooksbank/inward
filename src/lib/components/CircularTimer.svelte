<script lang="ts">
    import { circumference, arcOffset, formatSeconds } from './circular-timer';

    interface Props {
        remainingSeconds: number;
        totalSeconds: number;
        isPaused: boolean;
        minimal?: boolean;
    }

    const { remainingSeconds, totalSeconds, isPaused, minimal = false }: Props = $props();

    const R = 40;
    const CX = 50;
    const CY = 50;
    const C = circumference(R);

    const offset = $derived(arcOffset(R, remainingSeconds, totalSeconds));
    const timeLabel = $derived(formatSeconds(remainingSeconds));
    const ariaLabel = $derived(`${timeLabel} seconds remaining${isPaused ? ', paused' : ''}`);
</script>

{#if minimal}
    <span class="timer-minimal" aria-live="polite" aria-label={ariaLabel}>
        {timeLabel}
    </span>
{:else}
    <div class="timer-circular">
        <svg viewBox="0 0 100 100" class="timer-svg" role="img" aria-label={ariaLabel}>
            <title>{ariaLabel}</title>

            <!-- Track circle (background) -->
            <circle cx={CX} cy={CY} r={R} class="timer-track" aria-hidden="true" />

            <!-- Countdown arc — starts at 12 o'clock via rotate(-90) -->
            <circle
                cx={CX}
                cy={CY}
                r={R}
                class="timer-arc"
                class:timer-arc--paused={isPaused}
                stroke-dasharray={C}
                stroke-dashoffset={offset}
                transform={`rotate(-90, ${CX}, ${CY})`}
                aria-hidden="true"
            />
        </svg>

        <!-- Centred time text, hidden from AT (SVG title covers it) -->
        <span class="timer-text" aria-hidden="true">{timeLabel}</span>

        <!-- Live region so screen readers hear time at key moments -->
        <span class="sr-only" aria-live="polite" aria-atomic="true">
            {ariaLabel}
        </span>
    </div>
{/if}

<style>
    /* ── Circular layout ─────────────────────────────────── */
    .timer-circular {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
    }

    .timer-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
    }

    /* Centred digit text */
    .timer-text {
        position: relative;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
        line-height: 1;
        z-index: 1;
    }

    /* ── SVG circles ─────────────────────────────────────── */
    .timer-track {
        fill: none;
        stroke: #e5e7eb;
        stroke-width: 8;
    }

    .timer-arc {
        fill: none;
        stroke: #4f46e5;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.9s linear;
    }

    .timer-arc--paused {
        stroke: #9ca3af;
        transition: none;
    }

    /* ── Minimal mode ────────────────────────────────────── */
    .timer-minimal {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        line-height: 1;
    }

    /* ── Accessibility ───────────────────────────────────── */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
    }

    /* Disable all transitions when user prefers reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .timer-arc {
            transition: none;
        }
    }
</style>
