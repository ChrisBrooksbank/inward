<script lang="ts">
    import {
        getCalendarCells,
        calculateLongestStreak,
        getMonthLabel,
        navigateMonth,
    } from './streak-calendar';

    interface Props {
        practiceData: Map<string, number>;
        currentStreak: number;
    }

    const { practiceData, currentStreak }: Props = $props();

    let month = $state(new Date());

    const monthLabel = $derived(getMonthLabel(month));
    const cells = $derived(getCalendarCells(month, practiceData));
    const longestStreak = $derived(calculateLongestStreak([...practiceData.keys()]));

    const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    function goToPrev(): void {
        month = navigateMonth(month, -1);
    }

    function goToNext(): void {
        month = navigateMonth(month, 1);
    }
</script>

<div class="streak-calendar" role="region" aria-label="Practice streak calendar">
    <div class="calendar-header">
        <button class="nav-btn" onclick={goToPrev} aria-label="Previous month">&#8249;</button>
        <span class="month-label">{monthLabel}</span>
        <button class="nav-btn" onclick={goToNext} aria-label="Next month">&#8250;</button>
    </div>

    <div class="calendar-grid" role="grid" aria-label={monthLabel}>
        {#each DAY_LABELS as label, i (i)}
            <div class="day-label" role="columnheader" aria-label={label}>{label}</div>
        {/each}

        {#each cells as cell, i (i)}
            {#if cell.date === null}
                <div class="day-cell empty" role="gridcell" aria-hidden="true"></div>
            {:else}
                <div
                    class="day-cell"
                    class:practiced={cell.isPracticed}
                    class:today={cell.isToday}
                    role="gridcell"
                    aria-label="{cell.date.getDate()} {cell.isPracticed
                        ? `${cell.sessionCount} session${cell.sessionCount > 1 ? 's' : ''}`
                        : 'no practice'}{cell.isToday ? ', today' : ''}"
                >
                    <span class="day-number">{cell.date.getDate()}</span>
                </div>
            {/if}
        {/each}
    </div>

    <div class="streak-info">
        <span class="streak-item">
            <span class="streak-icon" aria-hidden="true">🔥</span>
            Current streak: <strong>{currentStreak}</strong>
            {currentStreak === 1 ? 'day' : 'days'}
        </span>
        <span class="streak-item">
            <span class="streak-icon" aria-hidden="true">📅</span>
            Best streak: <strong>{longestStreak}</strong>
            {longestStreak === 1 ? 'day' : 'days'}
        </span>
    </div>
</div>

<style>
    .streak-calendar {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        padding: 1rem;
    }

    .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
    }

    .month-label {
        font-size: 0.9375rem;
        font-weight: 600;
        color: #111827;
    }

    .nav-btn {
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 1.25rem;
        color: #374151;
        padding: 0;
        transition: background-color 0.15s;
    }

    .nav-btn:hover {
        background-color: #f3f4f6;
    }

    .nav-btn:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
    }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        margin-bottom: 0.875rem;
    }

    .day-label {
        text-align: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        padding: 0.25rem 0;
    }

    .day-cell {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        min-height: 32px;
    }

    .day-cell.empty {
        background: transparent;
    }

    .day-number {
        font-size: 0.8125rem;
        color: #374151;
    }

    .day-cell:not(.empty):not(.practiced):not(.today) {
        background-color: #f9fafb;
    }

    .day-cell.practiced {
        background-color: #dbeafe;
    }

    .day-cell.practiced .day-number {
        color: #1d4ed8;
        font-weight: 600;
    }

    .day-cell.today {
        background-color: #2563eb;
        outline: 2px solid #1d4ed8;
        outline-offset: 1px;
    }

    .day-cell.today .day-number {
        color: #ffffff;
        font-weight: 700;
    }

    .day-cell.today.practiced {
        background-color: #1d4ed8;
    }

    .streak-info {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        padding-top: 0.75rem;
        border-top: 1px solid #f3f4f6;
    }

    .streak-item {
        font-size: 0.875rem;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 0.375rem;
    }

    .streak-icon {
        font-size: 1rem;
    }

    @media (prefers-reduced-motion: no-preference) {
        .day-cell {
            transition: background-color 0.1s ease;
        }
    }
</style>
