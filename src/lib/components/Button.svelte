<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { ButtonVariant, ButtonType } from './component-props';

    interface Props {
        variant?: ButtonVariant;
        type?: ButtonType;
        disabled?: boolean;
        onclick?: () => void;
        children: Snippet;
    }

    const {
        variant = 'primary',
        type = 'button',
        disabled = false,
        onclick,
        children,
    }: Props = $props();
</script>

<button {type} {disabled} class="btn btn-{variant}" {onclick} aria-disabled={disabled}>
    {@render children()}
</button>

<style>
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        min-width: 44px;
        padding: 0.5rem 1.25rem;
        border-radius: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        border: 2px solid transparent;
        transition:
            background-color 0.15s,
            color 0.15s,
            border-color 0.15s;
        text-decoration: none;
    }

    .btn:focus-visible {
        outline: 3px solid #4f46e5;
        outline-offset: 2px;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-primary {
        background-color: #4f46e5;
        color: #ffffff;
        border-color: #4f46e5;
    }

    .btn-primary:hover:not(:disabled) {
        background-color: #4338ca;
        border-color: #4338ca;
    }

    .btn-secondary {
        background-color: #ffffff;
        color: #4f46e5;
        border-color: #4f46e5;
    }

    .btn-secondary:hover:not(:disabled) {
        background-color: #eef2ff;
    }

    .btn-ghost {
        background-color: transparent;
        color: #374151;
        border-color: transparent;
    }

    .btn-ghost:hover:not(:disabled) {
        background-color: #f3f4f6;
    }
</style>
