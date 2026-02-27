<script lang="ts">
    import type { SensationDescription, SharingLevel } from '$lib/types/domain';
    import { toCardData, nextSharingLevel } from './description-card';

    interface Props {
        description: SensationDescription;
        onShareLevelChange?: (level: SharingLevel) => void;
    }

    const { description, onShareLevelChange }: Props = $props();

    const card = $derived(toCardData(description));

    function handleShareToggle(): void {
        onShareLevelChange?.(nextSharingLevel(description.sharingLevel));
    }
</script>

<article class="description-card" aria-label="Vocabulary entry: {card.text}">
    <p class="card-text">{card.text}</p>

    <div class="card-meta">
        <span class="badge badge-region">{card.region}</span>
        <span class="badge badge-category">{card.category}</span>

        {#if card.signalType}
            <span class="badge badge-signal">{card.signalType}</span>
        {/if}

        {#if card.emotionConnection}
            <span class="badge badge-emotion">{card.emotionConnection}</span>
        {/if}

        {#if card.fromExercise}
            <span class="badge badge-exercise">From exercise</span>
        {/if}
    </div>

    <div class="card-footer">
        <time class="card-date" datetime={description.createdAt.toISOString()}>
            {card.createdLabel}
        </time>

        {#if card.updatedLabel}
            <span class="card-updated">
                Edited {card.updatedLabel}
            </span>
        {/if}
    </div>

    <div class="card-sharing">
        <span
            class="sharing-badge sharing-badge--{card.sharingLevel}"
            title={card.sharingDescription}
            aria-label="Sharing: {card.sharingLabel} — {card.sharingDescription}"
        >
            {card.sharingLabel}
        </span>

        {#if onShareLevelChange}
            <button
                class="sharing-toggle"
                onclick={handleShareToggle}
                aria-label="Change sharing level (currently {card.sharingLabel})"
                title="Cycle sharing level"
            >
                Change
            </button>
        {/if}
    </div>
</article>

<style>
    .description-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.875rem 1rem;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    }

    .card-text {
        font-size: 1rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
        line-height: 1.4;
    }

    .card-meta {
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

    .badge-signal {
        background: #e0f2fe;
        color: #0369a1;
    }

    .badge-emotion {
        background: #fce7f3;
        color: #9d174d;
    }

    .badge-exercise {
        background: #fef3c7;
        color: #92400e;
    }

    .card-footer {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .card-date {
        font-size: 0.6875rem;
        color: #9ca3af;
    }

    .card-updated {
        font-size: 0.6875rem;
        color: #9ca3af;
        font-style: italic;
    }

    .card-sharing {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-top: 0.25rem;
        border-top: 1px solid #f3f4f6;
    }

    .sharing-badge {
        display: inline-flex;
        align-items: center;
        font-size: 0.6875rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        line-height: 1.6;
    }

    .sharing-badge--private {
        background: #f3f4f6;
        color: #374151;
    }

    .sharing-badge--anonymous {
        background: #ecfdf5;
        color: #065f46;
    }

    .sharing-badge--attributed {
        background: #eff6ff;
        color: #1d4ed8;
    }

    .sharing-toggle {
        font-size: 0.6875rem;
        font-weight: 500;
        color: #6b7280;
        background: none;
        border: none;
        padding: 0.125rem 0.375rem;
        min-height: 44px;
        min-width: 44px;
        border-radius: 0.25rem;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
    }

    .sharing-toggle:hover {
        color: #374151;
    }

    .sharing-toggle:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }
</style>
