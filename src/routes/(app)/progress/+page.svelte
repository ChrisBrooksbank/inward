<script lang="ts">
    import { onMount } from 'svelte';
    import { PageShell, QuickStats } from '$lib/components';
    import { calculateQuickStats } from '$lib/components/progress/quick-stats';
    import type { QuickStatsData } from '$lib/components/progress/quick-stats';
    import { getAllSessions, getAllDescriptions } from '$lib/db';

    let stats = $state<QuickStatsData>({
        totalSessions: 0,
        uniqueWords: 0,
        streakDays: 0,
        regionsExplored: 0,
    });
    let loading = $state(true);

    onMount(async () => {
        const [sessions, descriptions] = await Promise.all([
            getAllSessions(),
            getAllDescriptions(),
        ]);
        stats = calculateQuickStats(sessions, descriptions);
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
    {/if}
</PageShell>

<style>
    .loading-text {
        color: #6b7280;
        text-align: center;
        padding: 2rem 0;
    }
</style>
