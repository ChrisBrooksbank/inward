import { describe, it, expect, beforeEach } from 'vitest';
import { getOnboardingRedirect } from './routeGuard';
import { DB_NAME, resetDb, putSettings } from '$lib/db';
import type { UserProfile } from '$lib/types/domain';

async function deleteTestDb(): Promise<void> {
    return new Promise<void>(resolve => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
    });
}

const testProfile: UserProfile = {
    id: '550e8400-e29b-41d4-a716-446655440099',
    onboardingComplete: false,
    onboardingStep: 0,
    settings: { reducedMotion: false, fontSize: 'default', notificationsEnabled: false },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
};

beforeEach(async () => {
    resetDb();
    await deleteTestDb();
});

describe('getOnboardingRedirect', () => {
    it('returns /onboarding when no profile exists', async () => {
        const result = await getOnboardingRedirect();
        expect(result).toBe('/onboarding');
    });

    it('returns /onboarding when onboardingComplete is false', async () => {
        await putSettings({ ...testProfile, onboardingComplete: false });
        const result = await getOnboardingRedirect();
        expect(result).toBe('/onboarding');
    });

    it('returns null when onboardingComplete is true', async () => {
        await putSettings({ ...testProfile, onboardingComplete: true });
        const result = await getOnboardingRedirect();
        expect(result).toBeNull();
    });
});
