<script lang="ts">
    import { onMount } from 'svelte';
    import type { BodyRegion, MAIAAssessment } from '$lib/types/domain';
    import {
        PageShell,
        QuickStats,
        StreakCalendar,
        BodyCoverage,
        MAIAProgressSection,
        InsightCard,
        TrendsCharts,
    } from '$lib/components';
    import { calculateQuickStats } from '$lib/components/progress/quick-stats';
    import type { QuickStatsData } from '$lib/components/progress/quick-stats';
    import { buildPracticeMap } from '$lib/components/progress/streak-calendar';
    import { buildRegionCoverage } from '$lib/components/progress/body-coverage';
    import { generateInsights } from '$lib/components/progress/insights';
    import type { Insight } from '$lib/components/progress/insights';
    import { buildSessionsPerWeek, buildVocabularyGrowth } from '$lib/components/progress/trends';
    import type { WeeklySessionData, VocabGrowthPoint } from '$lib/components/progress/trends';
    import { getAllSessions, getAllDescriptions, getAllAssessments } from '$lib/db';

    let stats = $state<QuickStatsData>({
        totalSessions: 0,
        uniqueWords: 0,
        streakDays: 0,
        regionsExplored: 0,
    });
    let practiceData = $state<Map<string, number>>(new Map());
    let regionCoverage = $state<Map<BodyRegion, number>>(new Map());
    let assessments = $state<MAIAAssessment[]>([]);
    let insights = $state<Insight[]>([]);
    let sessionsPerWeek = $state<WeeklySessionData[]>([]);
    let vocabGrowth = $state<VocabGrowthPoint[]>([]);
    let loading = $state(true);

    onMount(async () => {
        const [sessions, descriptions, allAssessments] = await Promise.all([
            getAllSessions(),
            getAllDescriptions(),
            getAllAssessments(),
        ]);
        stats = calculateQuickStats(sessions, descriptions);
        practiceData = buildPracticeMap(sessions);
        regionCoverage = buildRegionCoverage(sessions, descriptions);
        assessments = allAssessments;
        insights = generateInsights({
            sessions,
            assessments: allAssessments,
            descriptions,
            currentStreak: stats.streakDays,
        });
        sessionsPerWeek = buildSessionsPerWeek(sessions);
        vocabGrowth = buildVocabularyGrowth(descriptions);
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
        <BodyCoverage practicedRegions={regionCoverage} />
        <MAIAProgressSection {assessments} />
        <TrendsCharts {sessionsPerWeek} {vocabGrowth} />
        {#if insights.length > 0}
            <section class="insights-section" aria-label="Insights">
                <h2 class="section-heading">Insights</h2>
                <div class="insights-list">
                    {#each insights as insight (insight.id)}
                        <InsightCard {insight} />
                    {/each}
                </div>
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

    .insights-section {
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

    .insights-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
</style>
