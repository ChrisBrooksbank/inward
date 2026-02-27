<script lang="ts">
    import type { QuickStatsData } from './quick-stats';

    interface Props {
        stats: QuickStatsData;
    }

    const { stats }: Props = $props();
</script>

<div class="quick-stats" role="region" aria-label="Quick stats">
    <div class="stat-tile">
        <span class="stat-value">{stats.totalSessions}</span>
        <span class="stat-label">Sessions</span>
        <span class="stat-sub">completed</span>
    </div>
    <div class="stat-tile">
        <span class="stat-value">{stats.uniqueWords}</span>
        <span class="stat-label">Words</span>
        <span class="stat-sub">created</span>
    </div>
    <div class="stat-tile">
        <span class="stat-value">{stats.streakDays}</span>
        <span class="stat-label">Days</span>
        <span class="stat-sub">streak</span>
    </div>
    <div class="stat-tile">
        <span class="stat-value">{stats.regionsExplored}</span>
        <span class="stat-label">Regions</span>
        <span class="stat-sub">covered</span>
    </div>
</div>

<style>
    .quick-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
    }

    .stat-tile {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        padding: 1rem 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
        line-height: 1;
        margin-bottom: 0.25rem;
    }

    .stat-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.125rem;
    }

    .stat-sub {
        font-size: 0.75rem;
        color: #6b7280;
    }
</style>
