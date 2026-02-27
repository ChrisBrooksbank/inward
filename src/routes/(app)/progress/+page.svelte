<script lang="ts">
    import { onMount } from 'svelte';
    import { PageShell, QuickStats, StreakCalendar } from '$lib/components';
    import { calculateQuickStats } from '$lib/components/progress/quick-stats';
    import type { QuickStatsData } from '$lib/components/progress/quick-stats';
    import { buildPracticeMap } from '$lib/components/progress/streak-calendar';
    import { getAllSessions, getAllDescriptions } from '$lib/db';

    let stats = $state<QuickStatsData>({
        totalSessions: 0,
        uniqueWords: 0,
        streakDays: 0,
        regionsExplored: 0,
    });
    let practiceData = $state<Map<string, number>>(new Map());
    let loading = $state(true);

    onMount(async () => {
        const [sessions, descriptions] = await Promise.all([
            getAllSessions(),
            getAllDescriptions(),
        ]);
        stats = calculateQuickStats(sessions, descriptions);
        practiceData = buildPracticeMap(sessions);
        loading = false;
    });
</script>

<svelte:head>
    <title>Progress – Inward</title>
</svelte:head>

<PageShell title="Progress">
    {#if loading}
        <p class="loading-text">Loading your progress...</p>
    {:else}
        <QuickStats {stats} />
        <StreakCalendar {practiceData} currentStreak={stats.streakDays} />
    {/if}
</PageShell>

<style>
    .loading-text {
        color: #6b7280;
        text-align: center;
        padding: 2rem 0;
    }
</style>
