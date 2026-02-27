<script lang="ts">
    import { NAV_TABS } from './component-props';

    interface Props {
        currentPath: string;
    }

    const { currentPath }: Props = $props();

    function isActive(path: string): boolean {
        return currentPath === path || currentPath.startsWith(path + '/');
    }
</script>

<nav aria-label="Main navigation">
    <ul role="list">
        {#each NAV_TABS as tab}
            {@const active = isActive(tab.path)}
            <li>
                <a href={tab.path} aria-current={active ? 'page' : undefined} class:active>
                    <span class="icon" aria-hidden="true">
                        {#if tab.path === '/dashboard'}
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        {:else if tab.path === '/exercises'}
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        {:else if tab.path === '/vocabulary'}
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                            </svg>
                        {:else}
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                        {/if}
                    </span>
                    <span class="label">{tab.label}</span>
                </a>
            </li>
        {/each}
    </ul>
</nav>

<style>
    nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #ffffff;
        border-top: 1px solid #e5e7eb;
        padding-bottom: env(safe-area-inset-bottom);
        z-index: 100;
    }

    ul {
        display: flex;
        list-style: none;
        margin: 0 auto;
        padding: 0;
        max-width: 640px;
    }

    li {
        flex: 1;
    }

    a {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.5rem 0.25rem;
        text-decoration: none;
        color: #6b7280;
        gap: 0.25rem;
        transition: color 0.15s;
    }

    a:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: -3px;
        border-radius: 0.25rem;
    }

    a.active {
        color: #4f46e5;
    }

    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
    }

    .icon svg {
        width: 24px;
        height: 24px;
    }

    .label {
        font-size: 0.6875rem;
        font-weight: 500;
        line-height: 1;
    }

    @media (prefers-reduced-motion: reduce) {
        a {
            transition: none;
        }
    }
</style>
