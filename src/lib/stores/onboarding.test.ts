import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { onboardingStep, TOTAL_STEPS } from './onboarding';
import { DB_NAME, resetDb, putSettings, getSettings } from '$lib/db';
import type { UserProfile } from '$lib/types/domain';

async function deleteTestDb(): Promise<void> {
    return new Promise<void>(resolve => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
    });
}

const profileId = '550e8400-e29b-41d4-a716-446655440030';

const testProfile: UserProfile = {
    id: profileId,
    onboardingComplete: false,
    onboardingStep: 2,
    settings: { reducedMotion: false, fontSize: 'default', notificationsEnabled: false },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
};

beforeEach(async () => {
    resetDb();
    await deleteTestDb();
    onboardingStep.reset();
});

describe('TOTAL_STEPS', () => {
    it('equals 6', () => {
        expect(TOTAL_STEPS).toBe(6);
    });
});

describe('onboardingStep store', () => {
    it('starts at 0', () => {
        expect(get(onboardingStep)).toBe(0);
    });

    it('init loads step from existing DB profile', async () => {
        await putSettings(testProfile);
        await onboardingStep.init();
        expect(get(onboardingStep)).toBe(2);
    });

    it('init stays at 0 when no profile exists', async () => {
        await onboardingStep.init();
        expect(get(onboardingStep)).toBe(0);
    });

    it('advance increments step by 1 and persists to DB', async () => {
        await putSettings(testProfile);
        await onboardingStep.init();
        await onboardingStep.advance();
        expect(get(onboardingStep)).toBe(3);
        const profile = await getSettings();
        expect(profile?.onboardingStep).toBe(3);
        expect(profile?.onboardingComplete).toBe(false);
    });

    it('advance on last step marks onboarding complete', async () => {
        await putSettings({ ...testProfile, onboardingStep: TOTAL_STEPS - 1 });
        await onboardingStep.init();
        await onboardingStep.advance();
        expect(get(onboardingStep)).toBe(TOTAL_STEPS);
        const profile = await getSettings();
        expect(profile?.onboardingComplete).toBe(true);
    });

    it('advance does not exceed TOTAL_STEPS', async () => {
        await putSettings({ ...testProfile, onboardingStep: TOTAL_STEPS });
        await onboardingStep.init();
        await onboardingStep.advance();
        expect(get(onboardingStep)).toBe(TOTAL_STEPS);
    });

    it('advance creates a default profile when none exists', async () => {
        await onboardingStep.advance();
        expect(get(onboardingStep)).toBe(1);
        const profile = await getSettings();
        expect(profile).toBeDefined();
        expect(profile?.onboardingStep).toBe(1);
        expect(profile?.onboardingComplete).toBe(false);
    });

    it('skip sets step to TOTAL_STEPS and marks onboarding complete', async () => {
        await putSettings(testProfile);
        await onboardingStep.init();
        await onboardingStep.skip();
        expect(get(onboardingStep)).toBe(TOTAL_STEPS);
        const profile = await getSettings();
        expect(profile?.onboardingStep).toBe(TOTAL_STEPS);
        expect(profile?.onboardingComplete).toBe(true);
    });

    it('skip creates a default profile when none exists', async () => {
        await onboardingStep.skip();
        expect(get(onboardingStep)).toBe(TOTAL_STEPS);
        const profile = await getSettings();
        expect(profile).toBeDefined();
        expect(profile?.onboardingComplete).toBe(true);
    });

    it('reset returns step to 0 without touching DB', async () => {
        await putSettings(testProfile);
        await onboardingStep.init();
        onboardingStep.reset();
        expect(get(onboardingStep)).toBe(0);
        // DB should be unchanged
        const profile = await getSettings();
        expect(profile?.onboardingStep).toBe(2);
    });

    it('back decrements step by 1 and persists to DB', async () => {
        await putSettings(testProfile);
        await onboardingStep.init();
        await onboardingStep.back();
        expect(get(onboardingStep)).toBe(1);
        const profile = await getSettings();
        expect(profile?.onboardingStep).toBe(1);
    });

    it('back does not go below 0', async () => {
        await putSettings({ ...testProfile, onboardingStep: 0 });
        await onboardingStep.init();
        await onboardingStep.back();
        expect(get(onboardingStep)).toBe(0);
        const profile = await getSettings();
        expect(profile?.onboardingStep).toBe(0);
    });

    it('back creates a default profile when none exists', async () => {
        await onboardingStep.back();
        expect(get(onboardingStep)).toBe(0);
        const profile = await getSettings();
        expect(profile).toBeDefined();
        expect(profile?.onboardingStep).toBe(0);
    });
});
