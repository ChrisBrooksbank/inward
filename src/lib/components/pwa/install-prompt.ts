const DISMISS_KEY = 'inward-install-dismissed';

export function isDismissed(): boolean {
    return typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === 'true';
}

export function persistDismiss(): void {
    localStorage.setItem(DISMISS_KEY, 'true');
}

export function isStandalone(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
}

export function shouldShowBanner(opts: {
    isInstalled: boolean;
    dismissed: boolean;
    hasPrompt: boolean;
}): boolean {
    return !opts.isInstalled && !opts.dismissed && opts.hasPrompt;
}
