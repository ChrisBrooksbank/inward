/**
 * Onboarding step store — tracks and persists the current onboarding step.
 * Reads from and writes to IndexedDB so the flow resumes after page refresh.
 */

import { writable } from 'svelte/store';
import { getSettings, putSettings } from '$lib/db';
import type { UserProfile } from '$lib/types/domain';

export const TOTAL_STEPS = 6;

function createDefaultProfile(): UserProfile {
    const now = new Date();
    return {
        id: crypto.randomUUID(),
        onboardingComplete: false,
        onboardingStep: 0,
        settings: { reducedMotion: false, fontSize: 'default', notificationsEnabled: false },
        createdAt: now,
        updatedAt: now,
    };
}

async function loadOrCreateProfile(): Promise<UserProfile> {
    const existing = await getSettings();
    if (existing) return existing;
    const fresh = createDefaultProfile();
    await putSettings(fresh);
    return fresh;
}

function createOnboardingStore() {
    const { subscribe, set } = writable<number>(0);

    async function init(): Promise<void> {
        const profile = await getSettings();
        set(profile?.onboardingStep ?? 0);
    }

    async function advance(): Promise<void> {
        const profile = await loadOrCreateProfile();
        const next = Math.min(profile.onboardingStep + 1, TOTAL_STEPS);
        const isComplete = next >= TOTAL_STEPS;
        await putSettings({
            ...profile,
            onboardingStep: next,
            onboardingComplete: isComplete,
            updatedAt: new Date(),
        });
        set(next);
    }

    async function skip(): Promise<void> {
        const profile = await loadOrCreateProfile();
        await putSettings({
            ...profile,
            onboardingStep: TOTAL_STEPS,
            onboardingComplete: true,
            updatedAt: new Date(),
        });
        set(TOTAL_STEPS);
    }

    async function back(): Promise<void> {
        const profile = await loadOrCreateProfile();
        const prev = Math.max(profile.onboardingStep - 1, 0);
        await putSettings({ ...profile, onboardingStep: prev, updatedAt: new Date() });
        set(prev);
    }

    function reset(): void {
        set(0);
    }

    return { subscribe, init, advance, back, skip, reset };
}

export const onboardingStep = createOnboardingStore();
