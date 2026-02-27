// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    interface BeforeInstallPromptEvent extends Event {
        readonly platforms: string[];
        prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
    }

    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
        appinstalled: Event;
    }
}

export {};
