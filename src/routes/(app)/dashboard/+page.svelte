<script lang="ts">
    import { onMount } from 'svelte';
    import { PageShell, QuickStats } from '$lib/components';
    import { buildDashboardData } from '$lib/components/dashboard/dashboard-data';
    import type { DashboardData } from '$lib/components/dashboard/dashboard-data';
    import type { QuickStatsData } from '$lib/components/progress/quick-stats';
    import { getAllSessions, getAllDescriptions } from '$lib/db';

    let loading = $state(true);
    let stats = $state<QuickStatsData>({
        totalSessions: 0,
        uniqueWords: 0,
        streakDays: 0,
        regionsExplored: 0,
    });
    let data = $state<DashboardData | null>(null);

    onMount(async () => {
        const [sessions, descriptions] = await Promise.all([
            getAllSessions(),
            getAllDescriptions(),
        ]);
        data = buildDashboardData(sessions, descriptions);
        stats = data.stats;
        loading = false;
    });
</script>

<svelte:head>
    <title>Dashboard – Inward</title>
</svelte:head>

<PageShell title="Dashboard">
    {#if loading}
        <p class="loading-text">Loading your dashboard...</p>
    {:else if data}
        <QuickStats {stats} />

        <div class="cta-section">
            <a class="cta-btn" href="/exercise/{data.nextExerciseId}">Start Exercise</a>
        </div>

        {#if data.recentSessions.length > 0}
            <section class="recent-section" aria-label="Recent sessions">
                <h2 class="section-heading">Recent Sessions</h2>
                <ul class="session-list">
                    {#each data.recentSessions as session (session.id)}
                        <li class="session-item">
                            <span class="session-name">{session.exerciseName}</span>
                            <span class="session-meta">
                                {session.descriptionsCount} description{session.descriptionsCount ===
                                1
                                    ? ''
                                    : 's'}
                            </span>
                        </li>
                    {/each}
                </ul>
            </section>
        {/if}
    {/if}
</PageShell>

<style>
    .loading-text {
        color: #6b7280;
        text-align: center;
        padding: 2rem 0;
    }

    .cta-section {
        display: flex;
        justify-content: center;
        padding: 1rem 0;
    }

    .cta-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        text-decoration: none;
        background-color: #4f46e5;
        color: #ffffff;
        border: 2px solid #4f46e5;
    }

    .cta-btn:hover {
        background-color: #4338ca;
        border-color: #4338ca;
    }

    .cta-btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .recent-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .section-heading {
        font-size: 1rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .session-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .session-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: #f9fafb;
        border-radius: 0.5rem;
    }

    .session-name {
        font-weight: 600;
        color: #111827;
        font-size: 0.875rem;
    }

    .session-meta {
        font-size: 0.8125rem;
        color: #6b7280;
    }
</style>
