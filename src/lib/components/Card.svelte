<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { CardPadding } from './component-props';

    interface Props {
        children: Snippet;
        padding?: CardPadding;
    }

    const { children, padding = 'md' }: Props = $props();
</script>

<div class="card card-padding-{padding}">
    {@render children()}
</div>

<style>
    .card {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .card-padding-sm {
        padding: 0.75rem;
    }

    .card-padding-md {
        padding: 1.25rem;
    }

    .card-padding-lg {
        padding: 2rem;
    }
</style>
