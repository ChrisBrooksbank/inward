<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        title?: string;
        children: Snippet;
    }

    const { title, children }: Props = $props();
</script>

<div class="page-shell">
    {#if title}
        <header class="page-header">
            <h1>{title}</h1>
        </header>
    {/if}
    <main class="page-content">
        {@render children()}
    </main>
</div>

<style>
    .page-shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        /* Reserve space for fixed BottomNav (approx 64px + safe area) */
        padding-bottom: calc(64px + env(safe-area-inset-bottom));
    }

    .page-header {
        position: sticky;
        top: 0;
        z-index: 10;
        padding: 1rem 1.25rem 0.75rem;
        background-color: #ffffff;
        border-bottom: 1px solid #e5e7eb;
    }

    .page-header h1 {
        font-size: 1.375rem;
        font-weight: 700;
        color: #111827;
        line-height: 1.3;
    }

    .page-content {
        flex: 1;
        padding: 1.25rem;
    }
</style>
