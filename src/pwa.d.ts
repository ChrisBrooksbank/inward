declare module 'virtual:pwa-register/svelte' {
    import type { Writable } from 'svelte/store';

    interface RegisterSWOptions {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
        onRegisteredSW?: (
            swUrl: string,
            registration: ServiceWorkerRegistration | undefined
        ) => void;
        onRegisterError?: (error: Error) => void;
    }

    function useRegisterSW(options?: RegisterSWOptions): {
        needRefresh: Writable<boolean>;
        offlineReady: Writable<boolean>;
        updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
    };
}
