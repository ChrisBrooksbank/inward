import { describe, it, expect, beforeEach } from 'vitest';
import { isDismissed, persistDismiss, shouldShowBanner } from './install-prompt';

describe('shouldShowBanner', () => {
    it('returns true when not installed, not dismissed, and has prompt', () => {
        expect(shouldShowBanner({ isInstalled: false, dismissed: false, hasPrompt: true })).toBe(
            true
        );
    });

    it('returns false when already installed', () => {
        expect(shouldShowBanner({ isInstalled: true, dismissed: false, hasPrompt: true })).toBe(
            false
        );
    });

    it('returns false when dismissed', () => {
        expect(shouldShowBanner({ isInstalled: false, dismissed: true, hasPrompt: true })).toBe(
            false
        );
    });

    it('returns false when no prompt available', () => {
        expect(shouldShowBanner({ isInstalled: false, dismissed: false, hasPrompt: false })).toBe(
            false
        );
    });

    it('returns false when all conditions are negative', () => {
        expect(shouldShowBanner({ isInstalled: true, dismissed: true, hasPrompt: false })).toBe(
            false
        );
    });
});

describe('isDismissed', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns false when nothing stored', () => {
        expect(isDismissed()).toBe(false);
    });

    it('returns true after persistDismiss', () => {
        persistDismiss();
        expect(isDismissed()).toBe(true);
    });

    it('returns false for non-true values', () => {
        localStorage.setItem('inward-install-dismissed', 'false');
        expect(isDismissed()).toBe(false);
    });
});

describe('persistDismiss', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('stores dismiss flag in localStorage', () => {
        persistDismiss();
        expect(localStorage.getItem('inward-install-dismissed')).toBe('true');
    });
});
