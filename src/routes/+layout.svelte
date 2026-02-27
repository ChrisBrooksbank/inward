<script lang="ts">
    const { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

{@render children()}

<style>
    :global(*, *::before, *::after) {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    :global(html) {
        font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
            'Open Sans', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    :global(body) {
        min-height: 100vh;
        background-color: #f9fafb;
        color: #111827;
    }
</style>
