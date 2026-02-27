<script lang="ts">
    const { children } = $props();
</script>

<div class="exercise-shell">
    <main class="exercise-content">
        {@render children()}
    </main>
</div>

<style>
    .exercise-shell {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        background-color: #ffffff;
    }

    .exercise-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 1.5rem;
        max-width: 640px;
        margin: 0 auto;
        width: 100%;
    }
</style>
