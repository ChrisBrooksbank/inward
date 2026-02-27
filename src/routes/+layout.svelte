<script lang="ts">
    import { InstallPrompt, UpdateNotification } from '$lib/components';

    const { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<UpdateNotification />
<InstallPrompt />
{@render children()}

<style>
    :global(:root) {
        --color-focus: #2563eb;
    }

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

    /* Reduced motion: disable animations and transitions */
    @media (prefers-reduced-motion: reduce) {
        :global(*, *::before, *::after) {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }

    /* High contrast: stronger focus ring */
    @media (prefers-contrast: more) {
        :global(:root) {
            --color-focus: #000000;
        }
    }

    /* Touch targets: 44×44px minimum for interactive elements */
    :global(button) {
        min-height: 44px;
        min-width: 44px;
    }

    :global(input:not([type='checkbox']):not([type='radio'])),
    :global(select),
    :global(textarea) {
        min-height: 44px;
    }

    :global(input[type='checkbox']),
    :global(input[type='radio']) {
        min-width: 24px;
        min-height: 24px;
    }

    /* Visible focus indicators for keyboard navigation */
    :global(:focus-visible) {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
        border-radius: 2px;
    }
</style>
