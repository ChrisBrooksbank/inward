<script lang="ts">
    import { Button } from '$lib/components';
    import { CONSENT_DETAILS } from './sync-consent';

    interface Props {
        open: boolean;
        onAccept: () => void;
        onDecline: () => void;
    }

    const { open, onAccept, onDecline }: Props = $props();
</script>

{#if open}
    <div class="overlay" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <div class="dialog">
            <h2 id="consent-title" class="dialog-title">Enable Vocabulary Sync?</h2>
            <p class="dialog-intro">
                Inward can anonymously share vocabulary with other users so everyone benefits from
                collective descriptions. Before enabling sync, here is exactly what leaves your
                device:
            </p>
            <ul class="consent-list" aria-label="Data that leaves your device">
                {#each CONSENT_DETAILS as detail}
                    <li>{detail}</li>
                {/each}
            </ul>
            <p class="privacy-note">
                Nothing else leaves your device. No account required. No tracking. You can turn off
                sharing at any time by changing a description back to private.
            </p>
            <div class="dialog-actions">
                <Button variant="primary" onclick={onAccept}>Enable Sync</Button>
                <Button variant="ghost" onclick={onDecline}>Not Now</Button>
            </div>
        </div>
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 1rem;
    }

    .dialog {
        background: #ffffff;
        border-radius: 1rem;
        padding: 1.5rem;
        max-width: 420px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .dialog-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    .dialog-intro {
        font-size: 0.875rem;
        color: #374151;
        margin: 0;
        line-height: 1.5;
    }

    .consent-list {
        font-size: 0.875rem;
        color: #374151;
        margin: 0;
        padding-left: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        line-height: 1.5;
    }

    .privacy-note {
        font-size: 0.8125rem;
        color: #6b7280;
        margin: 0;
        line-height: 1.5;
    }

    .dialog-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    @media (prefers-reduced-motion: reduce) {
        .overlay {
            transition: none;
        }
    }
</style>
