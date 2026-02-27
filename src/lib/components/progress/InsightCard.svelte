<script lang="ts">
    import type { Insight, InsightType } from './insights';

    interface Props {
        insight: Insight;
    }

    const { insight }: Props = $props();

    const ICONS: Record<InsightType, string> = {
        celebration: '🎉',
        suggestion: '💡',
        pattern: '📊',
        reminder: '📅',
        milestone: '🏆',
    };

    const icon = $derived(ICONS[insight.type]);
</script>

<div class="insight-card insight-{insight.type}" role="article" aria-label={insight.title}>
    <div class="header">
        <span class="icon" aria-hidden="true">{icon}</span>
        <span class="type-label"
            >{insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}</span
        >
    </div>
    <p class="title">{insight.title}</p>
    <p class="body">{insight.body}</p>
    {#if insight.action}
        <a href={insight.action.route} class="action-link">
            {insight.action.label} →
        </a>
    {/if}
</div>

<style>
    .insight-card {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-left: 4px solid #4f46e5;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
    }

    .insight-celebration {
        border-left-color: #f59e0b;
    }

    .insight-suggestion {
        border-left-color: #4f46e5;
    }

    .insight-pattern {
        border-left-color: #0ea5e9;
    }

    .insight-reminder {
        border-left-color: #6b7280;
    }

    .insight-milestone {
        border-left-color: #10b981;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.125rem;
    }

    .icon {
        font-size: 1.125rem;
        line-height: 1;
    }

    .type-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .title {
        font-size: 1rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
        line-height: 1.3;
    }

    .body {
        font-size: 0.875rem;
        color: #374151;
        margin: 0;
        line-height: 1.5;
    }

    .action-link {
        display: inline-block;
        margin-top: 0.25rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #4f46e5;
        text-decoration: none;
        min-height: 44px;
        line-height: 44px;
    }

    .action-link:hover {
        text-decoration: underline;
    }

    .action-link:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
        border-radius: 0.25rem;
    }

    @media (prefers-reduced-motion: reduce) {
        .action-link {
            transition: none;
        }
    }
</style>
