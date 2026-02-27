<script lang="ts">
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>Exercise – Inward</title>
</svelte:head>

<div class="exercise-player">
    <h1>Exercise Player</h1>
    <p>Loading exercise {$page.params.id}…</p>
</div>

<style>
    .exercise-player {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        text-align: center;
    }

    h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #111827;
    }

    p {
        font-size: 1rem;
        color: #6b7280;
    }
</style>
